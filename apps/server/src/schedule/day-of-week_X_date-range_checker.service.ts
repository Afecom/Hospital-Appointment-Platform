import { Injectable, BadRequestException } from '@nestjs/common';
import { DateTime } from 'luxon';

@Injectable()
export class DayOfWeekToDateRangeChecker {
  constructor() {}

  async dayOfWeekDateRangeChecker(
    dayOfWeek: number[],
    date: string | undefined,
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

    // If endDate provided but no startDate, allow instant-activation schedules (no validation needed)
    if (endDate && !startDate) {
      // scenario: schedule should be active immediately until endDate (validated elsewhere if needed)
      return;
    }

    // If a one-time `date` was provided, ensure the provided dayOfWeek includes that date's weekday
    if (date) {
      const dt = DateTime.fromISO(date, { zone: tz }).startOf('day');
      if (!dt.isValid) throw new BadRequestException('Invalid date');
      // convert Luxon's weekday (1=Mon..7=Sun) to our 0=Sun..6=Sat
      const weekday = dt.weekday === 7 ? 0 : dt.weekday;
      const normalizedWeekday = weekday === 0 ? 0 : weekday; // keep 0 for Sunday
      // normalize incoming dayOfWeek values to 0..6
      const normalizedDayOfWeek = dayOfWeek.map((d) => (d === 0 ? 0 : d));
      if (!normalizedDayOfWeek.includes(normalizedWeekday)) {
        throw new BadRequestException(
          `Provided dayOfWeek values do not match the provided date ${date} in timezone ${tz}`,
        );
      }
      return;
    }

    // If both dates are present, ensure startDate <= endDate and that each weekday occurs at least once
    if (startDate && endDate) {
      const start = DateTime.fromISO(startDate, { zone: tz }).startOf('day');
      const end = DateTime.fromISO(endDate, { zone: tz }).endOf('day');
      if (!start.isValid) throw new BadRequestException('Invalid startDate');
      if (!end.isValid) throw new BadRequestException('Invalid endDate');
      if (end < start)
        throw new BadRequestException(
          'endDate must be the same as or after startDate',
        );

      // For each dayOfWeek, compute the first occurrence on or after start (in tz)
      for (const d of dayOfWeek) {
        const targetWeekday = d === 0 ? 7 : d; // Luxon: Mon=1 .. Sun=7
        const daysUntil = (targetWeekday - start.weekday + 7) % 7;
        const occurrence = start.plus({ days: daysUntil }).startOf('day');
        if (occurrence > end) {
          throw new BadRequestException(
            `Day of week ${d} does not occur between ${startDate} and ${endDate} in timezone ${tz}`,
          );
        }
      }

      return;
    }

    // If no endDate (temporary/recurring without end), just make sure startDate (if present) allows at least one upcoming weekday
    if (startDate && !endDate) {
      const start = DateTime.fromISO(startDate, { zone: tz }).startOf('day');
      if (!start.isValid) throw new BadRequestException('Invalid startDate');

      // check that at least one day of week occurs within next 7 days (including start) in given tz
      const windowEnd = start.plus({ days: 7 }).endOf('day');
      const hasUpcoming = dayOfWeek.some((d) => {
        const targetWeekday = d === 0 ? 7 : d;
        const daysUntil = (targetWeekday - start.weekday + 7) % 7;
        const occurrence = start.plus({ days: daysUntil }).startOf('day');
        return occurrence >= start && occurrence <= windowEnd;
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
