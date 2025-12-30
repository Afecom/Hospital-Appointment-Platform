import { Module } from '@nestjs/common';
import { DoctorService } from './doctor.service.js';
import { DoctorController } from './doctor.controller.js';
import { DatabaseModule } from '../database/database.module.js';

@Module({
  controllers: [DoctorController],
  providers: [DoctorService],
  imports: [DatabaseModule]
})
export class DoctorModule { }
