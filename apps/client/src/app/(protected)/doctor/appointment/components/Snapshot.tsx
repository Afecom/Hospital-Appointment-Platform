import React from "react";

type SnapshotProps = {
  today: number;
  upcoming: number;
  completed: number;
  cancelled: number;
};

function Card({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex-1 bg-white border border-slate-100 rounded-md p-4 min-w-0">
      <div className="text-sm text-slate-600">{label}</div>
      <div className="mt-2 text-xl font-medium text-primary">{count}</div>
    </div>
  );
}

export default function Snapshot({
  today,
  upcoming,
  completed,
  cancelled,
}: SnapshotProps) {
  return (
    <section className="mb-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Card label="Today" count={today} />
        <Card label="Upcoming" count={upcoming} />
        <Card label="Completed" count={completed} />
        <Card label="Cancelled" count={cancelled} />
      </div>
    </section>
  );
}
