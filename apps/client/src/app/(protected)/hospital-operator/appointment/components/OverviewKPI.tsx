"use client";

import type { AppointmentStatus } from "../types";

type KPIItem = {
  key: AppointmentStatus | "ALL";
  label: string;
  count: number;
  color: string;
};

interface OverviewKPIProps {
  counts: {
    pending: number;
    approved: number;
    rescheduled: number;
    refunded: number;
    total: number;
  };
  activeFilter: AppointmentStatus | "ALL";
  onFilter: (status: AppointmentStatus | "ALL") => void;
}

export default function OverviewKPI({
  counts,
  activeFilter,
  onFilter,
}: OverviewKPIProps) {
  const items: KPIItem[] = [
    { key: "PENDING", label: "Pending", count: counts.pending, color: "yellow" },
    { key: "APPROVED", label: "Approved", count: counts.approved, color: "green" },
    {
      key: "RESCHEDULED",
      label: "Rescheduled",
      count: counts.rescheduled,
      color: "blue",
    },
    { key: "REFUNDED", label: "Refunded", count: counts.refunded, color: "gray" },
    { key: "ALL", label: "Total", count: counts.total, color: "slate" },
  ];

  const colorClasses: Record<string, string> = {
    yellow: "bg-yellow-50 text-yellow-700 ring-yellow-100 hover:bg-yellow-100",
    green: "bg-green-50 text-green-700 ring-green-100 hover:bg-green-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100 hover:bg-blue-100",
    gray: "bg-gray-50 text-gray-700 ring-gray-100 hover:bg-gray-100",
    slate: "bg-slate-50 text-slate-700 ring-slate-100 hover:bg-slate-100",
  };

  const activeClasses =
    "ring-2 ring-offset-1 ring-blue-400 font-semibold";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = activeFilter === item.key;
        return (
          <button
            key={item.key}
            type="button"
            onClick={() => onFilter(item.key)}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-150 ring-1 ${colorClasses[item.color]} ${isActive ? activeClasses : ""}`}
          >
            <span>{item.label}</span>
            <span className="tabular-nums">{item.count}</span>
          </button>
        );
      })}
    </div>
  );
}
