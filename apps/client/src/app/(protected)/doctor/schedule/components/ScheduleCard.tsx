"use client";
import StatusBadge, { Status } from "./StatusBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faPause,
  faTrash,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export default function ScheduleCard({
  schedule,
  onEdit,
  onDeactivate,
  onDelete,
}: {
  schedule: {
    name?: string;
    id: string;
    hospital: string;
    type: string;
    startDate: string;
    endDate?: string;
    period: string;
    startTime: string;
    endTime: string;
    isDeactivated?: boolean;
    dayOfWeek?: number[];
    status: Status;
  };
  onEdit: (s: any) => void;
  onDeactivate: (s: any) => void;
  onDelete: (s: any) => void;
}) {
  const s = schedule;
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  function formatDateRange() {
    if (s.endDate && s.endDate !== s.startDate)
      return `${s.startDate} — ${s.endDate}`;
    return s.startDate;
  }
  function formatTimeRange() {
    return `${s.startTime} - ${s.endTime}`;
  }

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between w-full rounded-lg p-3 md:p-4 bg-white shadow-md hover:shadow-xl transition-shadow transform duration-150 ease-in-out hover:-translate-y-1 gap-2">
        <div className="w-full md:max-w-[60%]">
          <div className="flex items-baseline gap-3">
            <div className="text-sm text-gray-500 truncate">{s.hospital}</div>
            {s.name ? (
              <div className="ml-2 text-indigo-600 font-semibold italic truncate">
                {s.name}
              </div>
            ) : null}
          </div>
          <div className="font-medium text-gray-800">{formatDateRange()}</div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="inline-block px-2 py-1 rounded-full bg-indigo-50 text-sm text-indigo-700">
              {s.type === "one_time"
                ? "One-time"
                : s.type.charAt(0).toUpperCase() + s.type.slice(1)}
            </span>
            <span className="inline-block px-2 py-1 rounded-full bg-gray-100 text-sm text-gray-700">
              {s.period.charAt(0).toUpperCase() + s.period.slice(1)}
            </span>
            <span className="text-sm text-gray-600">{formatTimeRange()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <StatusBadge status={s.status} />

            <div className="flex items-center gap-2">
              {s.status !== "approved" && !s.isDeactivated ? (
                <button
                  aria-label={`Edit schedule ${s.id}`}
                  title="Edit"
                  className="p-2 rounded text-gray-600 hover:text-blue-600 hover:bg-gray-50 transform transition duration-150 ease-in-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-blue-100 focus:outline-none"
                  onClick={() => setShowEdit(true)}
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>
              ) : null}

              {s.isDeactivated ? (
                <button
                  aria-label={`Activate schedule ${s.id}`}
                  title="Activate"
                  onClick={() => setShowDeactivateConfirm(true)}
                  className={`p-2 rounded text-gray-600 hover:bg-gray-50 hover:text-green-400 transform transition duration-150 ease-in-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-red-100 focus:outline-none`}
                >
                  <FontAwesomeIcon icon={faPlay} />
                </button>
              ) : (
                <button
                  aria-label={`Deactivate schedule ${s.id}`}
                  title={
                    s.status === "approved"
                      ? "Deactivate"
                      : "Only approved schedules can be deactivated"
                  }
                  onClick={() =>
                    s.status === "approved" && setShowDeactivateConfirm(true)
                  }
                  disabled={s.status !== "approved"}
                  className={`p-2 rounded ${s.status !== "approved" ? "opacity-40 cursor-not-allowed text-gray-400" : "text-gray-600 hover:bg-gray-50 hover:text-green-400 transform transition duration-150 ease-in-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-red-100 focus:outline-none"}`}
                >
                  <FontAwesomeIcon icon={faPause} />
                </button>
              )}

              <button
                aria-label={`Delete schedule ${s.id}`}
                title="Delete"
                onClick={() => setShowDeleteConfirm(true)}
                className={`p-2 rounded text-gray-600 hover:text-red-600 hover:bg-gray-50 transform transition duration-150 ease-in-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-red-100 focus:outline-none`}
              >
                <FontAwesomeIcon icon={faTrash} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {showEdit ? (
        <EditScheduleModal
          schedule={s}
          onClose={() => setShowEdit(false)}
          onSave={async (updated) => {
            setShowEdit(false);
            try {
              await onEdit(updated);
            } catch (err) {
              console.error("Update failed", err);
            }
          }}
        />
      ) : showDeleteConfirm ? (
        <ConfirmModal
          title="Delete schedule"
          message="Are you sure you want to delete this schedule? This action cannot be undone."
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={() => {
            setShowDeleteConfirm(false);
            onDelete(s);
          }}
        />
      ) : showDeactivateConfirm ? (
        <ConfirmModal
          title="Deactivate schedule"
          message={
            s.isDeactivated
              ? "Are you sure you want to activate this schedule?"
              : "Are you sure you want to deactivate this schedule?"
          }
          onClose={() => setShowDeactivateConfirm(false)}
          onConfirm={() => {
            setShowDeactivateConfirm(false);
            onDeactivate(s);
          }}
        />
      ) : null}
    </>
  );
}

function ConfirmModal({
  title,
  message,
  onClose,
  onConfirm,
}: {
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-md bg-white rounded-lg shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-600 mt-2">{message}</p>
        <div className="mt-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 text-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function EditScheduleModal({
  schedule,
  onClose,
  onSave,
}: {
  schedule: any;
  onClose: () => void;
  onSave: (s: any) => void;
}) {
  const [type, setType] = useState(schedule.type ?? "one_time");
  const [fromDate, setFromDate] = useState(schedule.startDate ?? "");
  const [toDate, setToDate] = useState(schedule.endDate ?? "");
  const [fromTime, setFromTime] = useState(schedule.startTime ?? "");
  const [toTime, setToTime] = useState(schedule.endTime ?? "");
  const [name, setName] = useState(schedule.name ?? "");
  const [period, setPeriod] = useState(schedule.period ?? "morning");
  const [dayOfWeek, setDayOfWeek] = useState<number[]>(
    schedule.dayOfWeek ?? [],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...schedule,
      type,
      name,
      period,
      dayOfWeek,
      startDate: fromDate,
      endDate: type === "one_time" ? undefined : toDate,
      startTime: fromTime,
      endTime: toTime,
    };
    onSave(updated);
  };

  const toggleDay = (d: number) => {
    setDayOfWeek((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-lg bg-white rounded-lg shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold">Edit Schedule</h3>
        <form onSubmit={handleSubmit} className="mt-3 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </div>

          <div>
            <p className="text-sm text-gray-500 mb-1">Days of Week</p>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDay(d)}
                  className={`px-2 py-1 rounded text-sm ${dayOfWeek.includes(d) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"}`}
                >
                  {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][d]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Schedule Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="one_time">One-time</option>
              <option value="temporary">Temporary</option>
              <option value="recurring">Recurring</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>

            {type !== "one_time" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                From Time
              </label>
              <input
                type="time"
                value={fromTime}
                onChange={(e) => setFromTime(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                To Time
              </label>
              <input
                type="time"
                value={toTime}
                onChange={(e) => setToTime(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-200 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-blue-600 text-white"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
