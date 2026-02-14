"use client";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import Snapshot from "./components/Snapshot";
import TodayAppointments from "./components/TodayAppointments";
import UpcomingAppointments from "./components/UpcomingAppointments";
import PastAppointments from "./components/PastAppointments";
import DetailPanel from "./components/DetailPanel";
import api from "@/lib/axios";
import { useQuery } from "@tanstack/react-query";
import { doctorOverviewRes } from "@hap/contract";
import LoadingSkeleton from "./components/LoadingSkeleton";

export default function DoctorsAppointmentPage() {
  const {
    data: doctorData,
    isLoading: doctorLoading,
    error,
  } = useQuery({
    queryKey: ["doctorAppointment"],
    queryFn: async () => {
      try {
        const res = await api.get<doctorOverviewRes>(
          "/appointment/doctor/overview",
        );
        return res.data.data;
      } catch (error) {
        throw error;
      }
    },
  });

  if (doctorLoading) return <LoadingSkeleton />;
  const data = doctorData ?? null;
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
