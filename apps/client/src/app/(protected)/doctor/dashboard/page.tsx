import React from "react";
import CriticalCards from "./components/CriticalCards";
import WeeklyChart from "./components/WeeklyChart";
import RightCards from "./components/RightCards";
import RecentActivities from "./components/RecentActivities";

export default function DoctorDashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Doctor Dashboard
        </h1>
        <div className="text-sm text-gray-500">Last updated: Feb 2, 2026</div>
      </div>

      {/* Section 1 - Critical Cards */}
      <CriticalCards />

      {/* Section 2 - Metrics & Analytics */}
      <section aria-labelledby="metrics-and-analytics">
        <h2 id="metrics-and-analytics" className="sr-only">
          Metrics & Analytics
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Appointments This Week
              </h3>

              <div className="flex items-center gap-6">
                <div className="text-sm text-gray-600">
                  <div className="text-xs text-gray-500">Completed</div>
                  <div className="text-base font-medium text-gray-900">18</div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="text-xs text-gray-500">Canceled</div>
                  <div className="text-base font-medium text-gray-900">3</div>
                </div>
                <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2v20"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      opacity="0.15"
                    />
                    <path
                      d="M6 14l3 3 7-11"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  +12% vs last week
                </div>
              </div>
            </div>

            <div className="mt-4">
              <WeeklyChart />
            </div>
          </div>

          <div className="md:col-span-1">
            <RightCards />
          </div>
        </div>
      </section>

      {/* Section 3 - Recent Activities */}
      <RecentActivities />
    </div>
  );
}
