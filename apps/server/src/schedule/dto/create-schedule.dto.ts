import { Transform } from 'class-transformer';
import {
  IsString,
  IsIn,
  IsDateString,
  IsArray,
  IsInt,
  Min,
  Max,
  Matches,
  ArrayNotEmpty,
  ValidateIf,
  IsNotEmpty,
} from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  hospitalId!: string;

  @IsIn(['recurring', 'temporary', 'one_time'])
  type!: 'recurring' | 'temporary' | 'one_time';

  @ValidateIf((o) => o.type === 'recurring')
  @IsArray()
  @ArrayNotEmpty()
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  dayOfWeek!: number[];

  @ValidateIf((o) => o.type === 'temporary')
  @IsDateString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    value ? new Date(value).toISOString().slice(0, 10) : value,
  )
  startDate?: string;

  @ValidateIf((o) => o.type === 'temporary')
  @IsDateString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    value ? new Date(value).toISOString().slice(0, 10) : value,
  )
  endDate?: string;

  @ValidateIf((o) => o.type === 'one_time')
  @IsDateString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    value ? new Date(value).toISOString().slice(0, 10) : value,
  )
  date?: string;

  // Accept 24-hour HH:mm or HH:mm:ss, or 12-hour with AM/PM; normalize to 24-hour HH:mm
  private static normalizeTime(val: any) {
    if (!val) return val;
    const s = String(val).trim();
    const re24 = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    const re24WithSeconds = /^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/;
    const re12 = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*([APap][Mm])$/;
    if (re24.test(s)) return s;
    if (re24WithSeconds.test(s)) return s.slice(0, 5);
    const m = s.match(re12);
    if (m) {
      let hh = Number(m[1]);
      const mm = m[2];
      const ampm = m[3].toUpperCase();
      if (ampm === 'AM') {
        if (hh === 12) hh = 0;
      } else {
        if (hh !== 12) hh += 12;
      }
      return `${hh.toString().padStart(2, '0')}:${mm}`;
    }
    return s;
  }

  @IsString()
  @Transform(({ value }) => CreateScheduleDto.normalizeTime(value))
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  startTime!: string;

  @IsString()
  @Transform(({ value }) => CreateScheduleDto.normalizeTime(value))
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  endTime!: string;

  @IsString()
  name!: string;

  @IsIn(['morning', 'afternoon', 'evening'])
  period!: 'morning' | 'afternoon' | 'evening';
}
