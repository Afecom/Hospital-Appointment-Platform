export type AppointmentStatus =
  | "PENDING"
  | "APPROVED"
  | "RESCHEDULED"
  | "REFUNDED"
  | "EXPIRED"
  | "COMPLETED"
  | "CANCELLED";

export type BookingSource = "Web" | "Operator" | "APP" | "Call Center";

export interface PendingAppointment {
  id: string;
  patient: string;
  doctor: string;
  date: string;
  time: string;
  source: BookingSource;
  status: AppointmentStatus;
  createdAt: string;
  isFree: boolean;
  isPaid: boolean;
  newAppointmentId?: string;
}

export interface KPIData {
  pending: number;
  approvedToday: number;
  rescheduledToday: number;
  refunds: number;
  totalToday: number;
  slotUtilization: number;
}

export interface KPITrendData {
  pending: string;
  approvedToday: string;
  rescheduledToday: string;
  refunds: string;
  totalToday: string;
  slotUtilization: string;
}

export interface ChartStatusData {
  name: string;
  value: number;
  color: string;
}

export interface DoctorAppointmentData {
  doctor: string;
  appointments: number;
}

export interface TimelineAppointment {
  id: string;
  time: string;
  patient: string;
  status: AppointmentStatus;
  source: BookingSource;
}

export interface DoctorTimeline {
  doctor: string;
  appointments: TimelineAppointment[];
}

export interface ActivityLogEntry {
  id: string;
  operator: string;
  action: string;
  appointmentId: string;
  timestamp: string;
}
