import { IsString, IsNotEmpty, IsOptional, IsArray } from 'class-validator';

export class applyDoctor {
  @IsString()
  @IsOptional()
  bio: string;

  @IsString()
  @IsNotEmpty()
  yearsOfExperience: number;

  @IsArray()
  @IsNotEmpty()
  specializationIds: string[];
}
