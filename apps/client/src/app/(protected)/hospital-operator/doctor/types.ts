export type OperatorDoctorStatus = "ACTIVE" | "ON_LEAVE";

export type OperatorAppointmentStatus =
  | "PENDING"
  | "APPROVED"
  | "RESCHEDULED"
  | "REFUNDED"
  | "EXPIRED"
  | "COMPLETED"
  | "CANCELLED";

export interface OperatorDoctorWeeklyScheduleDay {
  day: string;
  isWorking: boolean;
  start: string;
  end: string;
}

export interface OperatorDoctorTimelineAppointment {
  id: string;
  time: string;
  patient: string;
  status: OperatorAppointmentStatus;
}

export interface OperatorDoctorSelectedDateMetrics {
  date: string;
  startTime: string | null;
  endTime: string | null;
  workingHoursLabel: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  utilizationPct: number;
  nextAvailableSlot: string | null;
  appointments: OperatorDoctorTimelineAppointment[];
}

export interface OperatorDoctorNextDaySnapshot {
  date: string;
  working: boolean;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  utilizationPct: number;
}

export interface OperatorDoctor {
  id: string;
  name: string;
  specialty: string;
  specializations: string[];
  status: OperatorDoctorStatus;
  slotDuration: number;
  weeklySchedule: OperatorDoctorWeeklyScheduleDay[];
  selectedDate: OperatorDoctorSelectedDateMetrics;
  next7Days: OperatorDoctorNextDaySnapshot[];
}

export interface OperatorDoctorsOverviewResponse {
  message: string;
  status: "Success" | "Failed";
  data: {
    date: string;
    doctors: OperatorDoctor[];
  };
}
