import { Module } from '@nestjs/common';
import { HospitalService } from './hospital.service.js';
import { HospitalController } from './hospital.controller.js';
import { DatabaseModule } from '../database/database.module.js';
import { CloudinaryModule } from '../cloudinary/cloudinary.module.js';

@Module({
  controllers: [HospitalController],
  providers: [HospitalService],
  imports: [DatabaseModule, CloudinaryModule],
})
export class HospitalModule {}
