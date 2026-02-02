"use client";
import React from "react";

type Activity = {
  id: string;
  type: string;
  ts: string;
  entity?: string;
  status?: "pending" | "approved" | "canceled" | "info";
};

const activities: Activity[] = [
  {
    id: "1",
    type: "Appointment booked",
    ts: "Feb 2, 10:30 AM",
    entity: "Patient: John D.",
    status: "info",
  },
  {
    id: "2",
    type: "Schedule submitted",
    ts: "Feb 2, 9:50 AM",
    entity: "—",
    status: "pending",
  },
  {
    id: "3",
    type: "Schedule approved",
    ts: "Feb 1, 3:20 PM",
    entity: "—",
    status: "approved",
  },
  {
    id: "4",
    type: "Appointment canceled",
    ts: "Feb 1, 9:00 AM",
    entity: "Patient: Anna S.",
    status: "canceled",
  },
  {
    id: "5",
    type: "Schedule deactivated",
    ts: "Jan 30",
    entity: "—",
    status: "info",
  },
  {
    id: "6",
    type: "Appointment booked",
    ts: "Jan 29, 11:15 AM",
    entity: "Patient: T. Williams",
    status: "info",
  },
  {
    id: "7",
    type: "Appointment booked",
    ts: "Jan 29, 10:00 AM",
    entity: "Patient: M. Gomez",
    status: "info",
  },
  {
    id: "8",
    type: "Schedule submitted",
    ts: "Jan 28",
    entity: "—",
    status: "pending",
  },
  {
    id: "9",
    type: "Appointment booked",
    ts: "Jan 27",
    entity: "Patient: S. Lee",
    status: "info",
  },
];

export default function RecentActivities() {
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
          Showing latest {Math.min(activities.length, 10)}
        </p>
      </div>

      <ul className="mt-4 divide-y divide-gray-100 bg-white border border-gray-200 rounded-lg">
        {activities.slice(0, 10).map((a) => (
          <li key={a.id} className="flex items-center justify-between p-4">
            <div>
              <div className="flex items-baseline gap-3">
                <p className="text-sm font-medium text-gray-800">{a.type}</p>
                <p className="text-xs text-gray-500">{a.entity}</p>
              </div>
              <p className="mt-1 text-xs text-gray-500">{a.ts}</p>
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
              {a.status === "canceled" && (
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
