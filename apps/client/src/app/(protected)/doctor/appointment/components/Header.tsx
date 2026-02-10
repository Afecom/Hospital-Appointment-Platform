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
      <div className="flex flex-col sm:flex-row items-start sm:items-baseline justify-between gap-2">
        <div>
          <h1 className="text-2xl font-semibold text-primary">
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
