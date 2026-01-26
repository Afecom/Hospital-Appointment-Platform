"use server";

import api from "@/lib/axios";
import { DoctorApplication } from "@/lib/types";
import {
  getScheduleForAdminRes,
  scheduleApplicationSchedule,
} from "@hap/contract";

export const getDoctorApplications = async (
  status: string,
): Promise<DoctorApplication[]> => {
  try {
    const response = await api.get(
      `/doctor/hospital/application?status=${status}`,
    );
    return response.data.data.Applications;
  } catch (error) {
    throw new Error(`Failed to fetch ${status} doctors`);
  }
};

export const getSchedules = async (
  status: string,
): Promise<scheduleApplicationSchedule[]> => {
  try {
    const response = await api.get(`/schedule?status=${status}`);
    return response.data?.data?.schedules ?? [];
  } catch (error) {
    throw new Error(`Failed to fetch ${status} schedules`);
  }
};

export const scheduleAction = async (
  id: string,
  action: "approve" | "reject" | "undo" | "delete" | "deactivate",
) => {
  try {
    if (action !== "delete" && action !== "deactivate") {
      await api.patch(`/schedule/${action}/${id}`);
      return;
    } else if (action === "delete" || action === "deactivate") {
      await api.patch(`/schedule/${id}`, { action });
      return;
    }
    throw new Error(`Invalid action: ${action}`);
  } catch (error) {
    throw new Error(`Failed to ${action} schedule`);
  }
};
