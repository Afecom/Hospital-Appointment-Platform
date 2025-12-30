// schedule-overlap.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { DateTime } from 'luxon';
import { ScheduleStatus, ScheduleType } from '../../generated/prisma/enums.js';

type StatusType = ScheduleStatus;

interface IncomingSchedule {
  type: ScheduleType;
  // ONE_TIME uses `startDate` as the calendar date (YYYY-MM-DD)
  // TEMPORARY or bounded RECURRING
  startDate?: string; // "YYYY-MM-DD"
  endDate?: string; // "YYYY-MM-DD"
  // RECURRING
  dayOfWeek?: number[]; // 0 (Sun) - 6 (Sat)
  // times (local wall-clock)
  startTime: string; // "09:00"
  endTime: string; // "12:00"
  // schedule's timezone (IANA zone)
  timezone?: string; // will be filled from hospital.timezone by callers
}

@Injectable()
export class ScheduleOverlapService {
  constructor(private prisma: DatabaseService) {}

  /**
   * Public method: ensures no approved/pending schedule overlaps the incoming schedule.
   * Throws BadRequestException if conflict is found.
   */
  async ensureNoOverlap(doctorId: string, incoming: IncomingSchedule) {
    // Normalize and validate incoming (ensures date strings are valid and timezone exists)
    const dto = this.normalizeIncoming(incoming);

    // Query the DB for only possible conflicting candidates (narrowed set)
    const candidates = await this.findPossibleConflicts(doctorId, dto);

    // Final in-memory precise checks
    for (const c of candidates) {
      const candidate = this.mapDbScheduleToObject(c);

      // If date ranges/weeks don't intersect -> skip
      if (!this.dateOverlapExists(dto, candidate)) continue;

      // There exists at least one concrete day where both are active.
      // For that day we must compare their concrete instants (UTC) to find time overlap.
      // We'll get a representative overlapping date to combine with times.
      const overlappingDays = this.getRepresentativeOverlappingDates(
        dto,
        candidate,
      );

      // For each overlapping day check time overlap.
      for (const day of overlappingDays) {
        const aRange = this.instantRangeForScheduleOnDate(dto, day);
        const bRange = this.instantRangeForScheduleOnDate(candidate, day);

        if (!aRange || !bRange) continue; // conservative

        if (
          this.timesOverlap(aRange.start, aRange.end, bRange.start, bRange.end)
        ) {
          // Provide helpful structured payload with conflicting schedule details
          const conflictName = (c as any).name ?? c.id;
          throw new BadRequestException({
            message: `Schedule overlaps with existing schedule "${conflictName}".`,
            conflict: {
              id: c.id,
              name: conflictName,
              // return conflicting schedule UTC instants for the overlapping day
              start: bRange.start.toISOString(),
              end: bRange.end.toISOString(),
            },
          });
        }
      }
    }
  }

  // -------------------------
  // Normalization helpers
  // -------------------------
  private normalizeIncoming(incoming: IncomingSchedule): IncomingSchedule {
    // light validation and normalization: ensure timezone and date formats
    const timezone = incoming.timezone || 'UTC';
    // convert date strings to ISO-like format check via luxon
    const parseDate = (d?: string) =>
      d ? DateTime.fromISO(d, { zone: timezone }) : null;

    if (incoming.type === 'one_time') {
      if (!incoming.startDate)
        throw new BadRequestException('ONE_TIME schedule requires startDate');
      const dt = parseDate(incoming.startDate);
      if (!dt || !dt.isValid)
        throw new BadRequestException('Invalid startDate');
    } else if (incoming.type === 'temporary') {
      if (!incoming.startDate || !incoming.endDate)
        throw new BadRequestException(
          'TEMPORARY requires startDate and endDate',
        );
      const s = parseDate(incoming.startDate);
      const e = parseDate(incoming.endDate);
      if (!s?.isValid || !e?.isValid || s.toMillis() > e.toMillis())
        throw new BadRequestException('Invalid temporary date range');
    } else if (incoming.type === 'recurring') {
      if (!incoming.dayOfWeek || incoming.dayOfWeek.length === 0)
        throw new BadRequestException('RECURRING needs dayOfWeek');
      // startDate / endDate optional - validate if present
      if (incoming.startDate && !parseDate(incoming.startDate)?.isValid)
        throw new BadRequestException('Invalid startDate');
      if (incoming.endDate && !parseDate(incoming.endDate)?.isValid)
        throw new BadRequestException('Invalid endDate');
      if (incoming.startDate && incoming.endDate) {
        const s = parseDate(incoming.startDate)!;
        const e = parseDate(incoming.endDate)!;
        if (s.toMillis() > e.toMillis())
          throw new BadRequestException('Recurring startDate > endDate');
      }
    }

    // Accept either 24-hour HH:mm or 12-hour with AM/PM — normalize to 24-hour for internal checks
    const normalizeTime = (val: string) => {
      if (!val) return val;
      const s = String(val).trim();
      const re24 = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
      const re12 = /^(0?[1-9]|1[0-2]):([0-5]\d)\s*([APap][Mm])$/;
      if (re24.test(s)) return s;
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
    };

    incoming.startTime = normalizeTime(incoming.startTime);
    incoming.endTime = normalizeTime(incoming.endTime);

    const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    if (
      !timeRegex.test(incoming.startTime) ||
      !timeRegex.test(incoming.endTime)
    ) {
      throw new BadRequestException(
        'startTime/endTime must be "HH:mm" (24-hour) or a valid 12-hour string with AM/PM',
      );
    }

    return { ...incoming, timezone };
  }

