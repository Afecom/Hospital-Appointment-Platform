import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleService } from './schedule.service.js';
import { DatabaseService } from '../database/database.service.js';
import { ScheduleFilterService } from './schedule-filter.service.js';
import { ScheduleOverlapService } from './schedule-overlap-checker.service.js';
import { expireSchedule } from './schedule-expiry-queue.service.js';

describe('ScheduleService', () => {
  let service: ScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        { provide: DatabaseService, useValue: {} },
        { provide: ScheduleFilterService, useValue: {} },
        { provide: ScheduleOverlapService, useValue: {} },
        { provide: expireSchedule, useValue: {} },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
