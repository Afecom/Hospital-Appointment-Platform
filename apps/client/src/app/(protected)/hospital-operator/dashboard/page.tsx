"use client";

import { useEffect, useState } from "react";
import KPISection from "./components/KPISection";
import AppointmentsTable from "./components/AppointmentsTable";
import ChartsSection from "./components/ChartsSection";
import TimelineSection from "./components/TimelineSection";
import ActivityLogSection from "./components/ActivityLogSection";
import SectionCard from "./components/SectionCard";
import ApproveModal from "./components/ApproveModal";
import ViewModal from "./components/ViewModal";
import KPISectionSkeleton from "./components/KPISectionSkeleton";
import AppointmentsTableSkeleton from "./components/AppointmentsTableSkeleton";
import {
  fetchOperatorAppointments,
  fetchOperatorKPIs,
  type KPIData,
} from "@/actions/appointment";
import type { PendingAppointment } from "./mockData";
import {
  statusChartData,
  doctorChartData,
  timelineData,
  activityLog,
} from "./mockData";

export default function HospitalOperatorDashboardPage() {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [pendingAppointments, setPendingAppointments] = useState<
    PendingAppointment[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<PendingAppointment | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [kpisData, appointmentsData] = await Promise.all([
          fetchOperatorKPIs(),
          fetchOperatorAppointments({
            page: 1,
            limit: 20,
            filters: { status: "PENDING" },
          }),
        ]);
        setKpis(kpisData);
        setPendingAppointments(appointmentsData.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleApprove = (appointment: PendingAppointment) => {
    setSelectedAppointment(appointment);
    setApproveModalOpen(true);
  };

  const handleApproveSuccess = (updated: PendingAppointment) => {
    setPendingAppointments((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a)),
    );
    setApproveModalOpen(false);
    setSelectedAppointment(null);
    // Refresh KPIs
    fetchOperatorKPIs().then(setKpis).catch(console.error);
  };

  const handleView = (appointment: PendingAppointment) => {
    setSelectedAppointment(appointment);
    setViewModalOpen(true);
  };

  const handleReschedule = (appointment: PendingAppointment) => {
    // Navigate to appointment page with reschedule modal open
    window.location.href = `/hospital-operator/appointment?reschedule=${appointment.id}`;
  };

  const handleRefund = (appointment: PendingAppointment) => {
    // Navigate to appointment page with refund modal open
    window.location.href = `/hospital-operator/appointment?refund=${appointment.id}`;
  };

  if (loading) {
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

        {/* KPI Skeleton */}
        <section aria-labelledby="kpi-overview">
          <KPISectionSkeleton />
        </section>

        {/* Appointments Table Skeleton */}
        <section aria-labelledby="appointments-review">
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Needs Review
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Loading appointments...
              </p>
            </div>
            <AppointmentsTableSkeleton />
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

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
      {kpis && (
        <section aria-labelledby="kpi-overview">
          <KPISection data={kpis} />
        </section>
      )}

      {/* Section 2 - Appointments Requiring Action */}
      <section aria-labelledby="appointments-review">
        <SectionCard
          title="Needs Review"
          subtitle={`${pendingAppointments.length} appointments require your attention`}
        >
          <AppointmentsTable
            appointments={pendingAppointments}
            onApprove={handleApprove}
            onReschedule={handleReschedule}
            onRefund={handleRefund}
            onView={handleView}
          />
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

      {/* Modals */}
      <ApproveModal
        open={approveModalOpen}
        onClose={() => {
          setApproveModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onSuccess={handleApproveSuccess}
      />
      <ViewModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
      />
    </div>
  );
}
