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

// Mock KPI Data
export const kpis: KPIData = {
  pending: 12,
  approvedToday: 34,
  rescheduledToday: 5,
  refunds: 3,
  totalToday: 54,
  slotUtilization: 78,
};

// Mock Pending Appointments
export const pendingAppointments: PendingAppointment[] = [
  {
    id: "APT-1001",
    patient: "Abel Tadesse",
    doctor: "Dr. Hana",
    date: "2026-02-17",
    time: "10:30 AM",
    source: "Web",
    status: "PENDING",
    createdAt: "2 hours ago",
    isFree: false,
  },
  {
    id: "APT-1002",
    patient: "Mahi Alemayehu",
    doctor: "Dr. Samuel",
    date: "2026-02-17",
    time: "11:00 AM",
    source: "APP",
    status: "PENDING",
    createdAt: "1 hour ago",
    isFree: true,
  },
  {
    id: "APT-1003",
    patient: "Saron Bekele",
    doctor: "Dr. Ruth",
    date: "2026-02-18",
    time: "09:00 AM",
    source: "Operator",
    status: "APPROVED",
    createdAt: "3 hours ago",
    isFree: false,
  },
  {
    id: "APT-1004",
    patient: "Yonas Mekonnen",
    doctor: "Dr. Hana",
    date: "2026-02-17",
    time: "02:30 PM",
    source: "Web",
    status: "PENDING",
    createdAt: "45 minutes ago",
    isFree: false,
  },
  {
    id: "APT-1005",
    patient: "Tigist Assefa",
    doctor: "Dr. Samuel",
    date: "2026-02-19",
    time: "10:00 AM",
    source: "Call Center",
    status: "REFUNDED",
    createdAt: "4 hours ago",
    isFree: false,
  },
  {
    id: "APT-1006",
    patient: "Daniel Getachew",
    doctor: "Dr. Ruth",
    date: "2026-02-17",
    time: "03:00 PM",
    source: "APP",
    status: "PENDING",
    createdAt: "30 minutes ago",
    isFree: true,
  },
  {
    id: "APT-1007",
    patient: "Meron Tesfaye",
    doctor: "Dr. Hana",
    date: "2026-02-20",
    time: "11:30 AM",
    source: "APP",
    status: "RESCHEDULED",
    createdAt: "5 hours ago",
    isFree: false,
    newAppointmentId: "APT-1009",
  },
  {
    id: "APT-1008",
    patient: "Kebede Haile",
    doctor: "Dr. Samuel",
    date: "2026-02-17",
    time: "04:00 PM",
    source: "Web",
    status: "PENDING",
    createdAt: "1 hour ago",
    isFree: false,
  },
  {
    id: "APT-1010",
    patient: "Sara Bekele",
    doctor: "Dr. Ruth",
    date: "2026-02-15",
    time: "09:00 AM",
    source: "Web",
    status: "EXPIRED",
    createdAt: "2 days ago",
    isFree: false,
  },
  {
    id: "APT-1011",
    patient: "Yohannes Mekonnen",
    doctor: "Dr. Hana",
    date: "2026-02-14",
    time: "02:00 PM",
    source: "Operator",
    status: "COMPLETED",
    createdAt: "3 days ago",
    isFree: true,
  },
];

// Mock Chart Data - Appointments by Status
export const statusChartData: ChartStatusData[] = [
  { name: "Approved", value: 34, color: "#10b981" },
  { name: "Pending", value: 12, color: "#f59e0b" },
  { name: "Rescheduled", value: 5, color: "#3b82f6" },
  { name: "Refunded", value: 3, color: "#ef4444" },
];

// Mock Chart Data - Appointments by Doctor
export const doctorChartData: DoctorAppointmentData[] = [
  { doctor: "Dr. Hana", appointments: 12 },
  { doctor: "Dr. Samuel", appointments: 8 },
  { doctor: "Dr. Ruth", appointments: 14 },
  { doctor: "Dr. Michael", appointments: 10 },
  { doctor: "Dr. Sarah", appointments: 6 },
];

