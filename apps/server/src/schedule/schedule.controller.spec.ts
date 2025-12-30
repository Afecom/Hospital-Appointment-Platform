import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleController } from './schedule.controller.js';
import { ScheduleService } from './schedule.service.js';
import { DatabaseService } from '../database/database.service.js';
import { ScheduleFilterService } from './schedule-filter.service.js';
import { ScheduleOverlapService } from './schedule-overlap-checker.service.js';
import { expireSchedule } from './schedule-expiry-queue.service.js';

describe('ScheduleController', () => {
  let controller: ScheduleController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScheduleController],
      providers: [
        ScheduleService,
        { provide: DatabaseService, useValue: {} },
        { provide: ScheduleFilterService, useValue: {} },
        { provide: ScheduleOverlapService, useValue: {} },
        { provide: expireSchedule, useValue: {} },
      ],
    }).compile();

    controller = module.get<ScheduleController>(ScheduleController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
