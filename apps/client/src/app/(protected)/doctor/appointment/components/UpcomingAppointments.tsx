import React from "react";
import type { Appointment } from "./types";
import EmptyState from "./EmptyState";

export default function UpcomingAppointments({
  appointmentsByDate,
}: {
  appointmentsByDate: Record<string, Appointment[]>;
}) {
  const dates = Object.keys(appointmentsByDate).sort();
  if (dates.length === 0)
    return (
      <section className="mb-6">
        <EmptyState message="No upcoming appointments this week" />
      </section>
    );

  return (
    <section className="mb-6">
      <h3 className="text-md font-semibold text-slate-900 mb-3">
        Upcoming Appointments (This Week)
      </h3>
      <div className="space-y-4">
        {dates.map((date) => (
          <div key={date}>
            <div className="text-sm text-slate-700 font-medium mb-2">
              {date}
            </div>
            <div className="bg-white border border-slate-50 rounded-md p-3">
              {appointmentsByDate[date].map((a) => (
                <div
                  key={a.id}
                  className="py-2 border-b last:border-b-0 border-slate-100 text-sm text-slate-700"
                >
                  <div className="flex justify-between">
                    <div>
                      {a.start} — {a.end} • {a.patientName}
                    </div>
                    <div className="text-slate-600">{a.type}</div>
                  </div>
                  <div className="text-slate-600 mt-1">{a.reason}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
