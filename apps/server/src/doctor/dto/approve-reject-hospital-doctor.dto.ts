import { IsInt, IsString } from 'class-validator';

export class approveHospitalDoctor {
  @IsInt()
  slotDuration: number;

  @IsString()
  applicationId: string;
}

export class doctorHospitalApplication {
  @IsString()
  applicationId: string;
}
