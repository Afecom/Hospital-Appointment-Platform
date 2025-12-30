import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { redisConfig } from '../common/redis/redis.config.js';

@Injectable()
export class expireSchedule {
  private queue: Queue;
  constructor() {
    this.queue = new Queue('expire_schedule', {
      connection: redisConfig,
    });
  }

  async scheduleExpire(scheduleId: string, delay: number) {
    await this.queue.add(
      'scheduleExpire',
      { scheduleId },
      { delay, jobId: `expire-schedule${scheduleId}` },
    );
  }
}
