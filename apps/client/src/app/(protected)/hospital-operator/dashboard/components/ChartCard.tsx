"use client";

import { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({
  title,
  children,
  className = "",
}: ChartCardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm p-6 border border-gray-100 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="w-full">{children}</div>
    </div>
  );
}
