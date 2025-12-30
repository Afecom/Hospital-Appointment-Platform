import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { HospitalModule } from './hospital/hospital.module.js';
import { DatabaseModule } from './database/database.module.js';
import { SpecializationModule } from './specialization/specialization.module.js';
import { DoctorModule } from './doctor/doctor.module.js';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { auth } from './lib/auth.js';
import { CloudinaryModule } from './cloudinary/cloudinary.module.js';
import { UserModule } from './user/user.module.js';
import { SchedulesModule } from './schedule/schedule.module.js';
import { slotModule } from './slot/slot.module.js';
import { ScheduleModule } from '@nestjs/schedule';
import { appointmentModule } from './appointment/appointment.module.js';
import 'dotenv/config';

@Module({
  imports: [
    HospitalModule,
    DatabaseModule,
    SpecializationModule,
    DoctorModule,
    AuthModule.forRoot({ auth }),
    CloudinaryModule,
    UserModule,
    SchedulesModule,
    slotModule,
    ScheduleModule.forRoot(),
    appointmentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
