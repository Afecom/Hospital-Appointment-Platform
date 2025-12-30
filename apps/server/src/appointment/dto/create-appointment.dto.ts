import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class createAppointmentDto {
  @IsString()
  @IsNotEmpty()
  slotId: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
