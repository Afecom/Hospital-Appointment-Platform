"use client";

import React, { useTransition } from "react";
import { getScheduleForAdminRes } from "@hap/contract";
import approveSchedule from "@/actions/approveSchedule";

const dayNumberToName = (dayNumber: number): string => {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[dayNumber] || "";
};

const ScheduleCard: React.FC<{
  schedule: getScheduleForAdminRes["data"]["schedules"][0];
}> = ({ schedule }) => {
  const [isPending, startTransition] = useTransition();
  const isRecurring = schedule.type === "reccuring";
  return (
    <div className="bg-white shadow-md rounded-lg p-4 flex flex-col">
      <div className="mb-3">
        <p className="font-bold text-md">Dr. {schedule.Doctor.User.fullName}</p>
        <p className="text-gray-500 text-sm">
          {schedule.Doctor.User.phoneNumber}
        </p>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
        <div>
          <p className="text-gray-500">Status</p>
          <p className="font-semibold">{schedule.status}</p>
        </div>
        <div>
          <p className="text-gray-500">Type</p>
          <p className="font-semibold">{schedule.type}</p>
        </div>
        <div>
          <p className="text-gray-500">Period</p>
          <p className="font-semibold">{schedule.period}</p>
        </div>
        <div>
          <p className="text-gray-500">Start Date</p>
          <p className="font-semibold">
            {schedule.startDate} {!isRecurring && `to ${schedule.endDate}`}
          </p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-500">Time</p>
          <p className="font-semibold">
            {schedule.startTime} - {schedule.endTime}
          </p>
        </div>
      </div>
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-1">Days of Week</p>
        <div className="flex flex-wrap gap-1">
          {schedule.dayOfWeek.map((day) => (
            <span
              key={day}
              className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full"
            >
              {dayNumberToName(day)}
            </span>
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-2 mt-auto">
        <button
          className={`bg-secondary ${!isPending && "hover:bg-blue-950 hover:cursor-pointer"}  transition-all text-white font-bold py-1 px-3 text-sm rounded`}
          disabled={isPending}
          onClick={() => {
            startTransition(() => {
              approveSchedule(schedule.id);
            });
          }}
        >
          {isPending ? "Approving..." : "Approve"}
        </button>
        <button className="bg-red-500 hover:bg-red-600 transition-all hover:cursor-pointer text-white font-bold py-1 px-3 text-sm rounded">
          Reject
        </button>
      </div>
    </div>
  );
};

export default ScheduleCard;
