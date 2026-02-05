"use client";

export type Status = "approved" | "pending" | "rejected";

export default function StatusBadge({ status }: { status: Status }) {
  const base = "inline-flex items-center px-2 py-1 rounded text-sm font-medium";
  if (status === "approved")
    return (
      <span className={base + " bg-green-100 text-green-800"}>Approved</span>
    );
  if (status === "pending")
    return (
      <span className={base + " bg-yellow-100 text-yellow-800"}>Pending</span>
    );
  return <span className={base + " bg-red-100 text-red-800"}>Rejected</span>;
}
