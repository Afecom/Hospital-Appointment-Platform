import { createAppointmentDto } from './create-appointment.dto.js';
import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AppointmentStatus } from '../../../generated/prisma/enums.js';

export class updateAppointment extends PartialType(createAppointmentDto) {
  @IsEnum(AppointmentStatus)
  @IsOptional()
  status?: AppointmentStatus;

  @IsString()
  @IsOptional()
  newScheduleId?: string;

  @IsString()
  @IsOptional()
  newSlotId?: string;

  @IsString()
  @IsOptional()
  approvedBy?: string;
}
