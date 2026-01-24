import api from "@/lib/axios";
import { approveScheduleRes } from "@hap/contract";

export default async function approveSchedule(id: string) {
  try {
    const updatedSchedule: approveScheduleRes = await api.patch(
      `/schedule/approve/${id}`,
    );
    return updatedSchedule;
  } catch (error) {
    throw new Error("Failed to approve schedule");
  }
}
