"use client";

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: number | string;
  subtext?: string;
  icon: LucideIcon;
  color: "yellow" | "green" | "blue" | "red" | "gray" | "purple";
}

const colorClasses = {
  yellow: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    ring: "ring-yellow-100",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  green: {
    bg: "bg-green-50",
    text: "text-green-700",
    ring: "ring-green-100",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
  },
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-100",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  red: {
    bg: "bg-red-50",
    text: "text-red-700",
    ring: "ring-red-100",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
  gray: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    ring: "ring-gray-100",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
  },
  purple: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    ring: "ring-purple-100",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
};

export default function KPICard({
  title,
  value,
  subtext,
  icon: Icon,
  color,
}: KPICardProps) {
  const colors = colorClasses[color];

  return (
    <div
      className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200 border border-gray-100"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className={`text-sm font-medium ${colors.text} mb-1`}>{title}</p>
          <p className={`text-3xl font-bold ${colors.text} mb-1`}>{value}</p>
          {subtext && (
            <p className="text-xs text-gray-500 mt-1">{subtext}</p>
          )}
        </div>
        <div
          className={`${colors.iconBg} ${colors.iconColor} p-3 rounded-xl`}
        >
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}
