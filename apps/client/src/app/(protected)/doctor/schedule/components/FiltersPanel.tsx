"use client";

export default function FiltersPanel({
  period,
  setPeriod,
  hospital,
  setHospital,
  hospitals,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  fromTime,
  setFromTime,
  toTime,
  setToTime,
  scheduleType,
  setScheduleType,
  clearFilters,
  showMobileToggle,
  showMobile,
  onToggleMobile,
}: {
  period: string;
  setPeriod: (p: string) => void;
  hospital: string;
  setHospital: (h: string) => void;
  hospitals: string[];
  fromDate: string;
  setFromDate: (d: string) => void;
  toDate: string;
  setToDate: (d: string) => void;
  fromTime: string;
  setFromTime: (t: string) => void;
  toTime: string;
  setToTime: (t: string) => void;
  scheduleType: string;
  setScheduleType: (t: string) => void;
  clearFilters: () => void;
  showMobileToggle?: boolean;
  showMobile?: boolean;
  onToggleMobile?: () => void;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-medium text-gray-800">Filters</h3>
        {showMobileToggle && (
          <div className="sm:hidden">
            <button
              className="text-blue-600 underline"
              onClick={onToggleMobile}
            >
              {showMobile ? "Hide Filters" : "Show Filters"}
            </button>
          </div>
        )}
      </div>

      <div className="rounded-lg p-4 bg-white shadow-md transition-shadow hover:shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-700">Period</label>
            <select
              className="mt-1 block w-full rounded-md border px-2 py-1"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="">Any</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700">Schedule type</label>
            <select
              className="mt-1 block w-full rounded-md border px-2 py-1"
              value={scheduleType}
              onChange={(e) => setScheduleType(e.target.value)}
            >
              <option value="">Any</option>
              <option value="recurring">Recurring</option>
              <option value="temporary">Temporary</option>
              <option value="one_time">One-time</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-700">Hospital</label>
            <select
              className="mt-1 block w-full rounded-md border px-2 py-1"
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
            >
              <option value="">Any</option>
              {hospitals.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end justify-end">
            <button
              className="text-sm text-gray-600 underline"
              onClick={clearFilters}
            >
              Clear Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-4">
          <div>
            <label className="block text-sm text-gray-700">From date</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border px-2 py-1"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">To date</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border px-2 py-1"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">From time</label>
            <input
              type="time"
              className="mt-1 block w-full rounded-md border px-2 py-1"
              value={fromTime}
              onChange={(e) => setFromTime(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700">To time</label>
            <input
              type="time"
              className="mt-1 block w-full rounded-md border px-2 py-1"
              value={toTime}
              onChange={(e) => setToTime(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
