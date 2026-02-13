import { prisma } from '../../../src/lib/prisma.js';
import { DateTime } from 'luxon';

export async function fillMissingSlotsWorker(scheduleId: string) {
  // Fetch schedule + hospital (timezone)
  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: { Hospital: true },
  });

  if (!schedule) {
    console.error('Schedule not found');
    return;
  }

  // Guard: schedule must be active, not expired and deleted
  if (schedule.isDeactivated || schedule.isExpired || schedule.isDeleted) {
    return;
  }

  // Daily fill should not run for ONE_TIME schedules
  if (schedule.type === 'one_time') {
    return;
  }

  if (!schedule.Hospital?.timezone) {
    console.error(`Missing timezone for hospital: ${schedule.hospitalId}`);
    return;
  }

  const tz = schedule.Hospital.timezone;

  // Build "today" in hospital timezone
  const now = DateTime.now().setZone(tz).startOf('day');

  // Convert schedule start date into TZ
  if (!schedule.startDate) {
    // nothing to backfill when schedule has no explicit start date
    return;
  }

  const startDate = DateTime.fromISO(schedule.startDate, {
    zone: tz,
  }).startOf('day');

  // Eligibility rule:
  // Only run when (startDate <= now - 1)
  if (startDate > now.minus({ days: 1 })) {
    return;
  }

  // Compute scheduleLastGeneratedDate
  let lastGen = schedule.slotLastGeneratedDate
    ? DateTime.fromISO(schedule.slotLastGeneratedDate, { zone: tz }).startOf(
        'day',
      )
    : startDate.minus({ days: 1 }); // first run

  // Compute maxWindowEnd (14-day rolling window)
  let maxWindowEnd = now.plus({ days: 13 }).startOf('day');

  if (schedule.endDate) {
    const endDate = DateTime.fromISO(schedule.endDate, { zone: tz }).startOf(
      'day',
    );
    maxWindowEnd = DateTime.min(maxWindowEnd, endDate);
  }

  if (maxWindowEnd <= lastGen) {
    // Already fully up to date
    return;
  }

  // Generate missing days
  const missingDaysCount = maxWindowEnd.diff(lastGen, 'days').days;

  // Collect slot records and persist in batches (faster + skip duplicates)
  const slotsToCreate: Array<{
    scheduleId: string;
    slotStart: Date;
    slotEnd: Date;
    date: Date;
    status?: string;
  }> = [];

  for (let d = 1; d <= missingDaysCount; d++) {
    const slotDay = lastGen.plus({ days: d }).startOf('day');
    const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
    const [endHour, endMinute] = schedule.endTime.split(':').map(Number);

    // Build slot start & end Times in hospital TZ
    const slotStart = slotDay.set({ hour: startHour, minute: startMinute });
    const slotEnd = slotDay.set({ hour: endHour, minute: endMinute });

    // Skip invalid ranges
    if (slotEnd <= slotStart) continue;

    // Store as UTC JS Date for Prisma DateTime fields
    slotsToCreate.push({
      scheduleId: schedule.id,
      slotStart: slotStart.toUTC().toJSDate(),
      slotEnd: slotEnd.toUTC().toJSDate(),
      date: slotDay.startOf('day').toUTC().toJSDate(),
      status: 'available',
    });
  }

  // Persist in chunks using createMany + skipDuplicates to avoid races
  let created = 0;
  if (slotsToCreate.length > 0) {
    const chunkSize = 500;
    for (let i = 0; i < slotsToCreate.length; i += chunkSize) {
      const batch = slotsToCreate.slice(i, i + chunkSize).map((s) => ({
        scheduleId: s.scheduleId,
        slotStart: s.slotStart,
        slotEnd: s.slotEnd,
        date: s.date,
        status: s.status,
      }));

      try {
        const res = await prisma.slot.createMany({
          data: batch as any,
          skipDuplicates: true,
        });
        created += res.count ?? 0;
      } catch (err: any) {
        // If createMany fails (rare), fall back to per-row create with P2002 ignore
        for (const row of batch) {
          try {
            await prisma.slot.create({ data: row as any });
            created += 1;
          } catch (innerErr: any) {
            if (innerErr?.code === 'P2002') continue;
            console.error(
              'Failed creating slot fallback:',
              innerErr?.message || innerErr,
            );
          }
        }
      }
    }
  }

  // Update lastGeneratedDate
  await prisma.schedule.update({
    where: { id: schedule.id },
    data: {
      slotLastGeneratedDate: maxWindowEnd.toISO(),
    },
  });

  console.info(
    `Filled ${created} slot(s) (of ${missingDaysCount} day(s)) for schedule ${scheduleId}. Up to ${maxWindowEnd.toISODate()}`,
  );
}
