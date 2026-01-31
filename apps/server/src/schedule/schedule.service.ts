import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { DateTime } from 'luxon';
import { CreateScheduleDto } from './dto/create-schedule.dto.js';
import { UserSession } from '@thallesp/nestjs-better-auth';
import { ScheduleStatus, ScheduleType } from '../../generated/prisma/enums.js';
import { DatabaseService } from '../database/database.service.js';
import { ScheduleFilterService } from './schedule-filter.service.js';
import { UpdateScheduleDto } from './dto/update-schedule.dto.js';
import { ScheduleOverlapService } from './schedule-overlap-checker.service.js';
import { generateInitialSlots } from '../slot/initial-slot-generator.service.js';
import {
  buildPaginationMeta,
  normalizePagination,
} from '../common/pagination/pagination.js';
import { expireSchedule } from './schedule-expiry-queue.service.js';
import {
  countPendingSchedulesRes,
  getScheduleForAdminRes,
  scheduleActionRes,
  approveRejectScheuleRes,
} from '@hap/contract';
import { DayOfWeekToDateRangeChecker } from './day-of-week_X_date-range_checker.service.js';

@Injectable()
export class ScheduleService {
  constructor(
    private prisma: DatabaseService,
    private filterService: ScheduleFilterService,
    private checkOverlap: ScheduleOverlapService,
    private expire: expireSchedule,
    private generate: generateInitialSlots,
    private checkDateRange: DayOfWeekToDateRangeChecker,
  ) {}
  async createSchedule(data: CreateScheduleDto, session: UserSession) {
    const doctor = await this.prisma.doctor.findFirstOrThrow({
      where: { userId: session.user.id },
    });
    const doctorId = doctor.id;
    const { dayOfWeek, startDate, endDate, startTime, endTime, type } = data;
    // Get hospital timezone (timezone moved to hospital)
    const hospital = await this.prisma.hospital.findUniqueOrThrow({
      where: { id: data.hospitalId },
    });
    const tz = hospital.timezone || 'UTC';

    await this.checkDateRange.dayOfWeekDateRangeChecker(
      dayOfWeek,
      startDate,
      endDate,
      tz,
    );

    // one_time schedules should set `startDate` (we removed `date` from schema)
    await this.checkOverlap.ensureNoOverlap(doctorId, {
      type,
      startDate,
      endDate,
      dayOfWeek,
      startTime,
      endTime,
      timezone: tz,
    });
    const schedule = await this.prisma.schedule.create({
      data: {
        doctorId: doctor.id,
        ...(data as any),
      },
      include: { Hospital: { select: { timezone: true } } },
    });
    if (schedule.endDate) {
      const tz = schedule.Hospital?.timezone;
      const expirationLocal = DateTime.fromISO(
        `${schedule.endDate}T${schedule.endTime}`,
        { zone: tz },
      );
      const expirationUtc = expirationLocal.toUTC();
      const nowUtc = DateTime.utc();
      const delayMs = expirationUtc.diff(nowUtc).as('milliseconds');
      if (delayMs <= 0) {
        await this.prisma.schedule.update({
          where: { id: schedule.id },
          data: { isExpired: true },
        });
        throw new BadRequestException('The schedule has already expired');
      }
      await this.expire.scheduleExpire(schedule.id, delayMs);
      return schedule;
    }
    return schedule;
  }

  async countActiveSchedules(session: UserSession) {
    const adminId = session.user.id;
    try {
      const hospital = await this.prisma.hospital.findUniqueOrThrow({
        where: { adminId },
      });
      const hospitalId = hospital.id;
      const totalActiveSchedules = await this.prisma.schedule.count({
        where: {
          hospitalId,
          status: 'approved',
          isDeactivated: false,
          isExpired: false,
        },
      });
      return {
        status: 'success',
        message: 'Active schedules counted successfuly',
        total: totalActiveSchedules,
      };
    } catch (error) {
      throw new Error("Couldn't fetch active schedules");
    }
  }

