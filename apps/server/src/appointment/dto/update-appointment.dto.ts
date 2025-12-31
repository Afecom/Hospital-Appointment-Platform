import { createAppointmentDto } from './create-appointment.dto.js';
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum } from 'class-validator';
import { AppointmentStatus } from '../../../generated/prisma/enums.js';

export class updateAppointment extends PartialType(createAppointmentDto) {
  @IsEnum([AppointmentStatus.approved, AppointmentStatus.rejected])
  status: AppointmentStatus;
}
