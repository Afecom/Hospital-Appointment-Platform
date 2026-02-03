import { headers } from "next/headers";
import CriticalCards from "./components/CriticalCards";
import WeeklyChart from "./components/WeeklyChart";
import RightCards from "./components/RightCards";
import RecentActivities from "./components/RecentActivities";

async function getData() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const fetchOptions = {
    cache: "no-store" as RequestCache,
    headers: await headers(),
  };

  try {
    const res = await fetch(`${apiBaseUrl}/doctor/dashboard`, fetchOptions);
    if (!res.ok) throw new Error("Failed to fetch dashboard data");

    const payload = await res.json();
    return payload.data;
  } catch (error) {
    return null;
  }
}

export default async function DoctorDashboard() {
  const data = await getData();

  const critical = data?.critical ?? {
    todaysAppointments: { count: 0, nextAt: null },
    activeSchedules: { count: 0, nextActiveDate: null },
    pendingHospitalApplications: { count: 0 },
  };

  const weekly = data?.weekly ?? {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    completedSeries: [0, 0, 0, 0, 0, 0, 0],
    canceledSeries: [0, 0, 0, 0, 0, 0, 0],
    completed: 0,
    canceled: 0,
    trend: 0,
  };

  const patientLoad = data?.patientLoad ?? {
    avgPerDay: 0,
    peakDay: "N/A",
    peakCount: 0,
  };
  const utilization = data?.utilization ?? { percent: 0, booked: 0, total: 0 };
  const recentActivities = data?.recentActivities ?? [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">
          Doctor Dashboard
        </h1>
        <div className="text-sm text-gray-500">Last updated: Feb 3, 2026</div>
      </div>

      {/* Section 1 - Critical Cards */}
      <CriticalCards
        today={critical.todaysAppointments}
        activeSchedules={critical.activeSchedules}
        pendingApplicationsCount={critical.pendingHospitalApplications.count}
      />

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
                  <div className="text-base font-medium text-gray-900">
                    {weekly.completed}
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="text-xs text-gray-500">Canceled</div>
                  <div className="text-base font-medium text-gray-900">
                    {weekly.canceled}
                  </div>
                </div>
                <div className="text-sm text-green-600 font-medium flex items-center gap-1">
                  {weekly.trend >= 0 ? "+" : ""}
                  {weekly.trend}% vs last week
                </div>
              </div>
            </div>

            <div className="mt-4">
              <WeeklyChart
                labels={weekly.labels}
                completedSeries={weekly.completedSeries}
                canceledSeries={weekly.canceledSeries}
              />
            </div>
          </div>

          <div className="md:col-span-1">
            <RightCards patientLoad={patientLoad} utilization={utilization} />
          </div>
        </div>
      </section>

      {/* Section 3 - Recent Activities */}
      <RecentActivities activities={recentActivities} />
    </div>
  );
}
