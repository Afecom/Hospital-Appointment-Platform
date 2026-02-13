"use client";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import Snapshot from "./components/Snapshot";
import TodayAppointments from "./components/TodayAppointments";
import UpcomingAppointments from "./components/UpcomingAppointments";
import PastAppointments from "./components/PastAppointments";
import DetailPanel from "./components/DetailPanel";
import type { Appointment } from "./components/types";

export default function DoctorsAppointmentPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    today: Appointment[];
    upcomingByDate: Record<string, Appointment[]>;
    past: Appointment[];
    counts: {
      today: number;
      upcoming: number;
      completed: number;
      cancelled: number;
    };
  } | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/appointment/overview");
        if (!res.ok) throw new Error("Failed to load");
        const json = await res.json();
        if (mounted) setData(json);
      } catch (e) {
        console.error(e);
        if (mounted) setData(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="p-6">Loading appointments…</div>;
  const counts = data?.counts ?? {
    today: 0,
    upcoming: 0,
    completed: 0,
    cancelled: 0,
  };
  const today = data?.today ?? [];
  const upcomingByDate = data?.upcomingByDate ?? {};
  const past = data?.past ?? [];

  const doctorName = data?.doctor?.fullName ?? "Your Name";
  const specialization = data?.doctor?.specializations?.[0] ?? "General";
  const todayDate = new Date();
  const dateContext = `Today • ${todayDate.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}`;

  return (
    <div className="p-6">
      <Header
        doctorName={doctorName}
        specialization={specialization}
        dateContext={dateContext}
      />
      <Snapshot
        today={counts.today}
        upcoming={counts.upcoming}
        completed={counts.completed}
        cancelled={counts.cancelled}
      />

      <main>
        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Today's Appointments</h2>
          <TodayAppointments appointments={today} />
          {today.length === 0 && (
            <div className="mt-3 p-4 border rounded bg-white text-gray-600">
              You have no appointments today.
            </div>
          )}
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Details</h2>
          {today.length > 0 ? (
            <DetailPanel appt={today[0]} />
          ) : (
            <div className="mt-3 p-4 border rounded bg-white text-gray-600">
              No appointment selected.
            </div>
          )}
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Upcoming</h2>
          <UpcomingAppointments appointmentsByDate={upcomingByDate} />
          {Object.keys(upcomingByDate).length === 0 && (
            <div className="mt-3 p-4 border rounded bg-white text-gray-600">
              No upcoming appointments.
            </div>
          )}
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-medium mb-2">Past</h2>
          <PastAppointments appointments={past} />
          {past.length === 0 && (
            <div className="mt-3 p-4 border rounded bg-white text-gray-600">
              No past appointments.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
