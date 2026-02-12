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
    const whereClause = {
      doctorId,
      ...(hospitalId && { hospitalId }),
      ...(status && { status }),
      ...(type && { type }),
      isDeactivated: query.deactivated ?? false,
      isExpired: query.expired ?? false,
      isDeleted: false,
    };
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
      skip,
      take,
    });
  }
}
