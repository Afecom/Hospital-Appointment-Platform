"use client";

import {
  OperatorAppointmentStatus,
  OperatorDoctorStatus,
} from "../types";

type DoctorStatus = OperatorDoctorStatus;
type AppointmentStatus = OperatorAppointmentStatus;

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

  const cfgByStatus: Record<AppointmentStatus, { label: string; className: string }> = {
    APPROVED: {
      label: "Approved",
      className: "bg-green-50 text-green-700 ring-green-100",
    },
    PENDING: {
      label: "Pending",
      className: "bg-yellow-50 text-yellow-700 ring-yellow-100",
    },
    RESCHEDULED: {
      label: "Rescheduled",
      className: "bg-blue-50 text-blue-700 ring-blue-100",
    },
    REFUNDED: {
      label: "Refunded",
      className: "bg-red-50 text-red-700 ring-red-100",
    },
    EXPIRED: {
      label: "Expired",
      className: "bg-gray-100 text-gray-700 ring-gray-200",
    },
    COMPLETED: {
      label: "Completed",
      className: "bg-teal-50 text-teal-700 ring-teal-100",
    },
    CANCELLED: {
      label: "Cancelled",
      className: "bg-slate-100 text-slate-700 ring-slate-200",
    },
  };
  const cfg = cfgByStatus[props.status];

  return <span className={`${base} ${cfg.className}`}>{cfg.label}</span>;
}

