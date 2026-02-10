import React from "react";
import type { Appointment } from "./types";

function StatusBadge({ status }: { status: Appointment["status"] }) {
  const base = "text-xs px-2 py-0.5 rounded-full font-medium";
  const map: Record<Appointment["status"], string> = {
    Approved: "bg-emerald-100 text-emerald-800",
    Completed: "bg-slate-100 text-slate-600",
    Cancelled: "bg-rose-100 text-rose-700",
  };
  return <span className={`${base} ${map[status]}`}>{status}</span>;
}

export default function AppointmentCard({ appt }: { appt: Appointment }) {
  return (
    <div className="bg-white border border-slate-100 rounded-md p-4 mb-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-700 font-medium">
            {appt.start} — {appt.end}
          </div>
          <div className="mt-1 text-base text-slate-900 font-semibold">
            {appt.patientName}{" "}
            {appt.isNew ? (
              <span className="text-xs text-slate-600">• new</span>
            ) : null}
          </div>
          <div className="text-sm text-slate-600 mt-1">
            {appt.patientAge ? `${appt.patientAge} yrs` : ""}
            {appt.patientGender ? ` • ${appt.patientGender}` : ""}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="text-sm text-slate-600">{appt.type}</div>
          <StatusBadge status={appt.status} />
        </div>
      </div>
      <div className="text-sm text-slate-600 mt-3">{appt.reason}</div>
    </div>
  );
}
