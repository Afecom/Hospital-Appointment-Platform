"use client";

import React from "react";
import { useToast } from "@/context/ToastContext";

type Relationship = {
  id: string;
  hospitalName: string;
  location?: string;
  slotDuration: string;
  workingTime: string;
  activeSchedulesCount: number;
  startDate: string;
};

type Props = {
  relationship: Relationship;
  onRequestSlotChange: (rel: Relationship) => void;
  onRequestRemoval: (rel: Relationship) => void;
};

export default function RelationshipCard({
  relationship,
  onRequestSlotChange,
  onRequestRemoval,
}: Props) {
  const {
    hospitalName,
    location,
    slotDuration,
    workingTime,
    activeSchedulesCount,
    startDate,
  } = relationship;
  const toast = useToast();

  // read-only card; actions open modals which create requests on the server
  return (
    <div className="bg-white shadow-sm border border-slate-100 rounded-lg p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-medium text-slate-900">
              {hospitalName}
            </h3>
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">
              Active
            </span>
          </div>
          {location && (
            <p className="text-sm text-slate-500 mt-1">{location}</p>
          )}
        </div>
        <div className="text-right text-sm text-slate-500">
          Since {startDate}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-slate-700">
        <div>
          <div className="text-xs text-slate-500">Active schedules</div>
          <div className="mt-1">
            <span className="inline-flex items-center text-sm font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              {activeSchedulesCount} active
            </span>
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Working time</div>
          <div className="mt-1">{workingTime}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500">Slot duration</div>
          <div className="mt-1">
            <span className="inline-flex items-center text-sm font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-800">
              {slotDuration}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => onRequestSlotChange(relationship)}
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Request Slot Duration Change
        </button>
        <button
          onClick={() => onRequestRemoval(relationship)}
          className="px-3 py-1 text-sm bg-white border border-slate-200 rounded-md text-rose-700 hover:bg-rose-50"
        >
          Request Relationship Removal
        </button>
      </div>
    </div>
  );
}
