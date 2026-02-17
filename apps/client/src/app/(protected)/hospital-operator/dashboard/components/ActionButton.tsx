"use client";

import { MouseEventHandler } from "react";

interface ActionButtonProps {
  label: string;
  variant: "approve" | "reschedule" | "refund" | "view";
  onClick?: MouseEventHandler<HTMLButtonElement>;
}

const variantStyles = {
  approve: "bg-green-50 text-green-700 hover:bg-green-100 ring-1 ring-green-200",
  reschedule: "bg-blue-50 text-blue-700 hover:bg-blue-100 ring-1 ring-blue-200",
  refund: "bg-red-50 text-red-700 hover:bg-red-100 ring-1 ring-red-200",
  view: "bg-gray-50 text-gray-700 hover:bg-gray-100 ring-1 ring-gray-200",
};

export default function ActionButton({
  label,
  variant,
  onClick,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ${variantStyles[variant]}`}
    >
      {label}
    </button>
  );
}
