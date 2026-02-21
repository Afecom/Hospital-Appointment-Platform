export interface countPendingAppointmentsRes {
  message: string;
  totalAppointments: number;
}

export interface doctorOverviewRes {
  message: string;
  status: "Success" | "Failed";
  data: {
    doctor: {
      fullName: string;
      specializations: string[];
    };
    today: any[];
    upcomingByDate: Record<string, any[]>;
    past: any[];
    counts: {
      today: number;
      upcoming: number;
      completed: number;
      cancelled: number;
    };
  };
}

export interface OperatorAppointment {
  id: string;
  customerId: string;
  doctorId: string;
  scheduleId: string;
  slotId: string;
  status: "pending" | "approved" | "rescheduled" | "refunded" | "cancelled" | "completed" | "expired";
  approvedSlotStart: string;
  approvedSlotEnd: string;
  notes?: string | null;
  approvedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  tx_ref: string;
  hospitalId: string;
  isPaid: boolean;
  newScheduleId?: string | null;
  newSlotId?: string | null;
  isFree: boolean;
  source: "call_center" | "web" | "app" | "operator";
  User_Appointment_customerIdToUser?: {
    fullName: string;
    phoneNumber?: string | null;
  };
  Doctor?: {
    id: string;
    User?: {
      fullName: string;
    };
  };
  originalSlot?: {
    slotStart: string;
    slotEnd: string;
    date: string;
  } | null;
}

export interface OperatorAppointmentsResponse {
  appointments: OperatorAppointment[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface OperatorKPIsResponse {
  pending: number;
  approvedToday: number;
  rescheduledToday: number;
  refunds: number;
  totalToday: number;
  slotUtilization: number;
}

export interface OperatorKPITrendsResponse {
  pending: string;
  approvedToday: string;
  rescheduledToday: string;
  refunds: string;
  totalToday: string;
  slotUtilization: string;
}

export interface OperatorStatusChartData {
  name: string;
  value: number;
  color: string;
}

export interface OperatorDoctorChartData {
  doctor: string;
  appointments: number;
}

export interface OperatorTimelineAppointment {
  id: string;
  time: string;
  patient: string;
  status:
    | "PENDING"
    | "APPROVED"
    | "RESCHEDULED"
    | "REFUNDED"
    | "EXPIRED"
    | "COMPLETED"
    | "CANCELLED";
  source: "Web" | "Operator" | "APP" | "Call Center";
}

export interface OperatorDoctorTimeline {
  doctor: string;
  appointments: OperatorTimelineAppointment[];
}

export interface OperatorActivityLogEntry {
  id: string;
  operator: string;
  action: string;
  appointmentId: string;
  timestamp: string;
}

export interface OperatorDashboardResponse {
  kpis: OperatorKPIsResponse;
  kpiTrends: OperatorKPITrendsResponse;
  statusChartData: OperatorStatusChartData[];
  doctorChartData: OperatorDoctorChartData[];
  timelineData: OperatorDoctorTimeline[];
  activityLog: OperatorActivityLogEntry[];
}
