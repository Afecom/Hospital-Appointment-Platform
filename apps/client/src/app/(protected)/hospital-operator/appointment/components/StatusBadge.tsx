"use client";

import type { AppointmentStatus } from "../types";

interface StatusBadgeProps {
  status: AppointmentStatus;
  showStartingSoon?: boolean;
}

const statusConfig: Record<
  AppointmentStatus,
  { label: string; className: string }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-50 text-yellow-700 ring-yellow-100",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-green-50 text-green-700 ring-green-100",
  },
  RESCHEDULED: {
    label: "Rescheduled",
    className: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-gray-50 text-gray-700 ring-gray-100",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-slate-50 text-slate-700 ring-slate-100",
  },
};

export default function StatusBadge({
  status,
  showStartingSoon,
}: StatusBadgeProps) {
  const cfg = statusConfig[status] ?? {
    label: String(status ?? "Unknown"),
    className: "bg-gray-50 text-gray-700 ring-gray-100",
  };
  const base =
    "inline-flex items-center px-3 py-0.5 rounded-full text-xs font-semibold tracking-wide ring-1";

  if (showStartingSoon && status === "PENDING") {
    return (
      <span
        className={`${base} bg-amber-50 text-amber-800 ring-amber-200`}
        title="Appointment is within the next 3 hours"
      >
        Starting Soon — Pending
      </span>
    );
  }

  return <span className={`${base} ${cfg.className}`}>{cfg.label}</span>;
}
