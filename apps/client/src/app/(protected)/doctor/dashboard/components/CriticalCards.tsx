"use client";
import React from "react";
import TopCard from "./TopCard";

export default function CriticalCards() {
  // Mock conditional states
  const activeSchedules = { count: 2, nextDate: "Feb 5", hasPending: false };
  const hospitalApplications = { count: 1, hasPending: true };

  return (
    <section aria-labelledby="critical-actions">
      <h2 id="critical-actions" className="sr-only">
        Critical Action Cards
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TopCard
          title={`Today\u2019s Appointments`}
          value={6}
          subtext={`Next appointment at 10:30 AM`}
          cta={{ label: "View Today" }}
          className="min-h-36 h-36"
        />

        <TopCard
          title="Active Schedules"
          value={activeSchedules.count}
          subtext={`Next active date: ${activeSchedules.nextDate}`}
          cta={null}
          className="min-h-36 h-36"
        />

        <TopCard
          title="Pending Hospital Applications"
          value={hospitalApplications.count}
          cta={{ label: "View Applications" }}
          className="min-h-36 h-36"
          statusBadge={
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Pending
            </span>
          }
        />
      </div>
    </section>
  );
}
