"use client";
import React from "react";
import TopCard from "./TopCard";

type CriticalCardsProps = {
  today: { count: number; nextAt?: string | null };
  activeSchedules: { count: number; nextActiveDate?: string | null };
  pendingApplicationsCount: number;
};

export default function CriticalCards({
  today,
  activeSchedules,
  pendingApplicationsCount,
}: CriticalCardsProps) {
  const showApplicationsBadge = pendingApplicationsCount > 0;

  return (
    <section aria-labelledby="critical-actions">
      <h2 id="critical-actions" className="sr-only">
        Critical Action Cards
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TopCard
          title={`Today\u2019s Appointments`}
          value={today.count}
          subtext={
            today.nextAt
              ? `Next appointment at ${new Date(today.nextAt).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}`
              : undefined
          }
          cta={{ label: "View Today" }}
          className="min-h-36 h-36"
        />

        <TopCard
          title="Active Schedules"
          value={activeSchedules.count}
          subtext={
            activeSchedules.nextActiveDate
              ? `Next active date: ${activeSchedules.nextActiveDate}`
              : undefined
          }
          cta={null}
          className="min-h-36 h-36"
        />

        <TopCard
          title="Pending Hospital Applications"
          value={pendingApplicationsCount}
          cta={{ label: "View Applications" }}
          className="min-h-36 h-36"
          statusBadge={
            showApplicationsBadge ? (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending
              </span>
            ) : null
          }
        />
      </div>
    </section>
  );
}
