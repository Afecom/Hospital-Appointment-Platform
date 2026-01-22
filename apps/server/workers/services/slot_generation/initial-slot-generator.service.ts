import { prisma } from '../../../src/lib/prisma.js';
import { DateTime } from 'luxon';

export async function generateInitialSlots(scheduleId: string) {
  if (!scheduleId) throw new Error('scheduleId missing in job data');

  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
  });

  if (!schedule) {
    throw new Error(`Schedule ${scheduleId} not found`);
  }

  const doctorHospitalProfile = await prisma.doctorHospitalProfile.findUnique({
    where: {
      doctorId_hospitalId: {
        doctorId: schedule.doctorId,
        hospitalId: schedule.hospitalId,
      },
    },
    include: { Hospital: true, Doctor: true },
  });
  if (!doctorHospitalProfile)
    throw new Error('doctor to hospital mapping not found in DB');

  if (doctorHospitalProfile.Doctor?.isDeactivated) {
    return { message: 'Doctor deactivated, skipping slot generation' };
  }

  // Enforce business rules
  if (schedule.isExpired || schedule.isDeactivated) {
    return { message: 'Schedule inactive, skipping slot generation' };
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
  let generationStart = DateTime.max(nowLocal, scheduleStartDate);

  // Generation end = min(schedule.endDate, 14-day window)
  let generationEnd = nowLocal.plus({ days: 14 });

  //ensure one time schedule slots are generated regardless of their start date being more than 14 days
  if (schedule.type === 'one_time') {
    // making sure if the schedule is still valid where the start date is later or atleast the same day
    if (scheduleStartDate < nowLocal)
      throw new Error("One time schedule's start date has already passed");
    generationStart = scheduleStartDate;
    generationEnd = scheduleStartDate;
  }

  if (scheduleEndDate && scheduleEndDate < generationEnd) {
    generationEnd = scheduleEndDate;
  }

  // If end < start ⇒ nothing to generate
  if (generationEnd < generationStart) {
    return { message: 'No slot window available (start >= end)' };
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
    const dtoDayOfWeek: number[] = (schedule.dayOfWeek as any) || [];
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
    for (let i = 0; i < slotsToCreate.length; i += chunkSize) {
      const batch = slotsToCreate.slice(i, i + chunkSize).map((s) => ({
        scheduleId: s.scheduleId,
        slotStart: s.startTimeUTC,
        slotEnd: s.endTimeUTC,
        date: s.dateUTC,
        status: s.status,
      }));

      const res = await prisma.slot.createMany({
        data: batch,
        skipDuplicates: true,
      });
      createdCount += res.count ?? 0;
    }
  }

  await prisma.schedule.update({
    where: { id: scheduleId },
    data: {
      slotLastGeneratedDate: generationEnd.toISO(),
    },
  });

  return {
    message: 'Initial 14-day slot creation completed',
    createdCount,
    scheduleId,
  };
}
