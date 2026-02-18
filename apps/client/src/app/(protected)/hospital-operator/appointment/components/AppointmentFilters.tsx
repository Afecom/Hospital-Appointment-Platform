"use client";

import type { AppointmentStatus, BookingSource } from "../types";

interface AppointmentFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: AppointmentStatus | "ALL";
  onStatusChange: (v: AppointmentStatus | "ALL") => void;
  sourceFilter: BookingSource | "ALL";
  onSourceChange: (v: BookingSource | "ALL") => void;
  doctorFilter: string;
  onDoctorChange: (v: string) => void;
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (v: string) => void;
  onDateToChange: (v: string) => void;
  doctors: { id: string; name: string }[];
}

const statusOptions: { value: AppointmentStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "APPROVED", label: "Approved" },
  { value: "RESCHEDULED", label: "Rescheduled" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "COMPLETED", label: "Completed" },
];

const sourceOptions: { value: BookingSource | "ALL"; label: string }[] = [
  { value: "ALL", label: "All sources" },
  { value: "WEB", label: "Web" },
  { value: "APP", label: "App" },
  { value: "CALL_CENTER", label: "Call Center" },
  { value: "OPERATOR", label: "Operator" },
];

const inputBase =
  "block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300";

export default function AppointmentFilters({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  sourceFilter,
  onSourceChange,
  doctorFilter,
  onDoctorChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  doctors,
}: AppointmentFiltersProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div className="w-full lg:w-64 min-w-0">
        <label className="block text-sm font-medium text-gray-700">Search</label>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Name or phone"
          className={`${inputBase} mt-1`}
        />
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end flex-wrap">
        <div className="w-full lg:w-40 min-w-0">
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as AppointmentStatus | "ALL")}
            className={`${inputBase} mt-1`}
          >
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full lg:w-40 min-w-0">
          <label className="block text-sm font-medium text-gray-700">Source</label>
          <select
            value={sourceFilter}
            onChange={(e) => onSourceChange(e.target.value as BookingSource | "ALL")}
            className={`${inputBase} mt-1`}
          >
            {sourceOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full lg:w-48 min-w-0">
          <label className="block text-sm font-medium text-gray-700">Doctor</label>
          <select
            value={doctorFilter}
            onChange={(e) => onDoctorChange(e.target.value)}
            className={`${inputBase} mt-1`}
          >
            <option value="ALL">All doctors</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="w-full lg:w-36 min-w-0">
          <label className="block text-sm font-medium text-gray-700">From date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className={`${inputBase} mt-1`}
          />
        </div>

        <div className="w-full lg:w-36 min-w-0">
          <label className="block text-sm font-medium text-gray-700">To date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className={`${inputBase} mt-1`}
          />
        </div>
      </div>
    </div>
  );
}
