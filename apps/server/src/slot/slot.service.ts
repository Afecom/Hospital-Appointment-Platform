import { Injectable } from '@nestjs/common';
import { Queue } from 'bullmq';
import { redisConfig } from '../common/redis/redis.config.js';

@Injectable()
export class slotService {
  public queue: Queue;
  constructor() {
    this.queue = new Queue('slot-generation-queue', {
      connection: redisConfig,
    });
  }
  async dailyBackFill(scheduleId: string) {
    return this.queue.add(
      'fill-missing-slots',
      { scheduleId },
      { jobId: `fill-${scheduleId}-${Date.now()}`, removeOnComplete: true },
    );
  }
}
