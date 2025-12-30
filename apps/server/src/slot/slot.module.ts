import { Module } from '@nestjs/common';
import { slotService } from './slot.service.js';
import { DatabaseModule } from '../database/database.module.js';
import { dailyCron } from './daily-cron.service.js';

@Module({
  providers: [slotService, dailyCron],
  exports: [slotService],
  imports: [DatabaseModule],
})
export class slotModule {}
