"use client";

import { Doctor } from "../mockData";
import StatusBadge from "./StatusBadge";
import ProgressBar from "./ProgressBar";
import { formatTimeLabel } from "../utils";

export type DoctorOperationalRow = {
  doctor: Doctor;
  workingHoursLabel: string;
  totalSlots: number;
  bookedSlots: number;
  availableSlots: number;
  utilizationPct: number;
  nextAvailableSlot: string | null;
  isDisabled: boolean;
};

export default function DoctorCard({
  row,
  onClick,
}: {
  row: DoctorOperationalRow;
  onClick: () => void;
}) {
  const disabledLook = row.isDisabled;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative text-left w-full bg-white rounded-2xl shadow-sm p-6 border border-gray-100 transition-shadow duration-200 hover:shadow-md`}
    >
      {disabledLook && (
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl bg-gray-50/60"
          aria-hidden
        />
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-base font-semibold text-gray-900 truncate">{row.doctor.name}</p>
          <p className="text-sm text-gray-500 mt-0.5">{row.doctor.specialty}</p>
        </div>
        <div className="shrink-0">
          <StatusBadge kind="doctor" status={row.doctor.status} />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-500">Working Hours</p>
          <p className="text-sm font-semibold text-gray-900 mt-1">{row.workingHoursLabel}</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-500">Utilization</p>
          <p className="text-sm font-semibold text-gray-900 mt-1">{row.utilizationPct}%</p>
        </div>

        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-500">Slots</p>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {row.bookedSlots}/{row.totalSlots} booked
          </p>
          <p className="text-xs text-gray-500 mt-0.5">{row.availableSlots} available</p>
        </div>
        <div className="rounded-xl bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-500">Next Available</p>
          <p className="text-sm font-semibold text-gray-900 mt-1">
            {row.nextAvailableSlot ? formatTimeLabel(row.nextAvailableSlot) : "—"}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
          <span>Utilization</span>
          <span className="font-medium text-gray-700">{row.utilizationPct}%</span>
        </div>
        <ProgressBar value={row.utilizationPct} disabled={disabledLook} />
      </div>

      {disabledLook && (
        <div className="mt-4 rounded-xl bg-gray-50 p-3">
          <p className="text-sm font-medium text-gray-700">Unavailable</p>
          <p className="text-xs text-gray-500 mt-1">
            This provider is currently on leave for the selected date.
          </p>
        </div>
      )}
    </button>
  );
}

