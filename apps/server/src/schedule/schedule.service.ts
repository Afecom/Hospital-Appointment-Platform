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
import {
  buildPaginationMeta,
  normalizePagination,
} from '../common/pagination/pagination.js';
import { expireSchedule } from './schedule-expiry-queue.service.js';

@Injectable()
export class ScheduleService {
  constructor(
    private prisma: DatabaseService,
    private filterService: ScheduleFilterService,
    private checkOverlap: ScheduleOverlapService,
    private expire: expireSchedule,
  ) {}
  async createSchedule(data: CreateScheduleDto, session: UserSession) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId: session.user.id },
    });
    if (!doctor)
      throw new NotFoundException(
        "Couldn't find a doctor profile with the given userId",
      );
    const doctorId = doctor.id;
    const { dayOfWeek, startDate, endDate, startTime, endTime, type } = data;
    // Get hospital timezone (timezone moved to hospital)
    const hospital = await this.prisma.hospital.findUnique({
      where: { id: data.hospitalId },
    });
    if (!hospital) throw new NotFoundException('Hospital not found');
    const tz = hospital.timezone || 'UTC';

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
        createdBy: session.user.id,
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
  ) {
    const adminId = session.user.id;
    const hospital = await this.prisma.hospital.findUnique({
      where: { adminId },
    });
    if (!hospital)
      throw new NotFoundException(
        "Couldn't find a hospital administered under the provided user",
      );
    const hospitalId = hospital.id;
    if (!status) status = 'pending';
    const { normalizedPage, normalizedLimit, skip, take } = normalizePagination(
      { page, limit },
    );
    const whereClause = {
      status,
      ...(type && { type }),
      ...(doctorId && { doctorId }),
      Doctor: {
        DoctorHospitalProfile: {
          some: { hospitalId },
        },
      },
    };
    const [schedules, total] = await this.prisma.$transaction([
      this.prisma.schedule.findMany({
        where: whereClause,
        take,
        skip,
        include: {
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

  async countPendingHospitalSchedules(session: UserSession) {
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
      status: 'success',
      message: 'Schedules counted successfully',
      total: pendingSchedules,
    };
  }

  async approve(id: string, session: UserSession, status: ScheduleStatus) {
    const schedule = await this.prisma.schedule.findUnique({ where: { id } });
    if (!schedule) throw new NotFoundException('Schedule not found');
    const hospital = await this.prisma.hospital.findUnique({
      where: { adminId: session.user.id },
    });
    if (!hospital)
      throw new UnauthorizedException(
        'no hospital administered under the admin',
      );
    if (schedule.hospitalId !== hospital.id)
      throw new UnauthorizedException(
        'Schedule belongs to another hospital so couldnt be updated by the admin of this hospital',
      );
    return await this.prisma.schedule.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string, session: UserSession) {
    const doctor = await this.prisma.doctor.findUniqueOrThrow({
      where: {
        userId: session.user.id,
      },
    });
    await this.prisma.schedule.delete({ where: { id, doctorId: doctor.id } });
    return {
      status: 'Success',
      message: 'Schedule deleted successfuly',
    };
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
