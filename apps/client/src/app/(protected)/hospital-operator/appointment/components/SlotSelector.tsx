"use client";

import { formatTimeLabel } from "../utils";

interface SlotSelectorProps {
  slotTimes: string[];
  bookedTimes: string[];
  excludeTime?: string;
  value: string | null;
  onChange: (time: string) => void;
}

export default function SlotSelector({
  slotTimes,
  bookedTimes,
  excludeTime,
  value,
  onChange,
}: SlotSelectorProps) {
  const isBooked = (time: string) => {
    if (excludeTime && time === excludeTime) return false;
    return bookedTimes.includes(time);
  };

  if (slotTimes.length === 0) {
    return (
      <p className="text-sm text-amber-600 bg-amber-50 rounded-xl p-4 border border-amber-100">
        No slots available for this date.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slotTimes.map((time) => {
        const booked = isBooked(time);
        const selected = value === time;
        return (
          <button
            key={time}
            type="button"
            disabled={booked}
            onClick={() => !booked && onChange(time)}
            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150
              ${
                booked
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : selected
                    ? "bg-blue-600 text-white ring-2 ring-blue-300 ring-offset-2"
                    : "bg-gray-50 text-gray-700 hover:bg-blue-50 hover:text-blue-700 ring-1 ring-gray-200"
              }`}
          >
            {formatTimeLabel(time)}
          </button>
        );
      })}
    </div>
  );
}
