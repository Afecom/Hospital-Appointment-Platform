"use client";

import { clamp } from "../utils";

export default function ProgressBar({
  value,
  disabled = false,
}: {
  value: number;
  disabled?: boolean;
}) {
  const v = clamp(value, 0, 100);

  const color =
    disabled
      ? "bg-gray-300"
      : v < 70
        ? "bg-green-500"
        : v < 90
          ? "bg-yellow-500"
          : "bg-red-500";

  return (
    <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
      <div
        className={`h-full rounded-full ${color}`}
        style={{ width: `${v}%` }}
        aria-hidden
      />
    </div>
  );
}

