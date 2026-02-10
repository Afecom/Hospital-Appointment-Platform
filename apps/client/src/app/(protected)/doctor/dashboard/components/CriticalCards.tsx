"use client";
import React from "react";
import TopCard from "./TopCard";

type CriticalCardsProps = {
  today: { count: number; nextAt?: string | null };
  activeSchedules: { count: number; nextActiveDate?: string | null };
  pendingSchedulesCount: number | undefined;
  pendingApplicationsCount: number;
  activeHospitalsCount: number | undefined;
};

export default function CriticalCards({
  today,
  activeSchedules,
  pendingSchedulesCount,
  pendingApplicationsCount,
  activeHospitalsCount,
}: CriticalCardsProps) {
  const showApplicationsBadge = pendingApplicationsCount > 0;
  const hasPendingSchedules = pendingSchedulesCount ? true : false;

  return (
    <section aria-labelledby="critical-actions">
      <div className="flex items-center justify-between mb-4">
        <h2
          id="critical-actions"
          className="text-lg font-semibold text-gray-800"
        >
          Critical Action Cards
        </h2>
        <p className="text-sm text-gray-500">Quick actions and status</p>
      </div>

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
          className="min-h-40 h-40"
        />

        {/* Schedules card: render Pending Schedules if any pending, otherwise Active Schedules */}
        {hasPendingSchedules ? (
          <TopCard
            title="Pending Schedules"
            value={pendingSchedulesCount}
            subtext={`${pendingSchedulesCount} awaiting approval`}
            cta={{ label: "View Schedules" }}
            className="min-h-40 h-40"
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
            className="min-h-40 h-40"
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
            cta={{ label: "View Hospitals" }}
            className="min-h-40 h-40"
          />
        )}
      </div>
    </section>
  );
}
