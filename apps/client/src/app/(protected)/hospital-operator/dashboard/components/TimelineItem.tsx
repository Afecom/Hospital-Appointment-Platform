"use client";

import { TimelineAppointment } from "../mockData";
import StatusBadge from "./StatusBadge";

interface TimelineItemProps {
  appointment: TimelineAppointment;
}

const statusDotColors = {
  PENDING: "bg-yellow-500",
  APPROVED: "bg-green-500",
  RESCHEDULED: "bg-blue-500",
  REFUNDED: "bg-red-500",
  EXPIRED: "bg-gray-500",
  COMPLETED: "bg-emerald-500",
  CANCELLED: "bg-gray-400",
};

export default function TimelineItem({ appointment }: TimelineItemProps) {
  const dotColor =
    statusDotColors[appointment.status as keyof typeof statusDotColors] ??
    "bg-gray-400";

  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center gap-3 flex-1">
        <span className="text-sm font-medium text-gray-900 w-16">
          {appointment.time}
        </span>
        <div className={`w-2 h-2 rounded-full ${dotColor}`} />
        <span className="text-sm text-gray-700 flex-1">
          {appointment.patient}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-xs px-2 py-0.5 rounded-md ${
            appointment.source === "Web"
              ? "bg-blue-50 text-blue-700"
              : "bg-gray-50 text-gray-700"
          }`}
        >
          {appointment.source}
        </span>
        <StatusBadge status={appointment.status} />
      </div>
    </div>
  );
}
