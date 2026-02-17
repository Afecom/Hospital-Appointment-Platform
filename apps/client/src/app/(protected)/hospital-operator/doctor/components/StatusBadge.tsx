"use client";

import { Appointment, Doctor } from "../mockData";

type DoctorStatus = Doctor["status"];
type AppointmentStatus = Appointment["status"];

type Props =
  | { kind: "doctor"; status: DoctorStatus }
  | { kind: "appointment"; status: AppointmentStatus };

const base =
  "inline-flex items-center px-3 py-0.5 rounded-full text-sm font-semibold tracking-wide ring-1";

export default function StatusBadge(props: Props) {
  if (props.kind === "doctor") {
    const cfg =
      props.status === "ACTIVE"
        ? { label: "Active", className: "bg-green-50 text-green-700 ring-green-100" }
        : { label: "On Leave", className: "bg-gray-50 text-gray-700 ring-gray-100" };
    return <span className={`${base} ${cfg.className}`}>{cfg.label}</span>;
  }

  const cfg =
    props.status === "APPROVED"
      ? { label: "Approved", className: "bg-green-50 text-green-700 ring-green-100" }
      : props.status === "PENDING"
        ? { label: "Pending", className: "bg-yellow-50 text-yellow-700 ring-yellow-100" }
        : { label: "Rescheduled", className: "bg-blue-50 text-blue-700 ring-blue-100" };

  return <span className={`${base} ${cfg.className}`}>{cfg.label}</span>;
}

