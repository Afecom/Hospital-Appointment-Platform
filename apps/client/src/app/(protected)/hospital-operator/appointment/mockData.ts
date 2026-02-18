import { addDays, toISODateString } from "../doctor/utils";
import { doctors } from "../doctor/mockData";
import type { Appointment, AppointmentStatus, BookingSource } from "./types";

const patientNames = [
  "Abel Tadesse",
  "Mahi Alemayehu",
  "Saron Bekele",
  "Yonas Mekonnen",
  "Tigist Assefa",
  "Daniel Getachew",
  "Meron Tesfaye",
  "Kebede Haile",
  "Sara Bekele",
  "Yohannes Mekonnen",
  "Marta Assefa",
  "Solomon Getachew",
  "Hanna Tadesse",
  "Alemayehu Tadesse",
  "Selamawit Girma",
  "Fitsum Kebede",
  "Ephrem Desta",
  "Nardos Abebe",
  "Dawit Hailu",
  "Tsion Worku",
  "Bereket Teshome",
  "Kidist Alemu",
  "Henok Asfaw",
  "Meron Hagos",
  "Yared Kebede",
];

const phones = [
  "+251911223344",
  "+251922334455",
  "+251933445566",
  "+251944556677",
  "+251955667788",
  "+251966778899",
  "+251977889900",
  "+251988990011",
  "+251999001122",
  "+251900112233",
  "+251911334455",
  "+251922445566",
  "+251933556677",
  "+251944667788",
  "+251955778899",
];

const sources: BookingSource[] = ["WEB", "APP", "CALL_CENTER", "OPERATOR"];
const statuses: AppointmentStatus[] = [
  "PENDING",
  "APPROVED",
  "RESCHEDULED",
  "REFUNDED",
  "COMPLETED",
];
const paymentStatuses = ["PAID", "UNPAID", "REFUNDED"] as const;
const times = [
  "08:00",
  "08:30",
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
];

function stableHash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function generateMockAppointments(): Appointment[] {
  const appointments: Appointment[] = [];
  const todayStr = toISODateString(new Date());

  for (let i = 0; i < 55; i++) {
    const seed = stableHash(`apt_${i}`);
    const doctor = doctors[i % doctors.length];
    const daysOffset = (seed % 14) - 4; // -4 to +9 days from today
    const date = addDays(todayStr, daysOffset);
    const statusIdx = (seed >> 4) % statuses.length;
    const status = statuses[statusIdx];
    const sourceIdx = (seed >> 8) % sources.length;
    const source = sources[sourceIdx];
    const time = times[(seed >> 12) % times.length];
    const patientIdx = (seed >> 2) % patientNames.length;
    const phoneIdx = (seed >> 6) % phones.length;

    let paymentStatus: "PAID" | "UNPAID" | "REFUNDED" = "PAID";
    if (status === "REFUNDED") paymentStatus = "REFUNDED";
    else if ((seed >> 10) % 5 === 0) paymentStatus = "UNPAID";

    appointments.push({
      id: `APT-${String(2000 + i).padStart(4, "0")}`,
      patientName: patientNames[patientIdx],
      phone: phones[phoneIdx],
      doctorId: doctor.id,
      doctorName: doctor.name,
      date,
      time,
      source,
      status,
      paymentStatus,
    });
  }

  return appointments.sort((a, b) => {
    const d = (a.date ?? "").localeCompare(b.date ?? "");
    if (d !== 0) return d;
    return (a.time ?? "").localeCompare(b.time ?? "");
  });
}

export const mockAppointments = generateMockAppointments();

export type FetchAppointmentsParams = {
  page: number;
  limit: number;
  filters?: {
    status?: AppointmentStatus | "ALL";
    source?: BookingSource | "ALL";
    doctorId?: string | "ALL";
    dateFrom?: string;
    dateTo?: string;
  };
  search?: string;
};

export type FetchAppointmentsResult = {
  data: Appointment[];
  total: number;
  page: number;
  totalPages: number;
};

export function fetchAppointments(
  params: FetchAppointmentsParams,
  appointmentsSource?: Appointment[],
): Promise<FetchAppointmentsResult> {
  return new Promise((resolve) => {
    const { page, limit, filters = {}, search = "" } = params;
    const source = appointmentsSource ?? mockAppointments;
    let filtered = [...source];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((a) => {
        const name = (a.patientName ?? "").toLowerCase();
        const phone = a.phone ?? "";
        const id = (a.id ?? "").toLowerCase();
        return name.includes(q) || phone.includes(q) || id.includes(q);
      });
    }

    if (filters.status && filters.status !== "ALL") {
      filtered = filtered.filter((a) => a.status === filters.status);
    }
    if (filters.source && filters.source !== "ALL") {
      filtered = filtered.filter((a) => a.source === filters.source);
    }
    if (filters.doctorId && filters.doctorId !== "ALL") {
      filtered = filtered.filter((a) => a.doctorId === filters.doctorId);
    }
    if (filters.dateFrom) {
      filtered = filtered.filter((a) => a.date >= filters.dateFrom!);
    }
    if (filters.dateTo) {
      filtered = filtered.filter((a) => a.date <= filters.dateTo!);
    }

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const start = (page - 1) * limit;
    const data = filtered.slice(start, start + limit);

    resolve({ data, total, page, totalPages });
  });
}

export function getOverviewCounts(
  params: Omit<FetchAppointmentsParams, "page" | "limit">,
  appointmentsSource?: Appointment[],
): {
  pending: number;
  approved: number;
  rescheduled: number;
  refunded: number;
  total: number;
} {
  const { filters = {}, search = "" } = params;
  const source = appointmentsSource ?? mockAppointments;
  let filtered = [...source];

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((a) => {
      const name = (a.patientName ?? "").toLowerCase();
      const phone = a.phone ?? "";
      const id = (a.id ?? "").toLowerCase();
      return name.includes(q) || phone.includes(q) || id.includes(q);
    });
  }
  // Do NOT filter by status - KPI shows breakdown of all statuses for current filters
  if (filters.source && filters.source !== "ALL") {
    filtered = filtered.filter((a) => a.source === filters.source);
  }
  if (filters.doctorId && filters.doctorId !== "ALL") {
    filtered = filtered.filter((a) => a.doctorId === filters.doctorId);
  }
  if (filters.dateFrom) {
    filtered = filtered.filter((a) => a.date >= filters.dateFrom!);
  }
  if (filters.dateTo) {
    filtered = filtered.filter((a) => a.date <= filters.dateTo!);
  }

  return {
    pending: filtered.filter((a) => a.status === "PENDING").length,
    approved: filtered.filter((a) => a.status === "APPROVED").length,
    rescheduled: filtered.filter((a) => a.status === "RESCHEDULED").length,
    refunded: filtered.filter((a) => a.status === "REFUNDED").length,
    total: filtered.length,
  };
}

export function getBookedSlotsForDoctorDate(
  doctorId: string,
  date: string,
  appointments: Appointment[],
): string[] {
  return appointments
    .filter((a) => a.doctorId === doctorId && a.date === date)
    .filter((a) => a.status !== "REFUNDED")
    .map((a) => a.time);
}

export function createAppointmentId(appointments: Appointment[] = []): string {
  const source = appointments.length ? appointments : mockAppointments;
  const maxId = Math.max(
    0,
    ...source.map((a) => {
      const num = parseInt(a.id.replace(/\D/g, ""), 10);
      return isNaN(num) ? 0 : num;
    }),
  );
  return `APT-${String(maxId + 1).padStart(4, "0")}`;
}
