"use client";
import StatusBadge, { Status } from "./StatusBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPen,
  faPause,
  faTrash,
  faPlay,
} from "@fortawesome/free-solid-svg-icons";
import { useState, useEffect } from "react";
import { useToast } from "@/context/ToastContext";

export type ScheduleUpdatePayload = {
  type: "recurring" | "temporary" | "one_time";
  name: string;
  period: "morning" | "afternoon" | "evening";
  dayOfWeek: number[];
  date?: string;
  startDate?: string;
  endDate?: string;
  startTime: string;
  endTime: string;
};

function normalizeTime(value: string): string {
  if (!value || typeof value !== "string") return "";
  const trimmed = value.trim();
  const match = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (match) return `${match[1].padStart(2, "0")}:${match[2]}`;
  return trimmed.length >= 5 ? trimmed.slice(0, 5) : trimmed;
}

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
    isDeactivated: boolean;
    isExpired: boolean;
    dayOfWeek?: number[];
    status: Status;
  };
  onEdit: (payload: ScheduleUpdatePayload) => void | Promise<void>;
  onDeactivate: (s: typeof schedule) => void;
  onDelete: (s: typeof schedule) => void;
}) {
  const s = schedule;
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [pendingMap, setPendingMap] = useState<{
    save?: boolean;
    delete?: boolean;
    toggle?: boolean;
  }>({});
  const { addToast } = useToast();
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
              <div className="ml-2 text-blue-950 font-semibold italic truncate">
                {s.name}
              </div>
            ) : null}
          </div>
          <div className="font-medium text-gray-800">{formatDateRange()}</div>
          {Array.isArray(s.dayOfWeek) && s.dayOfWeek.length > 0 && (
            <div className="mt-2">
              <div className="flex flex-wrap gap-1">
                {s.dayOfWeek.map((d) => (
                  <span
                    key={d}
                    className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full"
                  >
                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][d] ?? d}
                  </span>
                ))}
              </div>
            </div>
          )}
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
              {s.status === "approved" && !s.isExpired && !s.isDeactivated && (
                <button
                  aria-label={`Edit schedule ${s.id}`}
                  title="Edit"
                  className="p-2 rounded text-gray-600 hover:text-blue-600 hover:bg-gray-50 transform transition duration-150 ease-in-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-blue-100 focus:outline-none"
                  onClick={() => setShowEdit(true)}
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>
              )}
              {s.status === "approved" && !s.isExpired && !s.isDeactivated && (
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
                  disabled={s.status !== "approved" || !!pendingMap.toggle}
                  className={`p-2 rounded ${s.status !== "approved" ? "opacity-40 cursor-not-allowed text-gray-400" : "text-gray-600 hover:bg-gray-50 hover:text-green-400 transform transition duration-150 ease-in-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-red-100 focus:outline-none"} ${pendingMap.toggle ? "opacity-60 cursor-wait" : ""}`}
                >
                  <FontAwesomeIcon icon={faPause} />
                </button>
              )}
              {s.status === "approved" && !s.isExpired && !s.isDeactivated && (
                <button
                  aria-label={`Delete schedule ${s.id}`}
                  title="Delete"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={!!pendingMap.delete}
                  className={`p-2 rounded text-gray-600 hover:text-red-600 hover:bg-gray-50 transform transition duration-150 ease-in-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-red-100 focus:outline-none ${pendingMap.delete ? "opacity-60 cursor-wait" : ""}`}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
              {(s.status === "pending" || s.status === "rejected") &&
                !s.isExpired &&
                !s.isDeactivated && (
                  <button
                    aria-label={`Edit schedule ${s.id}`}
                    title="Edit"
                    className="p-2 rounded text-gray-600 hover:text-blue-600 hover:bg-gray-50 transform transition duration-150 ease-in-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-blue-100 focus:outline-none"
                    onClick={() => setShowEdit(true)}
                  >
                    <FontAwesomeIcon icon={faPen} />
                  </button>
                )}
              {(s.status === "pending" || s.status === "rejected") &&
                !s.isExpired &&
                !s.isDeactivated && (
                  <button
                    aria-label={`Delete schedule ${s.id}`}
                    title="Delete"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={!!pendingMap.delete}
                    className={`p-2 rounded text-gray-600 hover:text-red-600 hover:bg-gray-50 transform transition duration-150 ease-in-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-red-100 focus:outline-none ${pendingMap.delete ? "opacity-60 cursor-wait" : ""}`}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                )}
              {s.isDeactivated && !s.isExpired && (
                <button
                  aria-label={`Activate schedule ${s.id}`}
                  title="Activate"
                  onClick={() => setShowDeactivateConfirm(true)}
                  disabled={!!pendingMap.toggle}
                  className={`p-2 rounded text-gray-600 hover:bg-gray-50 hover:text-green-400 transform transition duration-150 ease-in-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-red-100 focus:outline-none ${pendingMap.toggle ? "opacity-60 cursor-wait" : ""}`}
                >
                  <FontAwesomeIcon icon={faPlay} />
                </button>
              )}
              {s.isDeactivated && !s.isExpired && (
                <button
                  aria-label={`Edit schedule ${s.id}`}
                  title="Edit"
                  className="p-2 rounded text-gray-600 hover:text-blue-600 hover:bg-gray-50 transform transition duration-150 ease-in-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-blue-100 focus:outline-none"
                  onClick={() => setShowEdit(true)}
                >
                  <FontAwesomeIcon icon={faPen} />
                </button>
              )}
              {s.isDeactivated && !s.isExpired && (
                <button
                  aria-label={`Delete schedule ${s.id}`}
                  title="Delete"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={!!pendingMap.delete}
                  className={`p-2 rounded text-gray-600 hover:text-red-600 hover:bg-gray-50 transform transition duration-150 ease-in-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-red-100 focus:outline-none ${pendingMap.delete ? "opacity-60 cursor-wait" : ""}`}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
              {s.isExpired && (
                <button
                  aria-label={`Delete schedule ${s.id}`}
                  title="Delete"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={!!pendingMap.delete}
                  className={`p-2 rounded text-gray-600 hover:text-red-600 hover:bg-gray-50 transform transition duration-150 ease-in-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-red-100 focus:outline-none ${pendingMap.delete ? "opacity-60 cursor-wait" : ""}`}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showEdit ? (
        <EditScheduleModal
          schedule={s}
          isSaving={!!pendingMap.save}
          onClose={() => setShowEdit(false)}
          onSave={async (updated) => {
            // show saving
            setPendingMap((p) => ({ ...p, save: true }));
            try {
              await onEdit(updated);
              addToast({ type: "success", message: "Schedule updated" });
              setShowEdit(false);
            } catch (err: any) {
              console.error("Update failed", err);
              addToast({
                type: "error",
                message: err?.message ?? "Update failed",
              });
            } finally {
              setPendingMap((p) => ({ ...p, save: false }));
            }
          }}
        />
      ) : showDeleteConfirm ? (
        <ConfirmModal
          title="Delete schedule"
          message="Are you sure you want to delete this schedule? This action cannot be undone."
          onClose={() => setShowDeleteConfirm(false)}
          isPending={!!pendingMap.delete}
          onConfirm={async () => {
            setPendingMap((p) => ({ ...p, delete: true }));
            try {
              await onDelete(s);
              addToast({ type: "success", message: "Schedule deleted" });
            } catch (err: any) {
              console.error("Delete failed", err);
              addToast({
                type: "error",
                message: err?.message ?? "Delete failed",
              });
            } finally {
              setPendingMap((p) => ({ ...p, delete: false }));
              setShowDeleteConfirm(false);
            }
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
          isPending={!!pendingMap.toggle}
          onClose={() => setShowDeactivateConfirm(false)}
          onConfirm={async () => {
            setPendingMap((p) => ({ ...p, toggle: true }));
            try {
              await onDeactivate(s);
              addToast({
                type: "success",
                message: s.isDeactivated
                  ? "Schedule activated"
                  : "Schedule deactivated",
              });
            } catch (err: any) {
              console.error("Toggle failed", err);
              addToast({
                type: "error",
                message: err?.message ?? "Action failed",
              });
            } finally {
              setPendingMap((p) => ({ ...p, toggle: false }));
              setShowDeactivateConfirm(false);
            }
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
  isPending,
}: {
  title: string;
  message: string;
  onClose: () => void;
  onConfirm: () => void;
  isPending?: boolean;
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
            disabled={!!isPending}
            className={`px-4 py-2 rounded ${isPending ? "bg-gray-400 text-white cursor-wait" : "bg-red-600 text-white"}`}
          >
            {isPending ? "Confirming..." : "Confirm"}
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
  isSaving,
}: {
  schedule: {
    type: string;
    startDate?: string;
    endDate?: string;
    startTime?: string;
    endTime?: string;
    name?: string;
    period?: string;
    dayOfWeek?: number[];
  };
  onClose: () => void;
  onSave: (payload: ScheduleUpdatePayload) => void;
  isSaving?: boolean;
}) {
  const [type, setType] = useState<"recurring" | "temporary" | "one_time">(
    (schedule.type as any) ?? "one_time",
  );
  const [fromDate, setFromDate] = useState(schedule.startDate ?? "");
  const [toDate, setToDate] = useState(schedule.endDate ?? "");
  const [fromTime, setFromTime] = useState(
    normalizeTime(schedule.startTime ?? "") || "09:00",
  );
  const [toTime, setToTime] = useState(
    normalizeTime(schedule.endTime ?? "") || "17:00",
  );
  const [name, setName] = useState(schedule.name ?? "");
  const [period, setPeriod] = useState<"morning" | "afternoon" | "evening">(
    (schedule.period as any) ?? "morning",
  );
  const [dayOfWeek, setDayOfWeek] = useState<number[]>(
    Array.isArray(schedule.dayOfWeek) ? [...schedule.dayOfWeek] : [],
  );

  useEffect(() => {
    if (type === "one_time") {
      if (fromDate) {
        try {
          setDayOfWeek([new Date(fromDate + "Z").getUTCDay()]);
        } catch {
          if (dayOfWeek.length > 1) setDayOfWeek([dayOfWeek[0]]);
        }
      } else if (dayOfWeek.length > 1) {
        setDayOfWeek([dayOfWeek[0]]);
      }
    }
  }, [type, fromDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: ScheduleUpdatePayload = {
      type,
      name: name.trim() || "Schedule",
      period,
      dayOfWeek: type === "one_time" ? dayOfWeek : dayOfWeek.slice().sort((a, b) => a - b),
      startTime: normalizeTime(fromTime) || "09:00",
      endTime: normalizeTime(toTime) || "17:00",
    };
    if (type === "one_time") {
      payload.date = fromDate || undefined;
    } else {
      payload.startDate = fromDate || undefined;
      payload.endDate = toDate || undefined;
    }
    onSave(payload);
  };

  const toggleDay = (d: number) => {
    setDayOfWeek((prev) => {
      if (type === "one_time") {
        return prev.includes(d) ? [] : [d];
      }
      if (prev.includes(d)) return prev.filter((x) => x !== d);
      return [...prev, d].sort((a, b) => a - b);
    });
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
              onChange={(e) =>
                setPeriod(
                  e.target.value as "morning" | "afternoon" | "evening",
                )
              }
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
              onChange={(e) =>
                setType(
                  e.target.value as
                    | "recurring"
                    | "temporary"
                    | "one_time",
                )
              }
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
                {type === "one_time" ? "Date" : "From Date"}
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  if (type === "one_time") {
                    try {
                      const d = new Date(e.target.value).getDay();
                      setDayOfWeek([d]);
                    } catch {
                      // ignore
                    }
                  }
                }}
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
              disabled={!!isSaving}
              className={`px-4 py-2 rounded bg-blue-600 text-white ${isSaving ? "opacity-60 cursor-wait" : ""}`}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
