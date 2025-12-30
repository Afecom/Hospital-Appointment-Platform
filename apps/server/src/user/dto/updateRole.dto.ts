import { IsString } from 'class-validator';
import { Role } from '@repo/database';

export class updateRoleDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  role: Role;
}
