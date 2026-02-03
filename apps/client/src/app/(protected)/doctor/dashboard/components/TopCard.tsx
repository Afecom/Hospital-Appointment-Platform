"use client";
import React from "react";

type TopCardProps = {
  title: string;
  value: string | number;
  subtext?: string;
  cta?: {
    label: string;
    onClick?: () => void;
  } | null;
  statusBadge?: React.ReactNode;
  className?: string;
};

export default function TopCard({
  title,
  value,
  subtext,
  cta,
  statusBadge,
  className = "",
}: TopCardProps) {
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm p-5 flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
            {subtext && <p className="mt-1 text-sm text-gray-500">{subtext}</p>}
          </div>
          {statusBadge && <div className="self-start">{statusBadge}</div>}
        </div>
      </div>
      {cta ? (
        <div className="flex justify-end mt-auto">
          <button
            onClick={cta.onClick}
            className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {cta.label}
          </button>
        </div>
      ) : (
        <div className="h-6" />
      )}
    </div>
  );
}
