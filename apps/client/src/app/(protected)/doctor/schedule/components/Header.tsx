"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

export default function ScheduleHeader({ onApply }: { onApply: () => void }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">My Schedules</h1>
        <p className="text-sm text-gray-500">
          Manage your hospital schedules and availability
        </p>
      </div>

      <div className="w-[50%] md:w-full flex justify-center sm:justify-end items-center gap-2">
        <button
          className="w-full inline-flex items-center gap-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-blue-700 shadow-sm transform transition duration-150 ease-in-out hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-blue-200 focus:outline-none"
          onClick={onApply}
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Apply for Schedule</span>
        </button>
      </div>
    </div>
  );
}
