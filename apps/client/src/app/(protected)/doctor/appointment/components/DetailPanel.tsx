import React from "react";
import type { Appointment } from "./types";

export default function DetailPanel({ appt }: { appt?: Appointment }) {
  if (!appt) return null;
  return (
    <section className="mb-6">
      <h4 className="text-sm font-semibold text-slate-900 mb-2">
        Appointment Overview
      </h4>
      <div className="bg-white border border-slate-100 rounded-md p-4 text-sm text-slate-700">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-slate-600">Patient</div>
            <div className="font-medium text-slate-900">{appt.patientName}</div>
            <div className="text-slate-600">
              {appt.patientAge ? `${appt.patientAge} yrs` : ""}
              {appt.patientGender ? ` • ${appt.patientGender}` : ""}
            </div>
          </div>
          <div>
            <div className="text-slate-600">Date & Time</div>
            <div className="font-medium text-slate-900">
              {appt.date} • {appt.start} — {appt.end}
            </div>
            <div className="text-slate-600">
              {appt.type} • {appt.status}
            </div>
          </div>
        </div>
        <div className="mt-4">
          <div className="text-slate-600">Reason</div>
          <div className="text-slate-700">{appt.reason}</div>
        </div>
      </div>
    </section>
  );
}
