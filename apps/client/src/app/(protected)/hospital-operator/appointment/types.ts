export type BookingSource = "WEB" | "APP" | "CALL_CENTER" | "OPERATOR";

export type AppointmentStatus =
  | "PENDING"
  | "APPROVED"
  | "RESCHEDULED"
  | "REFUNDED"
  | "COMPLETED";

export type Appointment = {
  id: string;
  patientName: string;
  phone: string;
  doctorId: string;
  doctorName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  source: BookingSource;
  status: AppointmentStatus;
  paymentStatus: "PAID" | "UNPAID" | "REFUNDED";
};
