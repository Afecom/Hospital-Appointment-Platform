"use client";
import { useState, useEffect } from "react";

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
  const [type, setType] = useState("one_time");
  const [hospitalId, setHospitalId] = useState(
    initialHospitalId ?? (hospitals && hospitals[0]?.Hospital.id) ?? "",
  );
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [fromTime, setFromTime] = useState("");
  const [toTime, setToTime] = useState("");

  useEffect(() => {
    if (initialHospitalId) setHospitalId(initialHospitalId);
  }, [initialHospitalId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      type,
      hospitalId,
      fromDate: fromDate || null,
      toDate: (type === "one_time" ? null : toDate) || null,
      period: fromTime && toTime ? `${fromTime} - ${toTime}` : null,
    };

    onApply(payload);
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
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
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
            >
              Apply
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
