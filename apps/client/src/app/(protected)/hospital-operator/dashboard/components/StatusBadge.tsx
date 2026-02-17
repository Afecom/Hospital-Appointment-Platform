"use client";

import { AppointmentStatus } from "../mockData";

interface StatusBadgeProps {
  status: AppointmentStatus;
}

const statusConfig = {
  PENDING: {
    label: "Pending",
    className:
      "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-100",
  },
  RESCHEDULE_REQUESTED: {
    label: "Reschedule Requested",
    className:
      "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  },
  REFUND_REQUESTED: {
    label: "Refund Requested",
    className: "bg-red-50 text-red-700 ring-1 ring-red-100",
  },
  APPROVED: {
    label: "Approved",
    className:
      "bg-green-50 text-green-700 ring-1 ring-green-100",
  },
  RESCHEDULED: {
    label: "Rescheduled",
    className:
      "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-red-50 text-red-700 ring-1 ring-red-100",
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-semibold tracking-wide ${config.className}`}
    >
      {config.label}
    </span>
  );
}
