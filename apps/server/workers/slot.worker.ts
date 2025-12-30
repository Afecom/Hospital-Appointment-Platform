import { Worker, Job } from 'bullmq';
import { generateInitialSlots } from './services/slot_generation/initial-slot-generator.service.js';
import { redisConfig } from '../src/common/redis/redis.config.js';
import { fillMissingSlotsWorker } from './services/slot_generation/daily-backfill-slots.service.js';

export const slotworker = new Worker(
  'slot-generation-queue',
  async (job: Job) => {
    switch (job.name) {
      case 'generate-initial-slots':
        return generateInitialSlots(job.data.scheduleId as string);
      case 'fill-missing-slots':
        return fillMissingSlotsWorker(job.data.scheduleId as string);
    }
  },
  { connection: redisConfig, concurrency: 10, lockDuration: 120000 },
);
