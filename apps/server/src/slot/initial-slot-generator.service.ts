import { DateTime } from 'luxon';
import { DatabaseService } from '../database/database.service.js';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

@Injectable()
export class generateInitialSlots {
  constructor(private prisma: DatabaseService) {}
  async generateInitialSlot(scheduleId: string) {
    if (!scheduleId)
      throw new BadRequestException({
        message: 'Schedule ID is required',
        code: 'SCHEDULE_ID_REQUIRED',
      });

    const schedule = await this.prisma.schedule.findUniqueOrThrow({
      where: { id: scheduleId },
    });
    const doctorHospitalProfile =
      await this.prisma.doctorHospitalProfile.findUnique({
        where: {
          doctorId_hospitalId: {
            doctorId: schedule.doctorId,
            hospitalId: schedule.hospitalId,
          },
        },
        include: { Hospital: true, Doctor: true },
      });
    if (!doctorHospitalProfile)
      throw new BadRequestException({
        message: 'doctor to hospital mapping not found in DB',
        code: 'DOCTOR_HOSPITAL_MAPPING_NOT_FOUND',
      });

    if (doctorHospitalProfile.Doctor?.isDeactivated) {
      throw new BadRequestException({
        message: 'Doctor deactivated, skipping slot generation',
        code: 'DOCTOR_DEACTIVATED',
      });
    }

    if (doctorHospitalProfile.Hospital?.isDeactivated) {
      throw new BadRequestException({
        message: 'Hospital deactivated, skipping slot generation',
        code: 'HOSPITAL_DEACTIVATED',
      });
    }

    // Enforce business rules
    if (schedule.isExpired) {
      throw new BadRequestException({
        message: 'Schedule has expired',
        code: 'SCHEDULE_EXPIRED',
      });
    }

    const timezone =
      doctorHospitalProfile.Hospital.timezone || 'Africa/Addis_Ababa';

    //
    // 1. Establish the generation window
    //
    const nowLocal = DateTime.now().setZone(timezone).startOf('day');
    const nowZoned = DateTime.now().setZone(timezone);

    const scheduleStartDate = DateTime.fromISO(schedule.startDate, {
      zone: timezone,
    }).startOf('day');

    const scheduleEndDate = schedule.endDate
      ? DateTime.fromISO(schedule.endDate, { zone: timezone }).startOf('day')
      : null;

    // Generation start must be today or scheduleStartDate, whichever is later
    let generationStart = DateTime.max(nowLocal, scheduleStartDate).startOf(
      'day',
    );

    // Generation end = min(schedule.endDate, 14-day window)
    // Use endOf('day') so the last date is included in the generation window
    let generationEnd = nowLocal.plus({ days: 14 }).endOf('day');

    //ensure one time schedule slots are generated regardless of their start date being more than 14 days
    if (schedule.type === 'one_time') {
      const localEndDateTime = DateTime.fromISO(
        `${schedule.startDate}T${schedule.endTime}`,
        { zone: timezone },
      );

      // If the entire scheduled slot (on that date) has already ended in local time, reject
      if (localEndDateTime <= nowZoned)
        throw new BadRequestException({
          message: "One time schedule's start date has already passed",
          code: 'SCHEDULE_START_DATE_PASSED',
        });

      // allow generating slots for the remainder of the scheduled date (if it is today)
      generationStart = DateTime.max(nowLocal, scheduleStartDate).startOf(
        'day',
      );
      generationEnd = scheduleStartDate.endOf('day');
    }

    if (scheduleEndDate) {
      const scheduleEndStart = scheduleEndDate.startOf('day');
      if (scheduleEndStart < generationEnd.startOf('day')) {
        generationEnd = scheduleEndStart.endOf('day');
      }
    }

    // If end < start ⇒ nothing to generate
    if (generationEnd < generationStart) {
      throw new BadRequestException({
        message: "Schedule's start date and end date have already passed",
        code: 'SCHEDULE_START_DATE_PASSED',
      });
    }

    //
    // 2. Loop day-by-day within the generation window
    //
    let cursor = generationStart;

    const intervalMinutes = doctorHospitalProfile.slotDuration || 20;

    const slotsToCreate: Array<{
      scheduleId: string;
      startTimeUTC: Date;
      endTimeUTC: Date;
      dateUTC: Date;
      status: 'available';
    }> = [];

    while (cursor <= generationEnd) {
      // decide whether this local date should generate slots based on schedule type/dayOfWeek
      const dow = cursor.weekday % 7; // luxon: 1(Mon)-7(Sun) -> convert to 0-6 (Sun=0)
      const rawDayOfWeek: number[] = (schedule.dayOfWeek as any) || [];
      // normalize possible representations (allow 0-6 or 1-7 where 7==Sunday)
      const dtoDayOfWeek: number[] = rawDayOfWeek
        .map((d: any) => {
          const n = Number(d);
          if (Number.isNaN(n)) return -1;
          return n === 7 ? 0 : Math.abs(n) % 7;
        })
        .filter((n) => n >= 0 && n <= 6);
      let generateForDate = true;

      if (schedule.type === 'recurring') {
        generateForDate =
          Array.isArray(dtoDayOfWeek) && dtoDayOfWeek.length > 0
            ? dtoDayOfWeek.includes(dow)
            : false;
      } else if (schedule.type === 'one_time') {
        const scheduleStart = DateTime.fromISO(schedule.startDate, {
          zone: timezone,
        }).startOf('day');
        generateForDate = cursor.hasSame(scheduleStart, 'day');
      } else if (schedule.type === 'temporary') {
        // temporary without dayOfWeek means every date between start/end
        generateForDate =
          Array.isArray(dtoDayOfWeek) && dtoDayOfWeek.length > 0
            ? dtoDayOfWeek.includes(dow)
            : true;
      }

      if (!generateForDate) {
        cursor = cursor.plus({ days: 1 });
        continue;
      }
      //
      // Build the local day’s working interval
      //
      const localStart = DateTime.fromISO(
        `${cursor.toISODate()}T${schedule.startTime}`,
        { zone: timezone },
      );
      const localEnd = DateTime.fromISO(
        `${cursor.toISODate()}T${schedule.endTime}`,
        { zone: timezone },
      );

      // Skip invalid ranges
      if (localEnd <= localStart) {
        cursor = cursor.plus({ days: 1 });
        continue;
      }

      //
      // 3. Split this range into slots
      //
      let slotCursor = localStart;

      while (slotCursor < localEnd) {
        const slotEnd = slotCursor.plus({ minutes: intervalMinutes });

        // Skip slots that extend past the schedule's daily end
        if (slotEnd > localEnd) break;

        // Convert to UTC for database storage
        const slotStartUTC = slotCursor.toUTC().toJSDate();
        const slotEndUTC = slotEnd.toUTC().toJSDate();

        // Skip past slots for today (do not create slots that already ended)
        if (slotEnd <= nowZoned) {
          slotCursor = slotCursor.plus({ minutes: intervalMinutes });
          continue;
        }

        // store date as UTC midnight for the local date
        const dateUTC = cursor.startOf('day').toUTC().toJSDate();

        slotsToCreate.push({
          scheduleId,
          startTimeUTC: slotStartUTC,
          endTimeUTC: slotEndUTC,
          dateUTC,
          status: 'available',
        });

        slotCursor = slotCursor.plus({ minutes: intervalMinutes });
      }

      cursor = cursor.plus({ days: 1 });
    }

    //
    // 4. Persist new slots (skip duplicates)
    //
    let createdCount = 0;

    // Persist in batches - use createMany with skipDuplicates for efficiency
    if (slotsToCreate.length > 0) {
      const chunkSize = 500;
      // determine which weekdays we attempted to create slots for
      const attemptedDays = new Set<number>();
      for (const s of slotsToCreate) {
        const dt = DateTime.fromJSDate(s.dateUTC).setZone(timezone);
        const dow = dt.weekday % 7; // 0-6
        attemptedDays.add(dow);
      }
      for (let i = 0; i < slotsToCreate.length; i += chunkSize) {
        const batch = slotsToCreate.slice(i, i + chunkSize).map((s) => ({
          scheduleId: s.scheduleId,
          slotStart: s.startTimeUTC,
          slotEnd: s.endTimeUTC,
          date: s.dateUTC,
          status: s.status,
        }));

        const res = await this.prisma.slot.createMany({
          data: batch,
          skipDuplicates: true,
        });
        createdCount += res.count ?? 0;
      }
    }

    await this.prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        slotLastGeneratedDate: generationEnd.toISO(),
      },
    });

    // If no slots were created, throw with diagnostic info
    if (createdCount <= 0) {
      throw new BadRequestException({
        message:
          "Couldn't generate slot due to date ranges or slots already exist",
        code: 'SLOT_GENERATION_FAILED',
        data: {
          attempted: slotsToCreate.length,
          generationStart: generationStart.toISO(),
          generationEnd: generationEnd.toISO(),
          scheduleStartDate: schedule.startDate,
          scheduleEndDate: schedule.endDate,
        },
      });
    }

    // If some weekdays had no attempted slot generation, remove them from the schedule
    try {
      const originalDays: number[] = (schedule.dayOfWeek as any) || [];
      if (Array.isArray(originalDays) && originalDays.length > 0) {
        // attemptedDays may be undefined if no slotsToCreate existed; guard
        const attemptedDaysSet = new Set<number>();
        for (const s of slotsToCreate) {
          const dt = DateTime.fromJSDate(s.dateUTC).setZone(timezone);
          attemptedDaysSet.add(dt.weekday % 7);
        }
        const newDays = originalDays.filter((d) => attemptedDaysSet.has(d));
        if (newDays.length !== originalDays.length) {
          await this.prisma.schedule.update({
            where: { id: scheduleId },
            data: { dayOfWeek: newDays },
          });
        }
      }
    } catch (e) {
      // don't fail slot generation because of cleanup; just log
      console.error(
        'Failed to prune schedule dayOfWeek after slot generation',
        e,
      );
    }

    return {
      message: 'Initial 14-day slot creation completed',
      createdCount,
      scheduleId,
    };
  }
}
