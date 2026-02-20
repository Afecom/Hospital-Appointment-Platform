"use server";

import api from "@/lib/axios";
import type {
  OperatorAppointmentsResponse,
  OperatorKPIsResponse,
} from "@hap/contract";

export type AppointmentStatus =
  | "PENDING"
  | "APPROVED"
  | "RESCHEDULED"
  | "REFUNDED"
  | "EXPIRED"
  | "COMPLETED"
  | "CANCELLED";

export type BookingSource = "Web" | "Operator" | "APP" | "Call Center";

export interface AppointmentFilters {
  status?: AppointmentStatus | "ALL";
  source?: BookingSource | "ALL";
  doctorId?: string | "ALL";
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface FetchAppointmentsParams {
  page?: number;
  limit?: number;
  filters?: AppointmentFilters;
}

export interface FetchAppointmentsResult {
  data: any[];
  total: number;
  page: number;
  totalPages: number;
}

export interface KPIData {
  pending: number;
  approvedToday: number;
  rescheduledToday: number;
  refunds: number;
  totalToday: number;
  slotUtilization: number;
}

// Helper to transform backend status to frontend status
function transformStatus(status: string): AppointmentStatus {
  const statusMap: Record<string, AppointmentStatus> = {
    pending: "PENDING",
    approved: "APPROVED",
    rescheduled: "RESCHEDULED",
    refunded: "REFUNDED",
    expired: "EXPIRED",
    completed: "COMPLETED",
    cancelled: "CANCELLED",
  };
  return statusMap[status.toLowerCase()] || "PENDING";
}

// Helper to transform backend source to frontend source
function transformSource(source: string): BookingSource {
  const sourceMap: Record<string, BookingSource> = {
    web: "Web",
    app: "APP",
    call_center: "Call Center",
    operator: "Operator",
  };
  return sourceMap[source.toLowerCase()] || "Web";
}

// Transform backend appointment to frontend format
function transformAppointment(apt: any): any {
  const slotDate = apt.originalSlot?.date
    ? new Date(apt.originalSlot.date).toISOString().split("T")[0]
    : apt.approvedSlotStart
      ? new Date(apt.approvedSlotStart).toISOString().split("T")[0]
      : "";

  const slotTime = apt.originalSlot?.slotStart
    ? new Date(apt.originalSlot.slotStart).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : apt.approvedSlotStart
      ? new Date(apt.approvedSlotStart).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      : "";

  return {
    id: apt.id,
    patient: apt.User_Appointment_customerIdToUser?.fullName || "Unknown",
    patientName: apt.User_Appointment_customerIdToUser?.fullName || "Unknown",
    phone: apt.User_Appointment_customerIdToUser?.phoneNumber || "",
    doctor: apt.Doctor?.User?.fullName || "Unknown",
    doctorId: apt.doctorId,
    doctorName: apt.Doctor?.User?.fullName || "Unknown",
    date: slotDate,
    time: slotTime,
    source: transformSource(apt.source || "web"),
    status: transformStatus(apt.status),
    createdAt: apt.createdAt
      ? new Date(apt.createdAt).toLocaleString("en-US")
      : "",
    isFree: apt.isFree || false,
    isPaid: apt.isPaid || false,
    paymentStatus: apt.isFree
      ? "UNPAID"
      : apt.isPaid
        ? "PAID"
        : "UNPAID",
    notes: apt.notes || "",
    hospitalId: apt.hospitalId,
    newAppointmentId: apt.newSlotId,
  };
}

export const fetchOperatorAppointments = async (
  params: FetchAppointmentsParams = {},
): Promise<FetchAppointmentsResult> => {
  // Return type matches OperatorAppointmentsResponse from contract
  try {
    const { page = 1, limit = 10, filters = {} } = params;
    const queryParams = new URLSearchParams();

    queryParams.append("page", String(page));
    queryParams.append("limit", String(limit));

    if (filters.status && filters.status !== "ALL") {
      queryParams.append("status", filters.status.toLowerCase());
    }
    if (filters.source && filters.source !== "ALL") {
      const sourceMap: Record<BookingSource, string> = {
        Web: "web",
        APP: "app",
        "Call Center": "call_center",
        Operator: "operator",
      };
      queryParams.append("source", sourceMap[filters.source] || "web");
    }
    if (filters.doctorId && filters.doctorId !== "ALL") {
      queryParams.append("doctorId", filters.doctorId);
    }
    if (filters.dateFrom) {
      queryParams.append("dateFrom", filters.dateFrom);
    }
    if (filters.dateTo) {
      queryParams.append("dateTo", filters.dateTo);
    }
    if (filters.search) {
      queryParams.append("search", filters.search);
    }

    const response = await api.get<OperatorAppointmentsResponse>(
      `/appointment/operator?${queryParams.toString()}`,
    );
    const appointments = response.data.appointments || [];
    const meta = response.data.meta || {};

    return {
      data: appointments.map(transformAppointment),
      total: meta.total || 0,
      page: meta.page || page,
      totalPages: meta.totalPages || 1,
    };
  } catch (error) {
    const anyErr = error as any;
    const resp = anyErr?.response?.data;
    let message = "Failed to fetch appointments";
    if (resp) {
      if (typeof resp === "string") message = resp;
      else if (Array.isArray(resp?.message))
        message = resp.message.join(", ");
      else if (resp?.message) message = resp.message;
      else if (resp?.error) message = resp.error;
      else message = JSON.stringify(resp);
    } else if (anyErr?.message) {
      message = anyErr.message;
    }
    throw new Error(message);
  }
};

export const approveAppointment = async (id: string): Promise<any> => {
  try {
    const response = await api.patch(`/appointment/${id}/approve`);
    return transformAppointment(response.data);
  } catch (error) {
    const anyErr = error as any;
    const resp = anyErr?.response?.data;
    let message = "Failed to approve appointment";
    if (resp) {
      if (typeof resp === "string") message = resp;
      else if (Array.isArray(resp?.message))
        message = resp.message.join(", ");
      else if (resp?.message) message = resp.message;
      else if (resp?.error) message = resp.error;
      else message = JSON.stringify(resp);
    } else if (anyErr?.message) {
      message = anyErr.message;
    }
    throw new Error(message);
  }
};

export const rescheduleAppointment = async (
  id: string,
  newSlotId: string,
): Promise<any> => {
  try {
    const response = await api.patch(`/appointment/${id}/reschedule`, {
      newSlotId,
    });
    return transformAppointment(response.data);
  } catch (error) {
    const anyErr = error as any;
    const resp = anyErr?.response?.data;
    let message = "Failed to reschedule appointment";
    if (resp) {
      if (typeof resp === "string") message = resp;
      else if (Array.isArray(resp?.message))
        message = resp.message.join(", ");
      else if (resp?.message) message = resp.message;
      else if (resp?.error) message = resp.error;
      else message = JSON.stringify(resp);
    } else if (anyErr?.message) {
      message = anyErr.message;
    }
    throw new Error(message);
  }
};

export const refundAppointment = async (id: string): Promise<any> => {
  try {
    const response = await api.patch(`/appointment/${id}/refund`);
    return transformAppointment(response.data);
  } catch (error) {
    const anyErr = error as any;
    const resp = anyErr?.response?.data;
    let message = "Failed to refund appointment";
    if (resp) {
      if (typeof resp === "string") message = resp;
      else if (Array.isArray(resp?.message))
        message = resp.message.join(", ");
      else if (resp?.message) message = resp.message;
      else if (resp?.error) message = resp.error;
      else message = JSON.stringify(resp);
    } else if (anyErr?.message) {
      message = anyErr.message;
    }
    throw new Error(message);
  }
};

export const fetchOperatorKPIs = async (): Promise<KPIData> => {
  try {
    const response = await api.get<OperatorKPIsResponse>(
      "/appointment/operator/kpis",
    );
    return response.data;
  } catch (error) {
    const anyErr = error as any;
    const resp = anyErr?.response?.data;
    let message = "Failed to fetch KPIs";
    if (resp) {
      if (typeof resp === "string") message = resp;
      else if (Array.isArray(resp?.message))
        message = resp.message.join(", ");
      else if (resp?.message) message = resp.message;
      else if (resp?.error) message = resp.error;
      else message = JSON.stringify(resp);
    } else if (anyErr?.message) {
      message = anyErr.message;
    }
    throw new Error(message);
  }
};

export const fetchAppointmentDetails = async (id: string): Promise<any> => {
  try {
    const response = await api.get(`/appointment/${id}`);
    return transformAppointment(response.data);
  } catch (error) {
    const anyErr = error as any;
    const resp = anyErr?.response?.data;
    let message = "Failed to fetch appointment details";
    if (resp) {
      if (typeof resp === "string") message = resp;
      else if (Array.isArray(resp?.message))
        message = resp.message.join(", ");
      else if (resp?.message) message = resp.message;
      else if (resp?.error) message = resp.error;
      else message = JSON.stringify(resp);
    } else if (anyErr?.message) {
      message = anyErr.message;
    }
    throw new Error(message);
  }
};
