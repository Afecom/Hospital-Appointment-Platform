import KPISection from "./components/KPISection";
import AppointmentsTable from "./components/AppointmentsTable";
import ChartsSection from "./components/ChartsSection";
import TimelineSection from "./components/TimelineSection";
import ActivityLogSection from "./components/ActivityLogSection";
import SectionCard from "./components/SectionCard";
import {
  kpis,
  pendingAppointments,
  statusChartData,
  doctorChartData,
  timelineData,
  activityLog,
} from "./mockData";

export default function HospitalOperatorDashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          Hospital Operator Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Monitor and manage appointments efficiently
        </p>
      </div>

      {/* Section 1 - KPI Overview Cards */}
      <section aria-labelledby="kpi-overview">
        <KPISection data={kpis} />
      </section>

      {/* Section 2 - Appointments Requiring Action */}
      <section aria-labelledby="appointments-review">
        <SectionCard
          title="Needs Review"
          subtitle={`${pendingAppointments.length} appointments require your attention`}
        >
          <AppointmentsTable appointments={pendingAppointments} />
        </SectionCard>
      </section>

      {/* Section 3 - Today's Appointments Overview (Charts) */}
      <section aria-labelledby="appointments-overview">
        <ChartsSection
          statusData={statusChartData}
          doctorData={doctorChartData}
        />
      </section>

      {/* Section 4 - Today's Timeline */}
      <section aria-labelledby="today-timeline">
        <div className="mb-4">
          <h2
            id="today-timeline"
            className="text-lg font-semibold text-gray-800"
          >
            Today's Timeline
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Operational view of today's appointments by doctor
          </p>
        </div>
        <TimelineSection timelineData={timelineData} />
      </section>

      {/* Section 5 - Recent Activity Log */}
      <section aria-labelledby="activity-log">
        <ActivityLogSection activities={activityLog} />
      </section>
    </div>
  );
}
