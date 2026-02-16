import { Injectable, BadRequestException } from '@nestjs/common';
import { DateTime } from 'luxon';

/**
 * Luxon weekday: 1 = Mon .. 7 = Sun.
 * Our dayOfWeek: 0 = Sun, 1 = Mon .. 6 = Sat.
 */
function weekdayTo0to6(weekday: number): number {
  return weekday === 7 ? 0 : weekday;
}

function parseInZone(iso: string, tz: string): DateTime | null {
  const dt = DateTime.fromISO(iso, { zone: tz }).startOf('day');
  return dt.isValid ? dt : null;
}

@Injectable()
export class DayOfWeekToDateRangeChecker {
  /**
   * Validates that dayOfWeek is consistent with the given date or date range in the given timezone.
   * - One-time: dayOfWeek must include the weekday of the given date.
   * - Range (start + end): start <= end, and each day in dayOfWeek must occur at least once in [start, end].
   * - Range (start only): at least one day in dayOfWeek must occur on or after start within 7 days.
   * Does nothing if dayOfWeek is empty (caller may allow that for unbounded recurring).
   */
  async dayOfWeekDateRangeChecker(
    dayOfWeek: number[],
    date: string | undefined,
    startDate: string | undefined,
    endDate: string | undefined,
    tz: string,
  ): Promise<void> {
    const zone = tz || 'UTC';

    if (!Array.isArray(dayOfWeek) || dayOfWeek.length === 0) {
      return;
    }

    for (const d of dayOfWeek) {
      if (!Number.isInteger(d) || d < 0 || d > 6) {
        throw new BadRequestException(
          'dayOfWeek must be integers between 0 (Sun) and 6 (Sat)',
        );
      }
    }

    const normalizedDow = [...new Set(dayOfWeek)];

    // ---- One-time: single date ----
    if (date && date.trim() !== '') {
      const dt = parseInZone(date.trim(), zone);
      if (!dt) {
        throw new BadRequestException(`Invalid date: ${date}`);
      }
      const expectedDay = weekdayTo0to6(dt.weekday);
      if (!normalizedDow.includes(expectedDay)) {
        throw new BadRequestException(
          `The date ${date} falls on ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][expectedDay]} in ${zone}. dayOfWeek must include ${expectedDay}.`,
        );
      }
      return;
    }

    // ---- Range: start + end ----
    if (startDate && startDate.trim() !== '' && endDate && endDate.trim() !== '') {
      const start = parseInZone(startDate.trim(), zone);
      const end = parseInZone(endDate.trim(), zone);
      if (!start) {
        throw new BadRequestException(`Invalid startDate: ${startDate}`);
      }
      if (!end) {
        throw new BadRequestException(`Invalid endDate: ${endDate}`);
      }
      if (end < start) {
        throw new BadRequestException(
          'endDate must be on or after startDate',
        );
      }

      for (const d of normalizedDow) {
        const luxonD = d === 0 ? 7 : d;
        const daysUntil = (luxonD - start.weekday + 7) % 7;
        const firstOccurrence = start.plus({ days: daysUntil }).startOf('day');
        if (firstOccurrence > end) {
          throw new BadRequestException(
            `Day ${d} (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]}) does not occur between ${startDate} and ${endDate} in ${zone}.`,
          );
        }
      }
      return;
    }

    // ---- Start only (no end) ----
    if (startDate && startDate.trim() !== '') {
      const start = parseInZone(startDate.trim(), zone);
      if (!start) {
        throw new BadRequestException(`Invalid startDate: ${startDate}`);
      }
      const windowEnd = start.plus({ days: 7 }).endOf('day');
      const hasUpcoming = normalizedDow.some((d) => {
        const luxonD = d === 0 ? 7 : d;
        const daysUntil = (luxonD - start.weekday + 7) % 7;
        const occurrence = start.plus({ days: daysUntil }).startOf('day');
        return occurrence >= start && occurrence <= windowEnd;
      });
      if (!hasUpcoming) {
        throw new BadRequestException(
          'At least one selected day of week must occur on or within 7 days after startDate.',
        );
      }
      return;
    }

    // No date / no start: nothing to validate
  }
}
