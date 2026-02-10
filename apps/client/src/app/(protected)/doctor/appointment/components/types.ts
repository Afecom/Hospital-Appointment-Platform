export type Gender = "M" | "F" | "Other";

export type Appointment = {
  id: string;
  date: string; // YYYY-MM-DD
  start: string; // HH:MM
  end: string; // HH:MM
  patientName: string;
  patientAge?: number;
  patientGender?: Gender;
  reason: string;
  type: "In-person" | "Online";
  status: "Approved" | "Completed" | "Cancelled";
  isNew?: boolean;
};
