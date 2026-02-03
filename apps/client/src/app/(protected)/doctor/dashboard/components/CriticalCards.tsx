"use client";
import React from "react";
import TopCard from "./TopCard";

type CriticalCardsProps = {
  today: { count: number; nextAt?: string | null };
  activeSchedules: { count: number; nextActiveDate?: string | null };
  pendingSchedulesCount: number;
  pendingApplicationsCount: number;
  activeHospitalsCount: number;
};

export default function CriticalCards({
  today,
  activeSchedules,
  pendingSchedulesCount,
  pendingApplicationsCount,
  activeHospitalsCount,
}: CriticalCardsProps) {
  const showApplicationsBadge = pendingApplicationsCount > 0;
  const hasPendingSchedules = pendingSchedulesCount > 0;

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

        {/* Schedules card: render Pending Schedules if any pending, otherwise Active Schedules */}
        {hasPendingSchedules ? (
          <TopCard
            title="Pending Schedules"
            value={pendingSchedulesCount}
            subtext={`You have ${pendingSchedulesCount} pending schedule(s) awaiting review`}
            cta={{ label: "Review Schedules" }}
            className="min-h-36 h-36"
          />
        ) : (
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
        )}

        {/* Hospitals card: pending hospital applications take precedence */}
        {showApplicationsBadge ? (
          <TopCard
            title="Pending Hospital Applications"
            value={pendingApplicationsCount}
            cta={{ label: "View Applications" }}
            className="min-h-36 h-36"
            statusBadge={
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Pending
              </span>
            }
          />
        ) : (
          <TopCard
            title="Active Hospitals"
            value={activeHospitalsCount}
            subtext={`${activeHospitalsCount} connected hospital(s)`}
            cta={null}
            className="min-h-36 h-36"
          />
        )}
      </div>
    </section>
  );
}
