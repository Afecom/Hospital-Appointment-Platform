"use client";

import { ActivityLogEntry } from "../types";

interface ActivityItemProps {
  activity: ActivityLogEntry;
}

export default function ActivityItem({ activity }: ActivityItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <div className="flex-1">
        <p className="text-sm text-gray-800">
          <span className="font-semibold">{activity.operator}</span>{" "}
          <span className="text-gray-600">{activity.action}</span>{" "}
          <span className="font-mono text-xs">{activity.appointmentId}</span>
        </p>
      </div>
      <span className="text-xs text-gray-500 ml-4">{activity.timestamp}</span>
    </div>
  );
}