  // -------------------------
  // Candidate DB query narrowing
  // -------------------------
  private async findPossibleConflicts(doctorId: string, dto: IncomingSchedule) {
    const baseWhere: any = {
      doctorId,
      status: { in: ['approved', 'pending'] as StatusType[] },
    };

    const or: any[] = [];

    // recurring candidates: narrow by weekdays when possible
    if (dto.type === 'one_time') {
      const dt = DateTime.fromISO(dto.startDate!, {
        zone: dto.timezone || 'UTC',
      });
      or.push({ type: 'recurring', dayOfWeek: { has: dt.weekday % 7 } }); // luxon: weekday 1(Mon)-7(Sun), convert to 0-6
    } else if (dto.type === 'temporary') {
      // compute weekdays in the temporary range and use hasSome to narrow recurring
      const days = this.weekdaysInRange(
        dto.startDate!,
        dto.endDate!,
        dto.timezone || 'UTC',
      );
      if (days.length)
        or.push({ type: 'recurring', dayOfWeek: { hasSome: days } });
      else or.push({ type: 'recurring' });
    } else {
      // incoming is RECURRING
      if (dto.dayOfWeek && dto.dayOfWeek.length)
        or.push({ type: 'recurring', dayOfWeek: { hasSome: dto.dayOfWeek } });
      else or.push({ type: 'recurring' });
    }

    // temporary candidates (DB TEMPORARY) that might intersect with incoming
    if (dto.type === 'one_time') {
      or.push({
        type: 'temporary',
        startDate: { lte: dto.startDate },
        endDate: { gte: dto.startDate },
      });
    } else if (dto.type === 'temporary') {
      or.push({
        type: 'temporary',
        startDate: { lte: dto.endDate },
        endDate: { gte: dto.startDate },
      });
    } else {
      // incoming RECURRING -> temporaries that exist (we could narrow by horizon; keep simple here)
      or.push({ type: 'temporary' });
    }

    // one-time candidates
    if (dto.type === 'one_time') {
      or.push({ type: 'one_time', startDate: dto.startDate });
    } else if (dto.type === 'temporary') {
      or.push({
        type: 'one_time',
        startDate: { gte: dto.startDate, lte: dto.endDate },
      });
    } else {
      // RECURRING incoming -> fetch one-time events in a reasonable horizon (next 365 days) to compare
      const now = DateTime.utc();
      const horizonEnd = now.plus({ days: 365 }).toISODate();
      or.push({
        type: 'one_time',
        startDate: { gte: now.toISODate(), lte: horizonEnd },
      });
    }

    const candidates = await this.prisma.schedule.findMany({
      where: {
        ...baseWhere,
        OR: or,
      },
      select: {
        name: true,
        id: true,
        type: true,
        startTime: true,
        endTime: true,
        startDate: true,
        endDate: true,
        dayOfWeek: true,
        status: true,
        hospital: { select: { timezone: true } },
      },
    });

    return candidates;
  }

