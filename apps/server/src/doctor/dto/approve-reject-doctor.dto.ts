import { IsString } from 'class-validator';

export class approveDoctor {
  @IsString()
  applicationId: string;
}

export class rejectDoctor {
  @IsString()
  applicationId: string;
}
