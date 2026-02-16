import {
  IsString,
  IsIn,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
  IsDateString,
} from 'class-validator';

/**
 * Permissive DTO for PATCH schedule update. All fields optional.
 * Validation (overlap, date range, etc.) is done in the service.
 */
export class UpdateScheduleDto {
  @IsOptional()
  @IsIn(['recurring', 'temporary', 'one_time'])
  type?: 'recurring' | 'temporary' | 'one_time';

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  dayOfWeek?: number[];

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(['morning', 'afternoon', 'evening'])
  period?: 'morning' | 'afternoon' | 'evening';
}
