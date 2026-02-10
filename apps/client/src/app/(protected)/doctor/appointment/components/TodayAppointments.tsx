import React from "react";
import type { Appointment } from "./types";
import AppointmentCard from "./AppointmentCard";
import EmptyState from "./EmptyState";

export default function TodayAppointments({
  appointments,
}: {
  appointments: Appointment[];
}) {
  if (!appointments || appointments.length === 0) {
    return (
      <section className="mb-6">
        <EmptyState message="No appointments scheduled for today" />
      </section>
    );
  }

  // assume appointments already sorted by time
  return (
    <section className="mb-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-3">
        Today’s Appointments
      </h2>
      <div>
        {appointments.map((a) => (
          <AppointmentCard key={a.id} appt={a} />
        ))}
      </div>
    </section>
  );
}
