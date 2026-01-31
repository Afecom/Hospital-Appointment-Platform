"use server";

import api from "@/lib/axios";
import { DoctorApplication } from "@/lib/types";
import {
  approveRejectScheuleRes,
  scheduleActionRes,
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
    const anyErr = error as any;
    const resp = anyErr?.response?.data;
    let message = `Failed to fetch ${status} doctors`;
    if (resp) {
      if (typeof resp === "string") message = resp;
      else if (Array.isArray(resp?.message)) message = resp.message.join(", ");
      else if (resp?.message) message = resp.message;
      else if (resp?.error) message = resp.error;
      else message = JSON.stringify(resp);
    } else if (anyErr?.message) {
      message = anyErr.message;
    }
    throw new Error(message);
  }
};

export const getSchedules = async (
  status?: string,
  expired?: boolean,
  deactivated?: boolean,
  page?: number,
  limit?: number,
): Promise<scheduleApplicationSchedule[]> => {
  try {
    const response = await api.get(
      `/schedule?status=${status}&page=${page}&limit=${limit}&expired=${expired}&deactivated=${deactivated}`,
    );
    return response.data?.data?.schedules ?? [];
  } catch (error) {
    const anyErr = error as any;
    const resp = anyErr?.response?.data;
    let message = `Failed to fetch ${status} schedules`;
    if (resp) {
      if (typeof resp === "string") message = resp;
      else if (Array.isArray(resp?.message)) message = resp.message.join(", ");
      else if (resp?.message) message = resp.message;
      else if (resp?.error) message = resp.error;
      else message = JSON.stringify(resp);
    } else if (anyErr?.message) {
      message = anyErr.message;
    }
    throw new Error(message);
  }
};

export const scheduleAction = async (
  id: string,
  action: "approve" | "reject" | "undo" | "delete" | "deactivate" | "activate",
) => {
  try {
    if (action === "approve" || action === "reject") {
      const res = await api.patch<approveRejectScheuleRes>(
        `/schedule/${action}/${id}`,
      );
      return res.data;
    } else {
      const { data } = await api.patch<scheduleActionRes>(`/schedule/${id}`, {
        action: action,
      });
      return data;
    }
  } catch (error) {
    const anyErr = error as any;
    const resp = anyErr?.response?.data;
    let message = `Failed to ${action} schedule`;
    if (resp) {
      if (typeof resp === "string") message = resp;
      else if (Array.isArray(resp?.message)) message = resp.message.join(", ");
      else if (resp?.message) message = resp.message;
      else if (resp?.error) message = resp.error;
      else message = JSON.stringify(resp);
    } else if (anyErr?.message) {
      message = anyErr.message;
    }
    throw new Error(message);
  }
};
