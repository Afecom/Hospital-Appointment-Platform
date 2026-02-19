"use client";

import { AppointmentStatus } from "../mockData";

interface StatusBadgeProps {
  status: AppointmentStatus;
}

const statusConfig = {
  PENDING: {
    label: "Pending",
    className: "bg-yellow-50 text-yellow-700 ring-1 ring-yellow-100",
  },
  APPROVED: {
    label: "Approved",
    className: "bg-green-50 text-green-700 ring-1 ring-green-100",
  },
  RESCHEDULED: {
    label: "Rescheduled",
    className: "bg-blue-50 text-blue-700 ring-1 ring-blue-100",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-red-50 text-red-700 ring-1 ring-red-100",
  },
  EXPIRED: {
    label: "Expired",
    className: "bg-gray-50 text-gray-600 ring-1 ring-gray-100",
  },
  COMPLETED: {
    label: "Completed",
    className: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-gray-50 text-gray-500 ring-1 ring-gray-100",
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
