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

  const doctorName = "Dr. Ayub Mussa";
  const specialization = "Cardiology";
  const dateContext = "Today";

  if (loading) return <div className="p-6">Loading appointments…</div>;

  if (
    !data ||
    (data.counts.today === 0 &&
      data.counts.upcoming === 0 &&
      data.counts.completed === 0)
  ) {
    return (
      <div className="p-6">
        <Header
          doctorName={doctorName}
          specialization={specialization}
          dateContext={dateContext}
        />
        <div className="mt-6 text-center text-gray-500">
          No appointments found.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Header
        doctorName={doctorName}
        specialization={specialization}
        dateContext={dateContext}
      />
      <Snapshot
        today={data.counts.today}
        upcoming={data.counts.upcoming}
        completed={data.counts.completed}
        cancelled={data.counts.cancelled}
      />

      <main>
        <TodayAppointments appointments={data.today} />
        {data.today.length > 0 && <DetailPanel appt={data.today[0]} />}
        <UpcomingAppointments appointmentsByDate={data.upcomingByDate} />
        <PastAppointments appointments={data.past} />
      </main>
    </div>
  );
}