// Mock Timeline Data
export const timelineData: DoctorTimeline[] = [
  {
    doctor: "Dr. Hana",
    appointments: [
      {
        id: "APT-1001",
        time: "09:00",
        patient: "Abel Tadesse",
        status: "APPROVED",
        source: "Web",
      },
      {
        id: "APT-1002",
        time: "09:30",
        patient: "Mahi Alemayehu",
        status: "PENDING",
        source: "Web",
      },
      {
        id: "APT-1003",
        time: "10:00",
        patient: "Saron Bekele",
        status: "APPROVED",
        source: "APP",
      },
      {
        id: "APT-1004",
        time: "10:30",
        patient: "Yonas Mekonnen",
        status: "APPROVED",
        source: "Web",
      },
      {
        id: "APT-1005",
        time: "11:00",
        patient: "Tigist Assefa",
        status: "PENDING",
        source: "Web",
      },
    ],
  },
  {
    doctor: "Dr. Samuel",
    appointments: [
      {
        id: "APT-2001",
        time: "09:00",
        patient: "Daniel Getachew",
        status: "APPROVED",
        source: "Web",
      },
      {
        id: "APT-2002",
        time: "10:00",
        patient: "Meron Tesfaye",
        status: "APPROVED",
        source: "Operator",
      },
      {
        id: "APT-2003",
        time: "11:00",
        patient: "Kebede Haile",
        status: "PENDING",
        source: "Web",
      },
      {
        id: "APT-2004",
        time: "02:00",
        patient: "Alemayehu Tadesse",
        status: "APPROVED",
        source: "Web",
      },
    ],
  },
  {
    doctor: "Dr. Ruth",
    appointments: [
      {
        id: "APT-3001",
        time: "08:30",
        patient: "Sara Bekele",
        status: "APPROVED",
        source: "APP",
      },
      {
        id: "APT-3002",
        time: "09:30",
        patient: "Yohannes Mekonnen",
        status: "APPROVED",
        source: "Operator",
      },
      {
        id: "APT-3003",
        time: "10:30",
        patient: "Marta Assefa",
        status: "PENDING",
        source: "Web",
      },
      {
        id: "APT-3004",
        time: "11:30",
        patient: "Solomon Getachew",
        status: "APPROVED",
        source: "Web",
      },
      {
        id: "APT-3005",
        time: "03:00",
        patient: "Hanna Tadesse",
        status: "APPROVED",
        source: "Web",
      },
    ],
  },
];

// Mock Activity Log
export const activityLog: ActivityLogEntry[] = [
  {
    id: "ACT-001",
    operator: "Hanna",
    action: "approved",
    appointmentId: "APT-1001",
    timestamp: "5 min ago",
  },
  {
    id: "ACT-002",
    operator: "Samuel",
    action: "rescheduled",
    appointmentId: "APT-0991",
    timestamp: "18 min ago",
  },
  {
    id: "ACT-003",
    operator: "Ruth",
    action: "approved",
    appointmentId: "APT-0985",
    timestamp: "32 min ago",
  },
  {
    id: "ACT-004",
    operator: "Hanna",
    action: "refunded",
    appointmentId: "APT-0978",
    timestamp: "45 min ago",
  },
  {
    id: "ACT-005",
    operator: "Michael",
    action: "approved",
    appointmentId: "APT-0972",
    timestamp: "1 hour ago",
  },
  {
    id: "ACT-006",
    operator: "Samuel",
    action: "rescheduled",
    appointmentId: "APT-0965",
    timestamp: "1 hour ago",
  },
  {
    id: "ACT-007",
    operator: "Ruth",
    action: "approved",
    appointmentId: "APT-0958",
    timestamp: "2 hours ago",
  },
  {
    id: "ACT-008",
    operator: "Hanna",
    action: "approved",
    appointmentId: "APT-0951",
    timestamp: "2 hours ago",
  },
  {
    id: "ACT-009",
    operator: "Michael",
    action: "refunded",
    appointmentId: "APT-0944",
    timestamp: "3 hours ago",
  },
  {
    id: "ACT-010",
    operator: "Samuel",
    action: "approved",
    appointmentId: "APT-0937",
    timestamp: "3 hours ago",
  },
];
