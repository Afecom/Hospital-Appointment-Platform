import { Module } from '@nestjs/common';
import { slotService } from './slot.service.js';
import { DatabaseModule } from '../database/database.module.js';
import { dailyCron } from './daily-cron.service.js';
import { generateInitialSlots } from './initial-slot-generator.service.js';

@Module({
  providers: [slotService, dailyCron, generateInitialSlots],
  exports: [slotService, generateInitialSlots],
  imports: [DatabaseModule],
})
export class slotModule {}