  // -------------------------
  // Map DB schedule into object
  // -------------------------
  private mapDbScheduleToObject(db: {
    id: string;
    type: ScheduleType;
    dayOfWeek: number[];
    startDate: string | null;
    endDate: string | null;
    startTime: string;
    endTime: string;
    hospital?: { timezone?: string | null } | null;
    status: ScheduleStatus;
  }): IncomingSchedule {
    return {
      type: db.type,
      startDate: db.startDate ? db.startDate : undefined,
      endDate: db.endDate ? db.endDate : undefined,
      dayOfWeek: db.dayOfWeek ?? [],
      startTime: db.startTime,
      endTime: db.endTime,
      timezone: db.hospital?.timezone || 'UTC',
    };
  }

  // -------------------------
  // Date overlap detection
  // -------------------------
  private dateOverlapExists(a: IncomingSchedule, b: IncomingSchedule): boolean {
    // helper to convert one-time date string -> DateTime in schedule timezone
    const toDateTime = (dateStr: string, tz: string) =>
      DateTime.fromISO(dateStr, { zone: tz }).startOf('day');

    // ONE vs ONE
    if (a.type === 'one_time' && b.type === 'one_time') {
      const A = toDateTime(a.startDate!, a.timezone || 'UTC');
      const B = toDateTime(b.startDate!, b.timezone || 'UTC');
      return A.hasSame(B, 'day');
    }

    // TEMP vs TEMP (calendar-range overlap on local dates)
    if (a.type === 'temporary' && b.type === 'temporary') {
      const aS = DateTime.fromISO(a.startDate!, {
        zone: a.timezone || 'UTC',
      }).startOf('day');
      const aE = DateTime.fromISO(a.endDate!, {
        zone: a.timezone || 'UTC',
      }).endOf('day');
      const bS = DateTime.fromISO(b.startDate!, {
        zone: b.timezone || 'UTC',
      }).startOf('day');
      const bE = DateTime.fromISO(b.endDate!, {
        zone: b.timezone || 'UTC',
      }).endOf('day');
      return aS <= bE && bS <= aE;
    }

    // TEMP vs ONE
    if (a.type === 'temporary' && b.type === 'one_time') {
      const bDt = DateTime.fromISO(b.startDate!, {
        zone: b.timezone || 'UTC',
      }).startOf('day');
      const aS = DateTime.fromISO(a.startDate!, { zone: a.timezone }).startOf(
        'day',
      );
      const aE = DateTime.fromISO(a.endDate!, {
        zone: a.timezone || 'UTC',
      }).endOf('day');
      // convert bDt into a.timezone calendar day by shifting zone
      const bInAzone = bDt.setZone(a.timezone || 'UTC');
      return bInAzone >= aS && bInAzone <= aE;
    }
    if (b.type === 'temporary' && a.type === 'one_time') {
      const aDt = DateTime.fromISO(a.startDate!, {
        zone: a.timezone || 'UTC',
      }).startOf('day');
      const bS = DateTime.fromISO(b.startDate!, {
        zone: b.timezone || 'UTC',
      }).startOf('day');
      const bE = DateTime.fromISO(b.endDate!, {
        zone: b.timezone || 'UTC',
      }).endOf('day');
      const aInBzone = aDt.setZone(b.timezone || 'UTC');
      return aInBzone >= bS && aInBzone <= bE;
    }

    // RECURRING vs ONE_TIME
    if (a.type === 'recurring' && b.type === 'one_time') {
      const bDt = DateTime.fromISO(b.startDate!, {
        zone: b.timezone || 'UTC',
      }).setZone(a.timezone || 'UTC');
      return (a.dayOfWeek || []).includes(bDt.weekday % 7);
    }
    if (b.type === 'recurring' && a.type === 'one_time') {
      const aDt = DateTime.fromISO(a.startDate!, {
        zone: a.timezone || 'UTC',
      }).setZone(b.timezone || 'UTC');
      return (b.dayOfWeek || []).includes(aDt.weekday % 7);
    }

    // RECURRING vs TEMPORARY
    if (a.type === 'recurring' && b.type === 'temporary') {
      return this.recurringIntersectsTemporary(a, b);
    }
    if (b.type === 'recurring' && a.type === 'temporary') {
      return this.recurringIntersectsTemporary(b, a);
    }

    // RECURRING vs RECURRING
    if (a.type === 'recurring' && b.type === 'recurring') {
      // if both have boundaries, ensure date ranges overlap OR if none, only need day-of-week intersection
      if (a.startDate && b.startDate) {
        const aS = DateTime.fromISO(a.startDate!, {
          zone: a.timezone || 'UTC',
        }).startOf('day');
        const aE = a.endDate
          ? DateTime.fromISO(a.endDate!, { zone: a.timezone || 'UTC' }).endOf(
              'day',
            )
          : DateTime.fromISO('9999-12-31');
        const bS = DateTime.fromISO(b.startDate!, {
          zone: b.timezone || 'UTC',
        }).startOf('day');
        const bE = b.endDate
          ? DateTime.fromISO(b.endDate!, { zone: b.timezone || 'UTC' }).endOf(
              'day',
            )
          : DateTime.fromISO('9999-12-31');
        if (aS > bE || bS > aE) return false;
      }
      // week day intersection
      return (a.dayOfWeek || []).some((d) => (b.dayOfWeek || []).includes(d));
    }

    return false;
  }

