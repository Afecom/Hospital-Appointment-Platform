import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsNumber,
} from 'class-validator';

export class applyDoctor {
  @IsString()
  @IsOptional()
  bio: string;

  @IsNumber()
  @IsNotEmpty()
  yearsOfExperience: number;

  @IsArray()
  @IsNotEmpty()
  specializationIds: string[];
}
