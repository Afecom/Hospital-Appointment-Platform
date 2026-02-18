"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  doctors,
  getWorkingHoursForDate,
  generateSlotTimes,
  slotDurationMinutesByDoctorId,
} from "../../doctor/mockData";
import { getBookedSlotsForDoctorDate } from "../mockData";
import SlotSelector from "./SlotSelector";
import type { Appointment } from "../types";

interface RescheduleModalProps {
  open: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onSuccess: (updated: Appointment) => void;
  existingAppointments: Appointment[];
}

const inputBase =
  "block w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 cursor-not-allowed";
const inputEditable =
  "block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300";

export default function RescheduleModal({
  open,
  onClose,
  appointment,
  onSuccess,
  existingAppointments,
}: RescheduleModalProps) {
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [slotConflictError, setSlotConflictError] = useState(false);

  useEffect(() => {
    if (appointment && open) {
      setDoctorId(appointment.doctorId);
      setDate(appointment.date);
      setSelectedSlot(appointment.time);
      setSlotConflictError(false);
    }
  }, [appointment, open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const today = new Date().toISOString().slice(0, 10);
  const selectedDoctor = doctors.find((d) => d.id === doctorId);
  const { slotTimes, bookedTimes } = useMemo(() => {
    if (!selectedDoctor || !doctorId) return { slotTimes: [] as string[], bookedTimes: [] as string[] };
    const wh = getWorkingHoursForDate(selectedDoctor, date);
    const duration = slotDurationMinutesByDoctorId[doctorId] ?? 30;
    if (
      selectedDoctor.status === "ON_LEAVE" ||
      !wh.isWorking ||
      !wh.start ||
      !wh.end
    ) {
      return { slotTimes: [], bookedTimes: [] };
    }
    const slots = generateSlotTimes(wh.start, wh.end, duration);
    const booked = getBookedSlotsForDoctorDate(doctorId, date, existingAppointments);
    return { slotTimes: slots, bookedTimes: booked };
  }, [selectedDoctor, doctorId, date, existingAppointments]);

  const excludeTime =
    appointment && doctorId === appointment.doctorId && date === appointment.date
      ? appointment.time
      : undefined;

  const isSlotAvailable = (time: string) => {
    if (excludeTime && time === excludeTime) return true;
    return !bookedTimes.includes(time);
  };

  const checkSlotConflict = () => {
    if (!selectedSlot) return false;
    return !isSlotAvailable(selectedSlot);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appointment) return;
    setSlotConflictError(false);
    if (checkSlotConflict()) {
      setSlotConflictError(true);
      return;
    }
    const doctor = doctors.find((d) => d.id === doctorId);
    const updated: Appointment = {
      ...appointment,
      doctorId,
      doctorName: doctor?.name ?? appointment.doctorName,
      date,
      time: selectedSlot ?? appointment.time,
      status: "RESCHEDULED",
    };
    onSuccess(updated);
    onClose();
  };

  if (!open || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-hidden={!open}>
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reschedule-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 id="reschedule-modal-title" className="text-xl font-semibold text-gray-900">
            Reschedule Appointment
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="overflow-y-auto px-6 py-6 space-y-6">
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Patient (read-only)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Name
                  </label>
                  <input
                    type="text"
                    value={appointment.patientName}
                    readOnly
                    className={inputBase}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={appointment.phone}
                    readOnly
                    className={inputBase}
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Current</h3>
              <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
                <p>
                  <span className="font-medium">Doctor:</span> {appointment.doctorName}
                </p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(appointment.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
                <p>
                  <span className="font-medium">Time:</span> {appointment.time}
                </p>
              </div>
            </section>

            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">New Schedule</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Doctor
                </label>
                <select
                  value={doctorId}
                  onChange={(e) => {
                    setDoctorId(e.target.value);
                    setSelectedSlot(null);
                  }}
                  className={inputEditable}
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — {d.specialty}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={date}
                  min={today}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setSelectedSlot(null);
                  }}
                  className={inputEditable}
                />
              </div>
              {doctorId && date && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time Slot
                  </label>
                  <SlotSelector
                    slotTimes={slotTimes}
                    bookedTimes={bookedTimes}
                    excludeTime={excludeTime}
                    value={selectedSlot}
                    onChange={(t) => {
                      setSelectedSlot(t);
                      setSlotConflictError(false);
                    }}
                  />
                  {slotConflictError && (
                    <p className="text-sm text-red-600 mt-2">
                      Selected slot is no longer available.
                    </p>
                  )}
                </div>
              )}
            </section>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              Reschedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
