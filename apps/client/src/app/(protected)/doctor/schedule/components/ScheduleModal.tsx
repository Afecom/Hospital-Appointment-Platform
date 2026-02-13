"use client";
import { useState, useEffect } from "react";
import { applySchedule } from "@/actions/applySchedule";
import { useToast } from "@/context/ToastContext";
import { useQueryClient } from "@tanstack/react-query";

type HospitalItem = { Hospital: { id: string; name: string } };

export default function ScheduleModal({
  hospitals,
  onClose,
  onApply,
  initialHospitalId,
}: {
  hospitals?: HospitalItem[];
  onClose: () => void;
  onApply: (payload: any) => void;
  initialHospitalId?: string;
}) {
  const queryClient = useQueryClient();
  const [type, setType] = useState("one_time");
  const [hospitalId, setHospitalId] = useState(
    initialHospitalId ?? (hospitals && hospitals[0]?.Hospital.id) ?? "",
  );
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");
  const [name, setName] = useState("");
  const [period, setPeriod] = useState("morning");
  const [dayOfWeek, setDayOfWeek] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    if (initialHospitalId) setHospitalId(initialHospitalId);
  }, [initialHospitalId]);

  useEffect(() => {
    if (type === "one_time") {
      setToDate("");
      // if a fromDate exists, ensure dayOfWeek matches that single date
      if (fromDate) {
        try {
          const d = new Date(fromDate).getDay();
          setDayOfWeek([d]);
        } catch (e) {
          // ignore
        }
      }
      // if more than one day selected, trim to the first
      if (dayOfWeek.length > 1) {
        setDayOfWeek([dayOfWeek[0]]);
      }
    }
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalDayOfWeek = dayOfWeek.slice();
    if (finalDayOfWeek.length === 0) {
      if (type === "one_time" && fromDate) {
        try {
          finalDayOfWeek = [new Date(fromDate).getDay()];
        } catch (e) {
          finalDayOfWeek = [];
        }
      }
    }

    if (finalDayOfWeek.length === 0) {
      alert(
        "Please select at least one day of the week or provide a valid start date for one-time schedules.",
      );
      return;
    }

    const payload = {
      hospitalId,
      type,
      dayOfWeek: finalDayOfWeek,
      // one-time schedules use `date`, recurring/temporary use startDate/endDate
      date: type === "one_time" ? fromDate || undefined : undefined,
      startDate: type === "one_time" ? undefined : fromDate || undefined,
      endDate: type === "one_time" ? undefined : toDate || undefined,
      startTime: fromTime || undefined,
      endTime: toTime || undefined,
      name,
      period,
    };

    (async () => {
      try {
        setLoading(true);
        const res = await applySchedule(payload);
        const message = res?.message || "Schedule application submitted";
        addToast({ message, type: "success" });
        onApply(res ?? payload);
      } catch (err: any) {
        console.error("Failed to apply schedule", err);
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to submit application";
        addToast({ message: msg, type: "error" });
        onApply({ error: err });
      } finally {
        await queryClient.invalidateQueries({ queryKey: ["doctorSchedules"] });
        setLoading(false);
      }
    })();
  };

  const toggleDay = (d: number) => {
    setDayOfWeek((prev) => {
      // For one-time schedules only allow selecting one day
      if (type === "one_time") {
        if (prev.includes(d)) return [];
        return [d];
      }

      if (prev.includes(d)) return prev.filter((x) => x !== d);
      return [...prev, d].sort((a, b) => a - b);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      aria-modal
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className="relative z-10 w-full max-w-lg mx-4 bg-white rounded-lg shadow-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-2">Apply for Schedule</h2>
        <p className="text-sm text-gray-500 mb-4">Fill the details below</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 p-1"
              placeholder="Schedule name, e.g. Dr. Smith — Clinic Hours"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Period
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                  aria-pressed={dayOfWeek.includes(d)}
                  aria-label={`Toggle ${["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][d]}`}
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="one_time">One-time</option>
              <option value="temporary">Temporary</option>
              <option value="recurring">Recurring</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Hospital
            </label>
            <select
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={!hospitals || hospitals.length === 0}
            >
              {hospitals && hospitals.length > 0 ? (
                hospitals.map((h) => (
                  <option key={h.Hospital.id} value={h.Hospital.id}>
                    {h.Hospital.name}
                  </option>
                ))
              ) : (
                <option value="" disabled>
                  No hospitals found for your account
                </option>
              )}
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
                    } catch (err) {
                      // ignore
                    }
                  }
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? "Applying..." : "Apply"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
