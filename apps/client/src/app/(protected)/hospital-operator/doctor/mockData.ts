import { addDays, clamp, minutesBetween, stableHash, toMinutes, fromMinutes } from "./utils";

export type Doctor = {
  id: string;
  name: string;
  specialty: string;
  status: "ACTIVE" | "ON_LEAVE";
  weeklySchedule: {
    day: string;
    isWorking: boolean;
    start: string;
    end: string;
  }[];
};

export type DoctorDailyStats = {
  doctorId: string;
  date: string; // YYYY-MM-DD
  totalSlots: number;
  bookedSlots: number;
};

export type Appointment = {
  id: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  patient: string;
  status: "APPROVED" | "PENDING" | "RESCHEDULED";
};

export const doctors: Doctor[] = [
  {
    id: "doc_001",
    name: "Dr. Hana Bekele",
    specialty: "Cardiology",
    status: "ACTIVE",
    weeklySchedule: [
      { day: "Monday", isWorking: true, start: "08:30", end: "16:30" },
      { day: "Tuesday", isWorking: true, start: "08:30", end: "16:30" },
      { day: "Wednesday", isWorking: true, start: "10:00", end: "18:00" },
      { day: "Thursday", isWorking: true, start: "08:30", end: "16:30" },
      { day: "Friday", isWorking: true, start: "08:30", end: "14:30" },
      { day: "Saturday", isWorking: false, start: "00:00", end: "00:00" },
      { day: "Sunday", isWorking: false, start: "00:00", end: "00:00" },
    ],
  },
  {
    id: "doc_002",
    name: "Dr. Samuel Tesfaye",
    specialty: "Orthopedics",
    status: "ACTIVE",
    weeklySchedule: [
      { day: "Monday", isWorking: true, start: "09:00", end: "17:00" },
      { day: "Tuesday", isWorking: true, start: "09:00", end: "17:00" },
      { day: "Wednesday", isWorking: false, start: "00:00", end: "00:00" },
      { day: "Thursday", isWorking: true, start: "09:00", end: "17:00" },
      { day: "Friday", isWorking: true, start: "09:00", end: "15:00" },
      { day: "Saturday", isWorking: true, start: "09:00", end: "12:00" },
      { day: "Sunday", isWorking: false, start: "00:00", end: "00:00" },
    ],
  },
  {
    id: "doc_003",
    name: "Dr. Ruth Alemu",
    specialty: "Pediatrics",
    status: "ACTIVE",
    weeklySchedule: [
      { day: "Monday", isWorking: true, start: "08:00", end: "15:00" },
      { day: "Tuesday", isWorking: true, start: "08:00", end: "15:00" },
      { day: "Wednesday", isWorking: true, start: "08:00", end: "15:00" },
      { day: "Thursday", isWorking: true, start: "11:00", end: "18:00" },
      { day: "Friday", isWorking: false, start: "00:00", end: "00:00" },
      { day: "Saturday", isWorking: false, start: "00:00", end: "00:00" },
      { day: "Sunday", isWorking: false, start: "00:00", end: "00:00" },
    ],
  },
  {
    id: "doc_004",
    name: "Dr. Michael Girma",
    specialty: "Dermatology",
    status: "ON_LEAVE",
    weeklySchedule: [
      { day: "Monday", isWorking: true, start: "09:00", end: "16:00" },
      { day: "Tuesday", isWorking: true, start: "09:00", end: "16:00" },
      { day: "Wednesday", isWorking: true, start: "09:00", end: "16:00" },
      { day: "Thursday", isWorking: true, start: "09:00", end: "16:00" },
      { day: "Friday", isWorking: true, start: "09:00", end: "13:00" },
      { day: "Saturday", isWorking: false, start: "00:00", end: "00:00" },
      { day: "Sunday", isWorking: false, start: "00:00", end: "00:00" },
    ],
  },
  {
    id: "doc_005",
    name: "Dr. Sarah Mekonnen",
    specialty: "Neurology",
    status: "ACTIVE",
    weeklySchedule: [
      { day: "Monday", isWorking: true, start: "10:00", end: "18:00" },
      { day: "Tuesday", isWorking: false, start: "00:00", end: "00:00" },
      { day: "Wednesday", isWorking: true, start: "10:00", end: "18:00" },
      { day: "Thursday", isWorking: true, start: "10:00", end: "18:00" },
      { day: "Friday", isWorking: true, start: "10:00", end: "16:00" },
      { day: "Saturday", isWorking: false, start: "00:00", end: "00:00" },
      { day: "Sunday", isWorking: false, start: "00:00", end: "00:00" },
    ],
  },
  {
    id: "doc_006",
    name: "Dr. Daniel Wondimu",
    specialty: "General Surgery",
    status: "ACTIVE",
    weeklySchedule: [
      { day: "Monday", isWorking: true, start: "07:30", end: "15:30" },
      { day: "Tuesday", isWorking: true, start: "07:30", end: "15:30" },
      { day: "Wednesday", isWorking: true, start: "07:30", end: "15:30" },
      { day: "Thursday", isWorking: false, start: "00:00", end: "00:00" },
      { day: "Friday", isWorking: true, start: "07:30", end: "13:30" },
      { day: "Saturday", isWorking: false, start: "00:00", end: "00:00" },
      { day: "Sunday", isWorking: false, start: "00:00", end: "00:00" },
    ],
  },
];

// Operational assumption: slot duration varies per specialty/provider.
// This is mock-only but aligned with backend thinking.
export const slotDurationMinutesByDoctorId: Record<string, number> = {
  doc_001: 20,
  doc_002: 30,
  doc_003: 20,
  doc_004: 30,
  doc_005: 30,
  doc_006: 15,
};

