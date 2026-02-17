"use client";

import { useEffect, useMemo } from "react";
import { X } from "lucide-react";
import {
  Appointment,
  Doctor,
  getAppointmentsForDoctorOnDate,
  getDailyStats,
  getNext7DaysSnapshot,
  getWorkingHoursForDate,
  slotDurationMinutesByDoctorId,
} from "../mockData";
import StatusBadge from "./StatusBadge";
import { formatLongDate, formatShortDate, formatTimeLabel, dayNameFromISODate } from "../utils";

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function TableContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      {children}
    </div>
  );
}

function SmallTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | React.ReactNode)[][];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px]">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, idx) => (
            <tr key={idx} className="border-b border-gray-100 last:border-b-0">
              {r.map((cell, cidx) => (
                <td key={cidx} className="py-3 px-4 text-sm text-gray-700">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function DoctorDrawer({
  open,
  onClose,
  doctor,
  selectedDate,
}: {
  open: boolean;
  onClose: () => void;
  doctor: Doctor | null;
  selectedDate: string; // YYYY-MM-DD
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const content = useMemo(() => {
    if (!doctor) return null;
    const stats = getDailyStats(doctor, selectedDate);
    const available = Math.max(0, stats.totalSlots - stats.bookedSlots);
    const utilizationPct =
      stats.totalSlots === 0 ? 0 : Math.round((stats.bookedSlots / stats.totalSlots) * 100);
    const wh = getWorkingHoursForDate(doctor, selectedDate);
    const workingHoursLabel = wh.isWorking && wh.start && wh.end ? `${wh.start}–${wh.end}` : "Off";
    const { appointments } = getAppointmentsForDoctorOnDate(doctor, selectedDate);
    const next7 = getNext7DaysSnapshot(doctor, selectedDate);
    const slotDuration = slotDurationMinutesByDoctorId[doctor.id] ?? 30;

    return {
      stats,
      available,
      utilizationPct,
      workingHoursLabel,
      appointments: appointments.sort((a, b) => a.time.localeCompare(b.time)),
      next7,
      slotDuration,
    };
  }, [doctor, selectedDate]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" aria-hidden={!open}>
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <aside
        className={`absolute right-0 top-0 h-dvh w-full md:w-[35%] lg:w-[32%] bg-gray-50 shadow-xl border-l border-gray-200 flex flex-col`}
        role="dialog"
        aria-modal="true"
        aria-label="Doctor details drawer"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white border-b border-gray-100 px-5 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
              Doctor Details
            </p>
            <h2 className="text-lg font-semibold text-gray-900 truncate">
              {doctor ? doctor.name : "—"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{formatLongDate(selectedDate)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {doctor && content && (
            <>
              {/* A. Doctor Info */}
              <section className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{doctor.name}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{doctor.specialty}</p>
                  </div>
                  <StatusBadge kind="doctor" status={doctor.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <KV label="Working Hours" value={content.workingHoursLabel} />
                  <KV label="Slot Duration" value={`${content.slotDuration} min`} />
                </div>
              </section>

              {/* B. Weekly Schedule Table */}
              <section>
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Weekly Schedule</h3>
                  <p className="text-xs text-gray-500 mt-1">Planned working pattern</p>
                </div>
                <TableContainer>
                  <SmallTable
                    headers={["Day", "Working?", "Start", "End"]}
                    rows={doctor.weeklySchedule.map((d) => [
                      d.day,
                      d.isWorking ? "Yes" : "No",
                      d.isWorking ? d.start : "—",
                      d.isWorking ? d.end : "—",
                    ])}
                  />
                </TableContainer>
              </section>

              {/* C. Selected Date Breakdown */}
              <section className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">Selected Date Breakdown</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {dayNameFromISODate(selectedDate)}
                    </p>
                  </div>
                  <StatusBadge kind="doctor" status={doctor.status} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <KV label="Total Slots" value={String(content.stats.totalSlots)} />
                  <KV label="Booked Slots" value={String(content.stats.bookedSlots)} />
                  <KV label="Available Slots" value={String(content.available)} />
                  <KV label="Utilization" value={`${content.utilizationPct}%`} />
                </div>
              </section>

              {/* D. Next 7 Days Snapshot Table */}
              <section>
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">Next 7 Days Snapshot</h3>
                  <p className="text-xs text-gray-500 mt-1">Planning visibility window</p>
                </div>
                <TableContainer>
                  <SmallTable
                    headers={["Date", "Working", "Total", "Booked", "Available"]}
                    rows={content.next7.map((d) => [
                      `${formatShortDate(d.date)}`,
                      d.working ? "Yes" : "No",
                      String(d.totalSlots),
                      String(d.bookedSlots),
                      String(d.availableSlots),
                    ])}
                  />
                </TableContainer>
              </section>

              {/* E. Selected Date Appointments Timeline */}
              <section className="bg-white rounded-2xl shadow-sm p-5 border border-gray-100">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Selected Date Appointments Timeline
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {content.appointments.length} booked appointment
                    {content.appointments.length === 1 ? "" : "s"}
                  </p>
                </div>

                {content.appointments.length === 0 ? (
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-700">No booked appointments</p>
                    <p className="text-xs text-gray-500 mt-1">
                      This day is off, on leave, or currently has no bookings in mock data.
                    </p>
                  </div>
                ) : (
                  <ul className="space-y-3">
                    {content.appointments.map((a: Appointment) => (
                      <li
                        key={a.id}
                        className="rounded-xl border border-gray-100 p-4 flex items-start justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {formatTimeLabel(a.time)}
                          </p>
                          <p className="text-sm text-gray-700 mt-0.5 truncate">{a.patient}</p>
                          <p className="text-xs text-gray-500 mt-1">Appointment ID: {a.id}</p>
                        </div>
                        <div className="shrink-0">
                          <StatusBadge kind="appointment" status={a.status} />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}

