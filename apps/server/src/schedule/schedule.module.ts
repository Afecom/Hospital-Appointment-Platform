import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service.js';
import { ScheduleController } from './schedule.controller.js';
import { DatabaseModule } from '../database/database.module.js';
import { ScheduleFilterService } from './schedule-filter.service.js';
import { DatabaseService } from '../database/database.service.js';
import { ScheduleOverlapService } from './schedule-overlap-checker.service.js';
import { expireSchedule } from './schedule-expiry-queue.service.js';

@Module({
  controllers: [ScheduleController],
  providers: [
    ScheduleService,
    ScheduleFilterService,
    DatabaseService,
    ScheduleOverlapService,
    expireSchedule,
  ],
  imports: [DatabaseModule],
})
export class SchedulesModule {}