  async findApprovedSchedules(
    doctorId: string,
    hospitalId?: string,
    date?: string,
    startDate?: string,
    endDate?: string,
  ) {
    return this.filterService.filterSchedule({
      doctorId,
      hospitalId,
      date,
      startDate,
      endDate,
    });
  }
  async findSchedulesForAdmin(
    session: UserSession,
    status?: ScheduleStatus,
    type?: ScheduleType,
    doctorId?: string,
    page?: number,
    limit?: number,
    expired?: boolean,
    deactivated?: boolean,
  ): Promise<getScheduleForAdminRes> {
    const adminId = session.user.id;
    const hospital = await this.prisma.hospital.findUnique({
      where: { adminId },
    });
    if (!hospital)
      throw new NotFoundException(
        "Couldn't find a hospital administered under the provided user",
      );
    const hospitalId = hospital.id;
    const { normalizedPage, normalizedLimit, skip, take } = normalizePagination(
      { page, limit },
    );
    const whereClause = {
      hospitalId,
      ...(status && { status }),
      ...(type && { type }),
      ...(doctorId && { doctorId }),
      ...(expired && { isExpired: expired }),
      ...(deactivated && { isDeactivated: deactivated }),
    };
    console.log(expired);
    const [schedules, total] = await this.prisma.$transaction([
      this.prisma.schedule.findMany({
        where: {
          hospitalId,
          ...(status && { status }),
          ...(type && { type }),
          ...(doctorId && { doctorId }),
          ...(expired && { isExpired: expired }),
          ...(deactivated && { isDeactivated: deactivated }),
        },
        take,
        skip,
        select: {
          id: true,
          type: true,
          startDate: true,
          endDate: true,
          dayOfWeek: true,
          startTime: true,
          endTime: true,
          status: true,
          name: true,
          period: true,
          Doctor: {
            select: {
              id: true,
              User: {
                select: {
                  fullName: true,
                  phoneNumber: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.schedule.count({ where: whereClause }),
    ]);
    return {
      status: 'Success',
      message: 'Schedules fetched successfuly',
      data: {
        schedules,
        meta: buildPaginationMeta(total, normalizedPage, normalizedLimit),
      },
    };
  }

  async countPendingHospitalSchedules(
    session: UserSession,
  ): Promise<countPendingSchedulesRes> {
    const adminId = session.user.id;
    const hospital = await this.prisma.hospital.findUniqueOrThrow({
      where: { adminId },
    });
    const hospitalId = hospital.id;
    const whereClause = {
      hospitalId,
      status: 'pending' as ScheduleStatus,
    };
    const pendingSchedules = await this.prisma.schedule.count({
      where: whereClause,
    });
    return {
      status: 'Success',
      message: 'Schedules counted successfully',
      total: pendingSchedules,
    };
  }

  async approve(
    id: string,
    session: UserSession,
  ): Promise<approveRejectScheuleRes> {
    try {
      const schedule = await this.prisma.schedule.findUniqueOrThrow({
        where: { id },
      });
      const hospital = await this.prisma.hospital.findUniqueOrThrow({
        where: { adminId: session.user.id },
      });
      if (schedule.hospitalId !== hospital.id)
        throw new UnauthorizedException(
          'Schedule belongs to another hospital so couldnt be updated by the admin of this hospital',
        );
      if (schedule.status === 'approved')
        throw new BadRequestException('Schedule is already approved');
      const genResult = await this.generate.generateInitialSlot(schedule.id);
      await this.prisma.schedule.update({
        where: { id },
        data: { status: 'approved' },
      });

      return {
        status: 'Success',
        code: 'SCHEDULE_APPROVED',
        message: 'Schedule approved successfuly',
      };
    } catch (error) {
      throw error;
    }
  }

  async reject(
    id: string,
    session: UserSession,
  ): Promise<approveRejectScheuleRes> {
    const adminId = session.user.id;
    try {
      const hospital = await this.prisma.hospital.findUniqueOrThrow({
        where: { adminId },
      });
      const schedule = await this.prisma.schedule.findUniqueOrThrow({
        where: { id },
      });
      if (schedule.hospitalId !== hospital.id)
        throw new UnauthorizedException(
          "The schedule doesn't belong to this hospital",
        );
      await this.prisma.schedule.update({
        where: { id },
        data: { status: 'rejected' },
      });
      return {
        status: 'Success',
        code: 'SCHEDULE_REJECTED',
        message: 'Schedule rejected successfuly',
      };
    } catch (error) {
      throw new Error('Failed to reject schedule');
    }
  }

  async handleAction(
    id: string,
    action: 'delete' | 'deactivate' | 'undo' | 'activate',
  ): Promise<scheduleActionRes> {
    try {
      const schedule = await this.prisma.schedule.findUniqueOrThrow({
        where: { id },
      });
      if (action === 'activate') {
        if (!schedule.isDeactivated)
          throw new BadRequestException({
            message: 'The schedule is not deactivated',
            code: 'SCHEDULE_NOT_DEACTIVATED',
          });
        await this.prisma.schedule.update({
          where: { id: schedule.id },
          data: { isDeactivated: false },
        });
        return {
          status: 'Success',
          code: 'SCHEDULE_ACTIVATED',
          message: 'Schedule activated successfuly',
        };
      }
      const appointments = await this.prisma.appointment.findMany({
        where: {
          scheduleId: schedule.id,
          status: {
            in: ['approved', 'pending'],
          },
        },
        select: {
          id: true,
          Slot: {
            select: {
              id: true,
              slotStart: true,
              slotEnd: true,
              date: true,
            },
          },
        },
      });
      if (appointments.length > 0) {
        throw new BadRequestException({
          message: 'The schedule has active appointments',
          code: 'SCHEDULE_HAS_ACTIVE_APPOINTMENTS',
          appointments,
        });
      }
      if (action === 'deactivate') {
        if (schedule.isDeactivated)
          throw new BadRequestException({
            message: 'The schedule is already deactivated',
            code: 'SCHEDULE_ALREADY_DEACTIVATED',
          });
        await this.prisma.schedule.update({
          where: { id: schedule.id },
          data: { isDeactivated: true },
        });
      } else if (action === 'delete') {
        await this.prisma.schedule.update({
          where: { id: schedule.id },
          data: { isDeleted: true },
        });
      } else if (action === 'undo') {
        if (schedule.status === 'pending')
          throw new BadRequestException({
            message: 'The schedule is already pending',
            code: 'SCHEDULE_ALREADY_PENDING',
          });
        await this.prisma.schedule.update({
          where: { id },
          data: {
            status: 'pending',
          },
        });
      }
      return {
        status: 'Success',
        code: `SCHEDULE_${action}D`,
        message: `Schedule ${action === 'undo' ? 'Schedule reverted successffuly' : action.toUpperCase()}D successfuly`,
      };
    } catch (error) {
      throw new Error(`failed to ${action} schedule`);
    }
  }

  async doctorsSchedule(
    userId: string,
    hospitalId?: string,
    status?: ScheduleStatus,
    type?: ScheduleType,
    date?: string,
    startDate?: string,
    endDate?: string,
    page?: number,
    limit?: number,
  ) {
    const doctor = await this.prisma.doctor.findUnique({ where: { userId } });
    if (!doctor)
      throw new NotFoundException(
        "Couldn't find a doctor with the provided ID",
      );
    const doctorId = doctor.id;
    if (!status) status = 'approved';
    return this.filterService.filterSchedule({
      hospitalId,
      doctorId,
      status,
      type,
      date,
      startDate,
      endDate,
      page,
      limit,
    });
  }

  async updateSchedule(
    dto: UpdateScheduleDto,
    session: UserSession,
    scheduleId: string,
  ) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: session.user.id },
    });
    if (!doctor)
      throw new UnauthorizedException(
        'A doctor should only access this resource',
      );
    const doctorId = doctor.id;
    const schedule = await this.prisma.schedule.findUnique({
      where: { id: scheduleId },
    });
    if (!schedule) throw new NotFoundException("Couldn't find a schedule");
    if (schedule.doctorId !== doctorId)
      throw new UnauthorizedException(
        'A schedule can only be patched by its owner',
      );
    if (schedule.status === 'approved')
      throw new BadRequestException(
        'An approved schedule can not be updated. Please delete the existing schedule and submit an updated one',
      );

    const hospital = await this.prisma.hospital.findUnique({
      where: { id: schedule.hospitalId },
    });
    const tz = hospital?.timezone || 'UTC';

    const merged = {
      type: (dto as any).type ?? schedule.type,
      startDate: (dto as any).startDate ?? schedule.startDate,
      endDate: (dto as any).endDate ?? schedule.endDate,
      dayOfWeek: (dto as any).dayOfWeek ?? schedule.dayOfWeek,
      startTime: (dto as any).startTime ?? schedule.startTime,
      endTime: (dto as any).endTime ?? schedule.endTime,
      timezone: tz,
    };

    await this.checkOverlap.ensureNoOverlap(doctorId, merged);
    return await this.prisma.schedule.update({
      where: { id: scheduleId },
      data: {
        ...dto,
        status: 'pending',
      },
    });
  }
}
