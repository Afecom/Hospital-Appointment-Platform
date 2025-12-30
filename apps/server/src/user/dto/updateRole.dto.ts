import { IsString } from 'class-validator';
import { Role } from '../../../generated/prisma/enums.js';

export class updateRoleDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  role: Role;
}
