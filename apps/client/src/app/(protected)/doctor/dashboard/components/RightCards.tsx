"use client";
import React from "react";

export default function RightCards() {
  const avgPerDay = 4.5;
  const peak = { day: "Tuesday", count: 7 };
  const utilization = { percent: 80, booked: 32, total: 40 };

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <h4 className="text-sm font-semibold text-gray-700">Patient Load</h4>
        <p className="mt-2 text-2xl font-bold text-gray-900">
          Avg {avgPerDay} / day
        </p>
        <p className="mt-1 text-sm text-gray-500">
          Peak day: {peak.day} – {peak.count} appointments
        </p>
        <div className="mt-3 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          High
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-gray-700">
            Slot Utilization
          </h4>
          <div className="text-lg font-bold text-gray-900">
            {utilization.percent}%
          </div>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {utilization.booked} / {utilization.total} slots booked
        </p>
        <div className="mt-3 h-2 bg-gray-100 rounded overflow-hidden">
          <div
            className="h-2 bg-blue-600 rounded"
            style={{ width: `${utilization.percent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
