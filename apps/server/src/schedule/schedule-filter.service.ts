import { Injectable } from '@nestjs/common';
import { ScheduleStatus, ScheduleType } from '../../generated/prisma/enums.js';
import { DatabaseService } from '../database/database.service.js';
import {
  normalizePagination,
  buildPaginationMeta,
} from '../common/pagination/pagination.js';

@Injectable()
export class ScheduleFilterService {
  constructor(private prisma: DatabaseService) {}

  async filterSchedule(query: {
    hospitalId?: string;
    doctorId: string;
    status?: ScheduleStatus;
    type?: ScheduleType;
    date?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
    deactivated?: boolean;
    expired?: boolean;
  }) {
    const {
      hospitalId,
      doctorId,
      status,
      type,
      date,
      startDate,
      endDate,
      page,
      limit,
    } = query;
    const whereClause: any = {
      doctorId,
      ...(hospitalId && { hospitalId }),
      ...(status && { status }),
      ...(type && { type }),
      isDeleted: false,
    };

    // apply deactivated/expired filters only when explicitly provided
    if (typeof query.deactivated !== 'undefined') {
      whereClause.isDeactivated = query.deactivated;
    }
    if (typeof query.expired !== 'undefined') {
      whereClause.isExpired = query.expired;
    }
    // If caller asked for deactivated schedules but did not specify expired,
    // exclude expired schedules from the deactivated view.
    if (query.deactivated && typeof query.expired === 'undefined') {
      whereClause.isExpired = false;
    }
    const { normalizedPage, normalizedLimit, skip, take } = normalizePagination(
      { page, limit },
    );
    if (date) {
      const target = new Date(date);
      const DOW = target.getDay();
      // one_time schedules now use `startDate` as their calendar date
      const [data, total] = await this.prisma.$transaction([
        this.prisma.schedule.findMany({
          where: {
            ...whereClause,
            OR: [
              {
                type: 'one_time',
                startDate: date,
              },
              {
                type: 'temporary',
                startDate: { lte: date },
                endDate: { gte: date },
              },
              {
                type: 'recurring',
                dayOfWeek: { has: DOW },
              },
            ],
          },
          include: {
            Hospital: {
              select: {
                name: true,
                timezone: true,
              },
            },
          },
          skip,
          take,
        }),
        this.prisma.schedule.count({ where: whereClause }),
      ]);
      return {
        schedule: data,
        meta: buildPaginationMeta(total, normalizedPage, normalizedLimit),
      };
    } else if (startDate && endDate) {
      const [data, total] = await this.prisma.$transaction([
        this.prisma.schedule.findMany({
          where: {
            ...whereClause,
            OR: [
              {
                type: 'one_time',
                startDate: { gte: startDate, lte: endDate },
              },
              {
                type: 'temporary',
                startDate: { lte: endDate },
                endDate: { gte: startDate },
              },
              { type: 'recurring' },
            ],
          },
          include: {
            Hospital: {
              select: {
                name: true,
                timezone: true,
              },
            },
          },
          skip,
          take,
        }),
        this.prisma.schedule.count({ where: whereClause }),
      ]);
      return {
        schedules: data,
        meta: buildPaginationMeta(total, normalizedPage, normalizedLimit),
      };
    } else if (startDate && !endDate) {
      const [data, total] = await this.prisma.$transaction([
        this.prisma.schedule.findMany({
          where: {
            ...whereClause,
            OR: [
              {
                type: 'one_time',
                startDate: { gte: startDate },
              },
              {
                type: 'temporary',
                endDate: { gte: startDate },
              },
              { type: 'recurring' },
            ],
          },
          include: {
            Hospital: {
              select: {
                name: true,
                timezone: true,
              },
            },
          },
          skip,
          take,
        }),
        this.prisma.schedule.count({ where: whereClause }),
      ]);
      return {
        schedules: data,
        meta: buildPaginationMeta(total, normalizedPage, normalizedLimit),
      };
    } else if (!startDate && endDate) {
      const [data, total] = await this.prisma.$transaction([
        this.prisma.schedule.findMany({
          where: {
            ...whereClause,
            OR: [
              {
                type: 'one_time',
                startDate: { lte: endDate },
              },
              {
                type: 'temporary',
                startDate: { lte: endDate },
              },
              { type: 'recurring' },
            ],
          },
          include: {
            Hospital: {
              select: {
                name: true,
                timezone: true,
              },
            },
          },
          skip,
          take,
        }),
        this.prisma.schedule.count({ where: whereClause }),
      ]);
      return {
        schedules: data,
        meta: buildPaginationMeta(total, normalizedPage, normalizedLimit),
      };
    }
    return await this.prisma.schedule.findMany({
      where: whereClause,
      include: {
        Hospital: {
          select: {
            name: true,
            timezone: true,
          },
        },
      },
      skip,
      take,
    });
  }
}
