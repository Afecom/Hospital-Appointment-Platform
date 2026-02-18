"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import {
  doctors,
  getWorkingHoursForDate,
  getDailyStats,
  generateSlotTimes,
  slotDurationMinutesByDoctorId,
} from "../../doctor/mockData";
import { getBookedSlotsForDoctorDate, createAppointmentId } from "../mockData";
import { toISODateString } from "../utils";
import SlotSelector from "./SlotSelector";
import type { Appointment, BookingSource } from "../types";

interface BookingModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (appointment: Appointment) => void;
  existingAppointments: Appointment[];
}

const inputBase =
  "block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300";

export default function BookingModal({
  open,
  onClose,
  onSuccess,
  existingAppointments,
}: BookingModalProps) {
  const today = toISODateString(new Date());
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [source, setSource] = useState<BookingSource>("OPERATOR");
  const [doctorId, setDoctorId] = useState("");
  const [doctorSearch, setDoctorSearch] = useState("");
  const [date, setDate] = useState(today);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const doctorAvailability = useMemo(() => {
    const result: Record<
      string,
      { isWorking: boolean; total: number; booked: number; label: string }
    > = {};
    for (const d of doctors) {
      const wh = getWorkingHoursForDate(d, date);
      const stats = getDailyStats(d, date);
      const booked = getBookedSlotsForDoctorDate(
        d.id,
        date,
        existingAppointments,
      ).length;
      const total = stats.totalSlots;
      let label: string;
      let isWorking: boolean;
      if (d.status === "ON_LEAVE" || !wh.isWorking) {
        isWorking = false;
        label = "OFF";
      } else if (total === 0) {
        isWorking = false;
        label = "OFF";
      } else if (booked >= total) {
        isWorking = true;
        label = "Fully Booked";
      } else {
        isWorking = true;
        label = "Available";
      }
      result[d.id] = { isWorking, total, booked, label };
    }
    return result;
  }, [date, existingAppointments]);

  const filteredDoctors = useMemo(() => {
    const q = doctorSearch.trim().toLowerCase();
    return doctors.filter(
      (d) =>
        !q ||
        d.name.toLowerCase().includes(q) ||
        d.specialty.toLowerCase().includes(q),
    );
  }, [doctorSearch]);

  const selectedDoctor = doctors.find((d) => d.id === doctorId);
  const { slotTimes, bookedTimes } = useMemo(() => {
    if (!selectedDoctor || !doctorId)
      return { slotTimes: [] as string[], bookedTimes: [] as string[] };
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
    const booked = getBookedSlotsForDoctorDate(
      doctorId,
      date,
      existingAppointments,
    );
    return { slotTimes: slots, bookedTimes: booked };
  }, [selectedDoctor, doctorId, date, existingAppointments]);

  const isPastDate = (d: string) => d < today;
  const isDoctorWorkingOnDate = (docId: string, d: string) => {
    const doc = doctors.find((x) => x.id === docId);
    if (!doc) return true;
    const wh = getWorkingHoursForDate(doc, d);
    return doc.status !== "ON_LEAVE" && wh.isWorking;
  };
  const isDateDisabled = (d: string) => {
    if (isPastDate(d)) return true;
    if (!doctorId) return false;
    return !isDoctorWorkingOnDate(doctorId, d);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (!patientName.trim()) err.patientName = "Required";
    if (!phone.trim()) err.phone = "Required";
    if (!doctorId) err.doctor = "Select a doctor";
    else {
      const avail = doctorAvailability[doctorId];
      if (!avail?.isWorking || avail.label === "Fully Booked")
        err.doctor = "Select an available doctor";
      else if (isDateDisabled(date))
        err.date = "Selected date is not a working day";
    }
    if (!selectedSlot) err.slot = "Select a time slot";
    setErrors(err);
    if (Object.keys(err).length) return;

    const doctor = doctors.find((d) => d.id === doctorId)!;
    const status = source === "OPERATOR" ? "APPROVED" : "PENDING";
    const newAppointment: Appointment = {
      id: createAppointmentId(existingAppointments),
      patientName: patientName.trim(),
      phone: phone.trim(),
      doctorId,
      doctorName: doctor.name,
      date,
      time: selectedSlot!,
      source,
      status,
      paymentStatus: "UNPAID",
    };
    onSuccess(newAppointment);
    onClose();
    setPatientName("");
    setPhone("");
    setReason("");
    setSource("OPERATOR");
    setDoctorId("");
    setDoctorSearch("");
    setDate(today);
    setSelectedSlot(null);
    setErrors({});
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="booking-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2
            id="booking-modal-title"
            className="text-xl font-semibold text-gray-900"
          >
            Book Appointment
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
            {/* Section A — Patient Info */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Patient Info
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    className={inputBase}
                    placeholder="Full name"
                  />
                  {errors.patientName && (
                    <p className="text-xs text-red-600 mt-1">
                      {errors.patientName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputBase}
                    placeholder="+251..."
                  />
                  {errors.phone && (
                    <p className="text-xs text-red-600 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={2}
                  className={inputBase}
                  placeholder="Brief reason for visit"
                />
              </div>
            </section>

            {/* Section B — Doctor Selection */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">
                Doctor Selection
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Search doctor
                </label>
                <input
                  type="text"
                  value={doctorSearch}
                  onChange={(e) => setDoctorSearch(e.target.value)}
                  placeholder="Name or specialty"
                  className={inputBase}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Doctor
                </label>
                <div className="rounded-xl border border-gray-200 overflow-hidden max-h-48 overflow-y-auto">
                  {filteredDoctors.map((d) => {
                    const avail = doctorAvailability[d.id];
                    const disabled =
                      !avail?.isWorking || avail?.label === "Fully Booked";
                    const isSelected = doctorId === d.id;
                    return (
                      <button
                        key={d.id}
                        type="button"
                        disabled={disabled}
                        onClick={() => !disabled && setDoctorId(d.id)}
                        className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 border-b border-gray-100 last:border-b-0 transition-colors ${
                          disabled
                            ? "bg-gray-50 cursor-not-allowed opacity-70"
                            : isSelected
                              ? "bg-blue-50 ring-1 ring-blue-200"
                              : "hover:bg-gray-50"
                        }`}
                      >
                        <div>
                          <p className="font-medium text-gray-900">{d.name}</p>
                          <p className="text-sm text-gray-500">{d.specialty}</p>
                        </div>
                        <span
                          className={`shrink-0 text-xs font-medium px-2.5 py-1 rounded-full ${
                            avail?.label === "OFF"
                              ? "bg-gray-100 text-gray-600"
                              : avail?.label === "Fully Booked"
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {avail?.label ?? "—"}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {errors.doctor && (
                  <p className="text-xs text-red-600 mt-1">{errors.doctor}</p>
                )}
              </div>
            </section>

            {/* Section C — Date Picker */}
            <section className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900">Date</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={today}
                  className={inputBase}
                />
                {errors.date && (
                  <p className="text-xs text-red-600 mt-1">{errors.date}</p>
                )}
                {doctorId && !errors.date && (
                  <p className="text-xs text-gray-500 mt-1">
                    Choose a working day for the selected doctor.
                  </p>
                )}
              </div>
            </section>

            {/* Section D — Available Slots */}
            {doctorId && (
              <section className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">
                  Available Time Slots
                </h3>
                <SlotSelector
                  slotTimes={slotTimes}
                  bookedTimes={bookedTimes}
                  value={selectedSlot}
                  onChange={(t) => setSelectedSlot(t)}
                />
                {errors.slot && (
                  <p className="text-xs text-red-600">{errors.slot}</p>
                )}
              </section>
            )}
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
              Book Appointment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
