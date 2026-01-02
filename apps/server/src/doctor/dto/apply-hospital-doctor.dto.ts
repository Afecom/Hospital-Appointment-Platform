import { IsNotEmpty, IsArray } from 'class-validator';

export class applyHospitalDoctorDto {
  @IsArray()
  @IsNotEmpty()
  hospitalIds: string[];
}
