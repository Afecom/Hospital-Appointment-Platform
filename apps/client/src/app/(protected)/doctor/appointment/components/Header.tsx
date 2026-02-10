import React from "react";

type Props = {
  doctorName: string;
  specialization: string;
  dateContext: "Today" | "This Week" | string;
};

export default function Header({
  doctorName,
  specialization,
  dateContext,
}: Props) {
  return (
    <header className="mb-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            My Appointments
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {doctorName} • {specialization}
          </p>
        </div>
        <div className="text-sm text-slate-600">{dateContext}</div>
      </div>
    </header>
  );
}
