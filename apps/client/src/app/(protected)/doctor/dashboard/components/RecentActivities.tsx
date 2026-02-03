"use client";
import React from "react";

type Activity = {
  action: string;
  ts: string | Date;
  entity?: string;
  status?: string;
};

type RecentActivitiesProps = { activities?: Activity[] };

const sample: Activity[] = [
  {
    action: "Appointment booked",
    ts: "Feb 2, 10:30 AM",
    entity: "Patient: John D.",
    status: "info",
  },
  {
    action: "Schedule submitted",
    ts: "Feb 2, 9:50 AM",
    entity: "—",
    status: "pending",
  },
  {
    action: "Schedule approved",
    ts: "Feb 1, 3:20 PM",
    entity: "—",
    status: "approved",
  },
];

export default function RecentActivities({
  activities,
}: RecentActivitiesProps) {
  const list = activities && activities.length ? activities : sample;

  return (
    <section aria-labelledby="recent-activities">
      <div className="flex items-center justify-between">
        <h3
          id="recent-activities"
          className="text-lg font-semibold text-gray-800"
        >
          Recent Activities
        </h3>
        <p className="text-sm text-gray-500">
          Showing latest {Math.min(list.length, 10)}
        </p>
      </div>

      <ul className="mt-4 divide-y divide-gray-100 bg-white border border-gray-200 rounded-lg">
        {list.slice(0, 10).map((a, idx) => (
          <li key={idx} className="flex items-center justify-between p-4">
            <div>
              <div className="flex items-baseline gap-3">
                <p className="text-sm font-medium text-gray-800">{a.action}</p>
                <p className="text-xs text-gray-500">{a.entity}</p>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {typeof a.ts === "string"
                  ? a.ts
                  : new Date(a.ts).toLocaleString()}
              </p>
            </div>

            <div>
              {a.status === "pending" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              )}
              {a.status === "approved" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                  Approved
                </span>
              )}
              {a.status === "cancelled" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-red-100 text-red-800">
                  Canceled
                </span>
              )}
              {a.status === "info" && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-700">
                  Info
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
