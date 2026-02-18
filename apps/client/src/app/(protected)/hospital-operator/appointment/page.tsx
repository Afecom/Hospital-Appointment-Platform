"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import {
  fetchAppointments,
  getOverviewCounts,
  mockAppointments,
} from "./mockData";
import { doctors } from "../doctor/mockData";
import { toISODateString } from "./utils";
import AppointmentFilters from "./components/AppointmentFilters";
import AppointmentTable from "./components/AppointmentTable";
import AppointmentPagination from "./components/AppointmentPagination";
import OverviewKPI from "./components/OverviewKPI";
import BookingModal from "./components/BookingModal";
import RescheduleModal from "./components/RescheduleModal";
import RefundDialog from "./components/RefundDialog";
import type {
  Appointment,
  AppointmentStatus,
  BookingSource,
} from "./types";

export default function HospitalOperatorAppointmentPage() {
  const today = toISODateString(new Date());
  const [allAppointments, setAllAppointments] = useState<Appointment[]>(
    () => [...mockAppointments],
  );

  const [page, setPage] = useState(1);
  const limit = 10;
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "ALL">(
    "ALL",
  );
  const [sourceFilter, setSourceFilter] = useState<BookingSource | "ALL">(
    "ALL",
  );
  const [doctorFilter, setDoctorFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);

  const [result, setResult] = useState<{
    data: Appointment[];
    total: number;
    page: number;
    totalPages: number;
  }>({ data: [], total: 0, page: 1, totalPages: 1 });

  const [bookingOpen, setBookingOpen] = useState(false);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const filters = {
    status: statusFilter,
    source: sourceFilter,
    doctorId: doctorFilter,
    dateFrom,
    dateTo,
  };

  const loadData = useCallback(() => {
    fetchAppointments(
      {
        page,
        limit,
        filters,
        search,
      },
      allAppointments,
    ).then(setResult);
  }, [page, limit, filters, search, allAppointments]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const counts = getOverviewCounts(
    { filters: { ...filters, status: "ALL" }, search },
    allAppointments,
  );

  const handleBookingSuccess = (appointment: Appointment) => {
    setAllAppointments((prev) => [...prev, appointment]);
  };

  const handleRescheduleSuccess = (updated: Appointment) => {
    setAllAppointments((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a)),
    );
    setSelectedAppointment(null);
  };

  const handleRefundConfirm = (appointment: Appointment) => {
    const refunded: Appointment = {
      ...appointment,
      status: "REFUNDED",
      paymentStatus: "REFUNDED",
    };
    setAllAppointments((prev) =>
      prev.map((a) => (a.id === appointment.id ? refunded : a)),
    );
    setSelectedAppointment(null);
  };

  const handleApprove = (appointment: Appointment) => {
    const approved: Appointment = {
      ...appointment,
      status: "APPROVED",
    };
    setAllAppointments((prev) =>
      prev.map((a) => (a.id === appointment.id ? approved : a)),
    );
  };

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRescheduleOpen(true);
  };

  const handleRefund = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setRefundOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Appointments</h1>
          <p className="text-sm text-gray-500 mt-1">
            Operational command center — manage bookings, approvals, and
            reschedules
          </p>
        </div>
        <button
          type="button"
          onClick={() => setBookingOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors shrink-0"
        >
          <Plus className="w-5 h-5" />
          Book Appointment
        </button>
      </header>

      {/* Filters + Search */}
      <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <AppointmentFilters
          search={search}
          onSearchChange={setSearch}
          statusFilter={statusFilter}
          onStatusChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          sourceFilter={sourceFilter}
          onSourceChange={(v) => {
            setSourceFilter(v);
            setPage(1);
          }}
          doctorFilter={doctorFilter}
          onDoctorChange={(v) => {
            setDoctorFilter(v);
            setPage(1);
          }}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={(v) => {
            setDateFrom(v);
            setPage(1);
          }}
          onDateToChange={(v) => {
            setDateTo(v);
            setPage(1);
          }}
          doctors={doctors.map((d) => ({ id: d.id, name: d.name }))}
        />
      </section>

      {/* Overview KPI */}
      <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <OverviewKPI
          counts={counts}
          activeFilter={statusFilter}
          onFilter={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
        />
      </section>

      {/* Appointments Table */}
      <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <AppointmentTable
          appointments={result.data}
          todayDate={today}
          onApprove={handleApprove}
          onReschedule={handleReschedule}
          onRefund={handleRefund}
        />
      </section>

      {/* Pagination */}
      <section className="flex justify-center">
        <AppointmentPagination
          page={result.page}
          totalPages={result.totalPages}
          onPageChange={setPage}
        />
      </section>

      {/* Modals */}
      <BookingModal
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onSuccess={handleBookingSuccess}
        existingAppointments={allAppointments}
      />
      <RescheduleModal
        open={rescheduleOpen}
        onClose={() => {
          setRescheduleOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onSuccess={handleRescheduleSuccess}
        existingAppointments={allAppointments}
      />
      <RefundDialog
        open={refundOpen}
        onClose={() => {
          setRefundOpen(false);
          setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
        onConfirm={handleRefundConfirm}
      />
    </div>
  );
}
