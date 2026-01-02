import { IsInt, IsEnum, IsString } from 'class-validator';

export class approveHospitalDoctor {
  @IsEnum(['permanent', 'rotating'])
  doctorType: 'permanent' | 'rotating';

  @IsInt()
  slotDuration: number;

  @IsString()
  applicationId: string;
}

export class rejectHospitalDoctor {
  @IsString()
  applicationId: string;
}
