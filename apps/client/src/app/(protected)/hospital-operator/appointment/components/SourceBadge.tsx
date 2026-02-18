"use client";

import type { BookingSource } from "../types";

interface SourceBadgeProps {
  source: BookingSource;
}

const sourceConfig: Record<
  BookingSource,
  { label: string; className: string }
> = {
  WEB: { label: "Web", className: "bg-blue-50 text-blue-700 ring-blue-100" },
  APP: {
    label: "App",
    className: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  },
  CALL_CENTER: {
    label: "Call Center",
    className: "bg-purple-50 text-purple-700 ring-purple-100",
  },
  OPERATOR: {
    label: "Operator",
    className: "bg-teal-50 text-teal-700 ring-teal-100",
  },
};

export default function SourceBadge({ source }: SourceBadgeProps) {
  const cfg = sourceConfig[source] ?? {
    label: String(source ?? "Unknown"),
    className: "bg-gray-50 text-gray-700 ring-gray-100",
  };
  const base =
    "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide ring-1";
  return <span className={`${base} ${cfg.className}`}>{cfg.label}</span>;
}
