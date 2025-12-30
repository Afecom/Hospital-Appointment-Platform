import { Worker, Job } from 'bullmq';
import { redisConfig } from '../src/common/redis/redis.config.js';
import { expireSchedule } from './services/expire_schedule/expire_schedule.service.js';

export const expirationWorker = new Worker(
  'expire_schedule',
  async (job: Job) => {
    const { scheduleId } = job.data;
    switch (job.name) {
      case 'scheduleExpire':
        return expireSchedule(scheduleId);
    }
  },
  { connection: redisConfig, lockDuration: 60000, concurrency: 5 },
);
