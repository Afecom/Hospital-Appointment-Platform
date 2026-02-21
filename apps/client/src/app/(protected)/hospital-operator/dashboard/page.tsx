"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import ChartsSectionSkeleton from "./components/ChartsSectionSkeleton";
import TimelineSectionSkeleton from "./components/TimelineSectionSkeleton";
import ActivityLogSectionSkeleton from "./components/ActivityLogSectionSkeleton";
import {
  fetchOperatorDashboard,
  fetchOperatorAppointments,
  type OperatorDashboardData,
} from "@/actions/appointment";
import type { PendingAppointment } from "./types";

function SectionError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-700">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700"
        >
          Retry
        </button>
      )}
    </div>
  );
}

function SectionEmpty({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center bg-white">
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
  );
}

export default function HospitalOperatorDashboardPage() {
  const [dashboardData, setDashboardData] = useState<OperatorDashboardData | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState<string | null>(null);

  const [pendingAppointments, setPendingAppointments] = useState<
    PendingAppointment[]
  >([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<PendingAppointment | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      setDashboardLoading(true);
      setDashboardError(null);
      const data = await fetchOperatorDashboard();
      setDashboardData(data);
    } catch (err) {
      setDashboardError(
        err instanceof Error ? err.message : "Failed to load dashboard data",
      );
    } finally {
      setDashboardLoading(false);
    }
  }, []);

  const loadPendingAppointments = useCallback(async () => {
    try {
      setReviewLoading(true);
      setReviewError(null);
      const appointmentsData = await fetchOperatorAppointments({
        page: 1,
        limit: 20,
        filters: { status: "PENDING" },
      });
      setPendingAppointments(appointmentsData.data as PendingAppointment[]);
    } catch (err) {
      setReviewError(
        err instanceof Error ? err.message : "Failed to load review appointments",
      );
    } finally {
      setReviewLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
    void loadPendingAppointments();
  }, [loadDashboard, loadPendingAppointments]);

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
    void loadDashboard();
    void loadPendingAppointments();
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

  const hasChartsData = useMemo(() => {
    if (!dashboardData) return false;
    return (
      dashboardData.statusChartData.some((item) => item.value > 0) ||
      dashboardData.doctorChartData.some((item) => item.appointments > 0)
    );
  }, [dashboardData]);

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
        {dashboardLoading && <KPISectionSkeleton />}
        {!dashboardLoading && dashboardError && (
          <SectionError
            message={`Failed to load KPI metrics: ${dashboardError}`}
            onRetry={() => void loadDashboard()}
          />
        )}
        {!dashboardLoading && !dashboardError && dashboardData && (
          <KPISection data={dashboardData.kpis} trends={dashboardData.kpiTrends} />
        )}
        {!dashboardLoading && !dashboardError && !dashboardData && (
          <SectionEmpty
            title="No KPI data available"
            description="KPI metrics will appear here once appointments are available."
          />
        )}
      </section>

      {/* Section 2 - Appointments Requiring Action */}
      <section aria-labelledby="appointments-review">
        <SectionCard
          title="Needs Review"
          subtitle={`${pendingAppointments.length} appointments require your attention`}
        >
          {reviewLoading && <AppointmentsTableSkeleton />}
          {!reviewLoading && reviewError && (
            <SectionError
              message={`Failed to load review queue: ${reviewError}`}
              onRetry={() => void loadPendingAppointments()}
            />
          )}
          {!reviewLoading && !reviewError && (
            <AppointmentsTable
              appointments={pendingAppointments}
              onApprove={handleApprove}
              onReschedule={handleReschedule}
              onRefund={handleRefund}
              onView={handleView}
            />
          )}
        </SectionCard>
      </section>

      {/* Section 3 - Today's Appointments Overview (Charts) */}
      <section aria-labelledby="appointments-overview">
        {dashboardLoading && <ChartsSectionSkeleton />}
        {!dashboardLoading && dashboardError && (
          <SectionError
            message={`Failed to load chart data: ${dashboardError}`}
            onRetry={() => void loadDashboard()}
          />
        )}
        {!dashboardLoading && !dashboardError && dashboardData && hasChartsData && (
          <ChartsSection
            statusData={dashboardData.statusChartData}
            doctorData={dashboardData.doctorChartData}
          />
        )}
        {!dashboardLoading && !dashboardError && dashboardData && !hasChartsData && (
          <SectionEmpty
            title="No chart data for today"
            description="Appointments by status and doctor will appear once bookings are available."
          />
        )}
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
        {dashboardLoading && <TimelineSectionSkeleton />}
        {!dashboardLoading && dashboardError && (
          <SectionError
            message={`Failed to load timeline: ${dashboardError}`}
            onRetry={() => void loadDashboard()}
          />
        )}
        {!dashboardLoading &&
          !dashboardError &&
          dashboardData &&
          dashboardData.timelineData.length > 0 && (
            <TimelineSection timelineData={dashboardData.timelineData} />
          )}
        {!dashboardLoading &&
          !dashboardError &&
          dashboardData &&
          dashboardData.timelineData.length === 0 && (
            <SectionEmpty
              title="No timeline items for today"
              description="Doctor timelines populate when appointments are scheduled for today."
            />
          )}
      </section>

      {/* Section 5 - Recent Activity Log */}
      <section aria-labelledby="activity-log">
        {dashboardLoading && <ActivityLogSectionSkeleton />}
        {!dashboardLoading && dashboardError && (
          <SectionError
            message={`Failed to load activity log: ${dashboardError}`}
            onRetry={() => void loadDashboard()}
          />
        )}
        {!dashboardLoading &&
          !dashboardError &&
          dashboardData &&
          dashboardData.activityLog.length > 0 && (
            <ActivityLogSection activities={dashboardData.activityLog} />
          )}
        {!dashboardLoading &&
          !dashboardError &&
          dashboardData &&
          dashboardData.activityLog.length === 0 && (
            <SectionEmpty
              title="No recent operator activity"
              description="Approvals, reschedules, and refunds will show up here."
            />
          )}
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
