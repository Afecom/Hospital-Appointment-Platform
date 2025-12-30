import { Module } from '@nestjs/common';
import { appointmentController } from './appointment.controller.js';
import { appointmentService } from './appointment.service.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  imports: [DatabaseModule],
  providers: [appointmentService],
  controllers: [appointmentController],
})
export class appointmentModule {}
