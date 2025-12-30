import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { slotService } from './slot.service.js';
import { DatabaseService } from '../database/database.service.js';

@Injectable()
export class dailyCron {
  constructor(
    private queue: slotService,
    private prisma: DatabaseService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM, { timeZone: 'Africa/Addis_Ababa' })
  async dailyBackfill() {
    const schedules = await this.prisma.schedule.findMany({
      where: {
        isDeactivated: false,
        isExpired: false,
        type: { not: 'one_time' },
      },
    });
    for (const schedule of schedules) {
      await this.queue.dailyBackFill(schedule.id);
    }
  }
}