  // -------------------------
  // recurring vs temporary helper: does recurring's weekdays appear inside temp range?
  // -------------------------
  private recurringIntersectsTemporary(
    rec: IncomingSchedule,
    temp: IncomingSchedule,
  ): boolean {
    // iterate days in temp range (careful: limit if huge)
    const s = DateTime.fromISO(temp.startDate!, {
      zone: temp.timezone,
    }).startOf('day');
    const e = DateTime.fromISO(temp.endDate!, { zone: temp.timezone }).startOf(
      'day',
    );
    // safety: cap to 365 days iteration for performance
    const maxDays = 365;
    const days = Math.min(
      Math.max(0, Math.floor(e.diff(s, 'days').days) + 1),
      maxDays,
    );
    for (let i = 0; i < days; i++) {
      const day = s.plus({ days: i }).setZone(rec.timezone);
      const dow = day.weekday % 7;
      if ((rec.dayOfWeek || []).includes(dow)) return true;
    }
    return false;
  }

  // -------------------------
  // get representative overlapping dates (as local YYYY-MM-DD strings in the doctor's timezone)
  // For efficiency we only return a small set of dates to check time overlap (e.g., single date or a handful).
  // -------------------------
  private getRepresentativeOverlappingDates(
    a: IncomingSchedule,
    b: IncomingSchedule,
  ): string[] {
    // If there's a ONE_TIME involved, return that date (startDate)
    if (a.type === 'one_time' && b.type === 'one_time') return [a.startDate!];
    if (a.type === 'one_time') return [a.startDate!];
    if (b.type === 'one_time') return [b.startDate!];

    // If one is TEMPORARY and other is TEMPORARY or RECURRING:
    // return the first overlapping date within the intersection window in the timezone of the schedule A (doctor/timezone)
    let start: DateTime;
    let end: DateTime;
    if (a.type === 'temporary') {
      start = DateTime.fromISO(a.startDate!, { zone: a.timezone }).startOf(
        'day',
      );
      end = DateTime.fromISO(a.endDate!, { zone: a.timezone }).startOf('day');
    } else if (b.type === 'temporary') {
      start = DateTime.fromISO(b.startDate!, { zone: b.timezone }).startOf(
        'day',
      );
      end = DateTime.fromISO(b.endDate!, { zone: b.timezone }).startOf('day');
    } else {
      // both recurring with optional ranges: if ranges exist use overlap of ranges, else use next 7 days
      const now = DateTime.local().setZone(a.timezone).startOf('day');
      const defaultEnd = now.plus({ days: 7 });
      const aS = a.startDate
        ? DateTime.fromISO(a.startDate!, { zone: a.timezone }).startOf('day')
        : now;
      const aE = a.endDate
        ? DateTime.fromISO(a.endDate!, { zone: a.timezone }).startOf('day')
        : defaultEnd;
      const bS = b.startDate
        ? DateTime.fromISO(b.startDate!, { zone: b.timezone }).startOf('day')
        : now;
      const bE = b.endDate
        ? DateTime.fromISO(b.endDate!, { zone: b.timezone }).startOf('day')
        : defaultEnd;
      start = aS.toMillis() > bS.toMillis() ? aS : bS;
      end = aE.toMillis() < bE.toMillis() ? aE : bE;
      if (start.toMillis() > end.toMillis()) {
        start = now;
        end = now;
      }
    }

    // find up to N representative days where both are active (prefer earliest)
    const result: string[] = [];
    const maxCheck = 7; // check up to 7 days
    let iter = 0;
    let dt = start;
    while (dt.toMillis() <= end.toMillis() && iter < maxCheck) {
      // check if both are active on this calendar day
      const aActive = this.scheduleActiveOnDate(a, dt);
      const bActive = this.scheduleActiveOnDate(b, dt);
      if (aActive && bActive) {
        result.push(dt.toISODate()!);
      }
      dt = dt.plus({ days: 1 });
      iter++;
    }

    // fallback: if empty, check first day of intersection
    if (result.length === 0) {
      result.push(start.toISODate()!);
    }
    return result;
  }

