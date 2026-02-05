"use client";

export type Status = "approved" | "pending" | "rejected";

export default function StatusBadge({ status }: { status: Status }) {
  const base =
    "inline-flex items-center px-3 py-0.5 rounded-full text-sm font-semibold tracking-wide";
  if (status === "approved")
    return (
      <span
        className={base + " bg-green-50 text-green-700 ring-1 ring-green-100"}
      >
        Approved
      </span>
    );
  if (status === "pending")
    return (
      <span
        className={
          base + " bg-yellow-50 text-yellow-700 ring-1 ring-yellow-100"
        }
      >
        Pending
      </span>
    );
  return (
    <span className={base + " bg-red-50 text-red-700 ring-1 ring-red-100"}>
      Rejected
    </span>
  );
}
