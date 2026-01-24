"use server";

import api from "@/lib/axios";
import { approveScheduleRes } from "@hap/contract";
import { revalidatePath } from "next/cache";

export async function approveSchedule(
  id: string,
  status: "approve" | "reject",
) {
  try {
    if (status === "reject") {
      const updatedSchedule: approveScheduleRes = await api.patch(
        `/schedule/reject/${id}`,
      );
      revalidatePath("/hospital-admin/schedule/applications");
      return updatedSchedule;
    } else {
      const updatedSchedule: approveScheduleRes = await api.patch(
        `/schedule/approve/${id}`,
      );
      revalidatePath("/hospital-admin/schedule/applications");
      return updatedSchedule;
    }
  } catch (error) {
    throw new Error("Failed to approve schedule");
  }
}
