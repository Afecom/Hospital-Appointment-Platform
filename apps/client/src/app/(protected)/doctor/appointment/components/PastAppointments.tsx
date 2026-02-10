import React from "react";
import type { Appointment } from "./types";
import EmptyState from "./EmptyState";

export default function PastAppointments({
  appointments,
}: {
  appointments: Appointment[];
}) {
  if (!appointments || appointments.length === 0) {
    return (
      <section className="mb-6">
        <EmptyState message="No past appointments available" />
      </section>
    );
  }

  return (
    <section className="mb-6">
      <h3 className="text-md font-semibold text-slate-900 mb-3">
        Past / Completed
      </h3>
      <div className="bg-white border border-slate-50 rounded-md overflow-hidden text-sm text-slate-700">
        <div className="grid grid-cols-4 gap-4 p-3 font-medium text-slate-600 bg-slate-50">
          <div>Date</div>
          <div>Patient</div>
          <div>Reason</div>
          <div>Status</div>
        </div>
        <div>
          {appointments.map((a) => (
            <div
              key={a.id}
              className="grid grid-cols-4 gap-4 p-3 border-t border-slate-100"
            >
              <div className="text-slate-700">
                {a.date} {a.start}
              </div>
              <div className="text-slate-700">{a.patientName}</div>
              <div className="text-slate-700">{a.reason}</div>
              <div className="text-slate-700">{a.status}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