export function getScheduleForDay(doctor: Doctor, dayName: string) {
  return doctor.weeklySchedule.find((d) => d.day === dayName) ?? null;
}

export function getWorkingHoursForDate(doctor: Doctor, isoDate: string): {
  isWorking: boolean;
  start: string | null;
  end: string | null;
} {
  const dayName = new Date(isoDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
  });
  const day = getScheduleForDay(doctor, dayName);
  if (!day || !day.isWorking) return { isWorking: false, start: null, end: null };
  return { isWorking: true, start: day.start, end: day.end };
}

export function computeTotalSlotsForDate(doctor: Doctor, isoDate: string): number {
  if (doctor.status === "ON_LEAVE") return 0;
  const wh = getWorkingHoursForDate(doctor, isoDate);
  if (!wh.isWorking || !wh.start || !wh.end) return 0;
  const durationMin = slotDurationMinutesByDoctorId[doctor.id] ?? 30;
  const minutes = minutesBetween(wh.start, wh.end);
  return Math.floor(minutes / durationMin);
}

function bookedRateFor(doctorId: string, isoDate: string): number {
  const h = stableHash(`${doctorId}:${isoDate}`);
  // 0.35 .. 0.98 (varies but tends high to reflect real ops)
  const base = 0.35 + ((h % 1000) / 1000) * 0.63;
  const dayOfWeek = new Date(isoDate + "T00:00:00").getDay(); // 0..6
  // Slight bump on Mon/Tue/Thu
  const bump = dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 4 ? 0.06 : 0;
  return clamp(base + bump, 0.1, 0.99);
}

export function getDailyStats(doctor: Doctor, isoDate: string): DoctorDailyStats {
  const totalSlots = computeTotalSlotsForDate(doctor, isoDate);
  const rate = bookedRateFor(doctor.id, isoDate);
  const bookedSlots = totalSlots === 0 ? 0 : clamp(Math.round(totalSlots * rate), 0, totalSlots);
  return { doctorId: doctor.id, date: isoDate, totalSlots, bookedSlots };
}

export function getDailyStatsForDoctors(
  doctorsList: Doctor[],
  isoDate: string,
): DoctorDailyStats[] {
  return doctorsList.map((d) => getDailyStats(d, isoDate));
}

export function generateSlotTimes(
  startHHmm: string,
  endHHmm: string,
  slotDurationMinutes: number,
): string[] {
  const start = toMinutes(startHHmm);
  const end = toMinutes(endHHmm);
  const times: string[] = [];
  for (let t = start; t + slotDurationMinutes <= end; t += slotDurationMinutes) {
    times.push(fromMinutes(t));
  }
  return times;
}

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
];

function appointmentStatusFor(seed: number): Appointment["status"] {
  const r = seed % 100;
  if (r < 70) return "APPROVED";
  if (r < 88) return "PENDING";
  return "RESCHEDULED";
}

export function getAppointmentsForDoctorOnDate(
  doctor: Doctor,
  isoDate: string,
): { appointments: Appointment[]; slotTimes: string[] } {
  const wh = getWorkingHoursForDate(doctor, isoDate);
  const durationMin = slotDurationMinutesByDoctorId[doctor.id] ?? 30;
  if (doctor.status === "ON_LEAVE" || !wh.isWorking || !wh.start || !wh.end) {
    return { appointments: [], slotTimes: [] };
  }

  const stats = getDailyStats(doctor, isoDate);
  const slotTimes = generateSlotTimes(wh.start, wh.end, durationMin);
  const booked = clamp(stats.bookedSlots, 0, slotTimes.length);

  // Pick a deterministic set of booked slots spread out.
  const seed = stableHash(`${doctor.id}:${isoDate}:slots`);
  const step = Math.max(1, Math.floor(slotTimes.length / Math.max(1, booked)));
  const bookedIdx = new Set<number>();
  let cursor = seed % Math.max(1, slotTimes.length);
  while (bookedIdx.size < booked && bookedIdx.size < slotTimes.length) {
    bookedIdx.add(cursor);
    cursor = (cursor + step) % slotTimes.length;
  }

  const idxArr = [...bookedIdx].sort((a, b) => a - b);
  const appointments: Appointment[] = idxArr.map((idx, i) => {
    const pSeed = stableHash(`${doctor.id}:${isoDate}:pt:${idx}`);
    return {
      id: `apt_${doctor.id}_${isoDate.replaceAll("-", "")}_${String(i + 1).padStart(2, "0")}`,
      doctorId: doctor.id,
      date: isoDate,
      time: slotTimes[idx] ?? "09:00",
      patient: patientNames[pSeed % patientNames.length] ?? "Patient",
      status: appointmentStatusFor(pSeed),
    };
  });

  return { appointments, slotTimes };
}

export function getNextAvailableSlotForDoctorOnDate(
  doctor: Doctor,
  isoDate: string,
): string | null {
  const { appointments, slotTimes } = getAppointmentsForDoctorOnDate(doctor, isoDate);
  if (slotTimes.length === 0) return null;
  const bookedTimes = new Set(appointments.map((a) => a.time));
  const next = slotTimes.find((t) => !bookedTimes.has(t)) ?? null;
  return next;
}

export function getNext7DaysSnapshot(doctor: Doctor, fromIsoDate: string) {
  return Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(fromIsoDate, i);
    const stats = getDailyStats(doctor, date);
    const working = stats.totalSlots > 0;
    return {
      date,
      working,
      totalSlots: stats.totalSlots,
      bookedSlots: stats.bookedSlots,
      availableSlots: Math.max(0, stats.totalSlots - stats.bookedSlots),
      utilizationPct:
        stats.totalSlots === 0 ? 0 : Math.round((stats.bookedSlots / stats.totalSlots) * 100),
    };
  });
}

