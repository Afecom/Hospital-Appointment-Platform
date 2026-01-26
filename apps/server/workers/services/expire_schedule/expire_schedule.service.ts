import { prisma } from '../../../src/lib/prisma.js';

async function expireSchedule(scheduleId: string) {
  try {
    const schedule = await prisma.schedule.findUniqueOrThrow({
      where: { id: scheduleId },
    });
    if (schedule.isExpired) return;
    await prisma.schedule.update({
      where: { id: scheduleId },
      data: { isExpired: true },
    });
  } catch (error) {
    console.error(
      `An error occured while trying to expire scheduleId: ${scheduleId}`,
      error,
    );
  }
}
export { expireSchedule };
