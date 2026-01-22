import { Worker, Job } from 'bullmq';
import { redisConfig } from '../src/common/redis/redis.config.js';
import { fillMissingSlotsWorker } from './services/slot_generation/daily-backfill-slots.service.js';

export const slotworker = new Worker(
  'slot-generation-queue',
  async (job: Job) => {
    switch (job.name) {
      case 'fill-missing-slots':
        return fillMissingSlotsWorker(job.data.scheduleId as string);
    }
  },
  { connection: redisConfig, concurrency: 10, lockDuration: 120000 },
);
