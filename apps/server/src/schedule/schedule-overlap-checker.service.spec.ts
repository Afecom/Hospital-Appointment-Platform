import { BadRequestException } from '@nestjs/common';
import { jest } from '@jest/globals';
import { ScheduleOverlapService } from './schedule-overlap-checker.service.js';

describe('ScheduleOverlapService', () => {
  it('throws structured conflict for overlapping one-time schedules', async () => {
    const mockPrisma: any = {
      schedule: {
        findMany: (jest.fn() as any).mockResolvedValue([
          {
            id: 'c1',
            name: 'Existing',
            type: 'one_time',
            startDate: '2025-12-10',
            startTime: '09:30',
            endTime: '10:30',
            timezone: 'UTC',
            dayOfWeek: [],
            status: 'approved',
          },
        ] as any),
      },
    };

    const svc = new ScheduleOverlapService(mockPrisma as any);
    const incoming: any = {
      type: 'one_time',
      startDate: '2025-12-10',
      startTime: '09:00',
      endTime: '10:00',
      timezone: 'UTC',
    };

    await expect(svc.ensureNoOverlap('doc1', incoming)).rejects.toMatchObject({
      response: {
        conflict: {
          id: 'c1',
          name: 'Existing',
        },
      },
    });
  });

  it('resolves when there is no overlap', async () => {
    const mockPrisma: any = {
      schedule: {
        findMany: (jest.fn() as any).mockResolvedValue([
          {
            id: 'c2',
            name: 'NonOverlap',
            type: 'one_time',
            startDate: '2025-12-11',
            startTime: '11:00',
            endTime: '12:00',
            timezone: 'UTC',
            dayOfWeek: [],
            status: 'approved',
          },
        ] as any),
      },
    };

    const svc = new ScheduleOverlapService(mockPrisma as any);
    const incoming: any = {
      type: 'one_time',
      startDate: '2025-12-10',
      startTime: '09:00',
      endTime: '10:00',
      timezone: 'UTC',
    };

    await expect(
      svc.ensureNoOverlap('doc1', incoming),
    ).resolves.toBeUndefined();
  });

  it('does not flag recurring overlap when one-time date is outside recurring bounds', async () => {
    const mockPrisma: any = {
      schedule: {
        findMany: (jest.fn() as any).mockResolvedValue([
          {
            id: 'c3',
            name: 'Bounded recurring',
            type: 'recurring',
            startDate: '2025-01-01',
            endDate: '2025-01-31',
            dayOfWeek: [1], // Monday
            startTime: '09:00',
            endTime: '10:00',
            status: 'approved',
            Hospital: { timezone: 'UTC' },
          },
        ] as any),
      },
    };

    const svc = new ScheduleOverlapService(mockPrisma as any);
    const incoming: any = {
      type: 'one_time',
      startDate: '2025-03-03', // Monday, but outside Jan bounds
      startTime: '09:00',
      endTime: '10:00',
      timezone: 'UTC',
    };

    await expect(
      svc.ensureNoOverlap('doc1', incoming),
    ).resolves.toBeUndefined();
  });
});