  // -------------------------
  // Check if schedule is active on a specific local day (DateTime day in schedule's timezone)
  // -------------------------
  private scheduleActiveOnDate(s: IncomingSchedule, day: DateTime): boolean {
    if (s.type === 'one_time') {
      const d = DateTime.fromISO(s.startDate!, { zone: s.timezone }).startOf(
        'day',
      );
      return d.hasSame(day.setZone(s.timezone), 'day');
    }
    if (s.type === 'temporary') {
      const sS = DateTime.fromISO(s.startDate!, { zone: s.timezone }).startOf(
        'day',
      );
      const sE = DateTime.fromISO(s.endDate!, { zone: s.timezone }).startOf(
        'day',
      );
      const dayInZone = day.setZone(s.timezone);
      return (
        dayInZone.toMillis() >= sS.toMillis() &&
        dayInZone.toMillis() <= sE.toMillis()
      );
    }
    // RECURRING
    const dow = day.setZone(s.timezone).weekday % 7;
    // check optional boundaries
    if (s.startDate && s.endDate) {
      const sS = DateTime.fromISO(s.startDate!, { zone: s.timezone }).startOf(
        'day',
      );
      const sE = DateTime.fromISO(s.endDate!, { zone: s.timezone }).startOf(
        'day',
      );
      const dayInZone = day.setZone(s.timezone);
      if (
        dayInZone.toMillis() < sS.toMillis() ||
        dayInZone.toMillis() > sE.toMillis()
      )
        return false;
    }
    return (s.dayOfWeek || []).includes(dow);
  }

  // -------------------------
  // Given schedule and a calendar day (YYYY-MM-DD), return UTC instant range {start, end}
  // -------------------------
  private instantRangeForScheduleOnDate(
    s: IncomingSchedule,
    dateIso: string,
  ): { start: Date; end: Date } | null {
    // combine the dateIso and s.startTime/s.endTime under schedule timezone, produce UTC JS Date
    const zone = s.timezone || 'UTC';
    // create DateTime at the schedule's timezone
    try {
      // ensure times are normalized to HH:mm (24-hour). We allow input of 12-hour formats elsewhere
      const parseTime = (t: string) => {
        const parts = t.split(':');
        return { h: Number(parts[0]), m: Number(parts[1]) };
      };
      const a = parseTime(s.startTime);
      const b = parseTime(s.endTime);
      const startDT = DateTime.fromISO(dateIso, { zone })
        .set({
          hour: a.h,
          minute: a.m,
          second: 0,
          millisecond: 0,
        })
        .toUTC();

      const endDT = DateTime.fromISO(dateIso, { zone })
        .set({
          hour: b.h,
          minute: b.m,
          second: 0,
          millisecond: 0,
        })
        .toUTC();

      // handle crossing-midnight (end <= start means end is next day)
      let end = endDT;
      if (end.toMillis() <= startDT.toMillis()) {
        end = end.plus({ days: 1 });
      }

      return { start: startDT.toJSDate(), end: end.toJSDate() };
    } catch (e) {
      return null;
    }
  }

  // -------------------------
  // Time overlap check for two UTC instants
  // -------------------------
  private timesOverlap(
    aStart: Date,
    aEnd: Date,
    bStart: Date,
    bEnd: Date,
  ): boolean {
    return aStart < bEnd && bStart < aEnd;
  }

  // -------------------------
  // weekdays in range (0-6)
  // -------------------------
  private weekdaysInRange(
    startIso: string,
    endIso: string,
    tz: string,
  ): number[] {
    const s = DateTime.fromISO(startIso, { zone: tz }).startOf('day');
    const e = DateTime.fromISO(endIso, { zone: tz }).startOf('day');
    const days: number[] = [];
    if (!s.isValid || !e.isValid || s > e) return days;
    const maxDays = 365;
    const total = Math.min(maxDays, Math.floor(e.diff(s, 'days').days) + 1);
    for (let i = 0; i < total; i++) {
      days.push(s.plus({ days: i }).weekday % 7);
    }
    return Array.from(new Set(days));
  }
}
