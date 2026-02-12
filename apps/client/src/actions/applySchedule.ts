import { createScheduleRes } from "@hap/contract";
import api from "@/lib/axios";

export async function applySchedule(data: any) {
  try {
    const response = await api.post<createScheduleRes>("/schedule/apply", data);
    return response.data;
  } catch (error) {
    throw error;
  }
}
