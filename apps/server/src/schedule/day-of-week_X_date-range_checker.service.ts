import { Injectable, BadRequestException } from '@nestjs/common';
import { DateTime } from 'luxon';

@Injectable()
export class DayOfWeekToDateRangeChecker {
  constructor() {}

  async dayOfWeekDateRangeChecker(
    dayOfWeek: number[],
    startDate: string | undefined,
    endDate: string | undefined,
    tz: string,
  ) {
    // basic validations
    if (!Array.isArray(dayOfWeek) || dayOfWeek.length === 0) return;

    // validate day numbers
    for (const d of dayOfWeek) {
      if (!Number.isInteger(d) || d < 0 || d > 6) {
        throw new BadRequestException(
          'dayOfWeek values must be integers between 0 (Sun) and 6 (Sat)',
        );
      }
    }

    // If endDate provided, startDate must also be provided
    if (endDate && !startDate) {
      throw new BadRequestException(
        'startDate is required when endDate is provided',
      );
    }

    // If both dates are present, ensure startDate <= endDate and that each weekday occurs at least once
    if (startDate && endDate) {
      const start = DateTime.fromISO(startDate, { zone: 'utc' });
      const end = DateTime.fromISO(endDate, { zone: 'utc' });
      if (!start.isValid) throw new BadRequestException('Invalid startDate');
      if (!end.isValid) throw new BadRequestException('Invalid endDate');
      if (end < start)
        throw new BadRequestException(
          'endDate must be the same as or after startDate',
        );

      // For each dayOfWeek, compute the first occurrence on or after start
      for (const d of dayOfWeek) {
        const targetWeekday = d === 0 ? 7 : d; // Luxon: Mon=1 .. Sun=7
        const daysUntil = (targetWeekday - start.weekday + 7) % 7;
        const occurrence = start.plus({ days: daysUntil });
        if (occurrence > end) {
          throw new BadRequestException(
            `Day of week ${d} does not occur between ${startDate} and ${endDate}`,
          );
        }
      }

      return;
    }

    // If no endDate (temporary/recurring without end), just make sure startDate (if present) allows at least one upcoming weekday
    if (startDate && !endDate) {
      const start = DateTime.fromISO(startDate, { zone: 'utc' });
      if (!start.isValid) throw new BadRequestException('Invalid startDate');

      // check that at least one day of week occurs within next 7 days (including start)
      const hasUpcoming = dayOfWeek.some((d) => {
        const targetWeekday = d === 0 ? 7 : d;
        const daysUntil = (targetWeekday - start.weekday + 7) % 7;
        const occurrence = start.plus({ days: daysUntil });
        return occurrence >= start && occurrence <= start.plus({ days: 7 });
      });

      if (!hasUpcoming) {
        throw new BadRequestException(
          'Provided dayOfWeek values do not fall on or after the provided startDate',
        );
      }

      return;
    }

    // No startDate and no endDate - nothing to validate
    return;
  }
}
