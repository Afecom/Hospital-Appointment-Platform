"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DoctorCard, { DoctorOperationalRow } from "./components/DoctorCard";
import DoctorDrawer from "./components/DoctorDrawer";
import DoctorTable, { DoctorSortKey } from "./components/DoctorTable";
import UtilizationChart from "./components/UtilizationChart";
import DoctorOperationalCardSkeleton from "./components/DoctorOperationalCardSkeleton";
import { compare, formatLongDate, SortDir, toISODateString } from "./utils";
import { fetchOperatorDoctorsOverview } from "@/actions/operatorDoctor";
import { OperatorDoctor } from "./types";

type StatusFilter = "ALL" | "ACTIVE" | "ON_LEAVE";
type AvailabilityFilter = "ALL" | "AVAILABLE" | "FULLY_BOOKED";

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center bg-white">
      <p className="text-sm font-medium text-gray-700">{title}</p>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

function SectionError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-medium text-red-700">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-3 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-red-600 hover:bg-red-700"
      >
        Retry
      </button>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-pulse">
      <div className="h-5 w-64 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-80 rounded bg-gray-100" />
      <div className="mt-6 h-56 rounded-xl bg-gray-100" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-pulse">
      <div className="h-5 w-56 rounded bg-gray-200" />
      <div className="mt-2 h-4 w-72 rounded bg-gray-100" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-10 rounded bg-gray-100" />
        ))}
      </div>
    </div>
  );
}

export default function HospitalOperatorDoctorPage() {
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    toISODateString(new Date()),
  );
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState<string>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [availability, setAvailability] = useState<AvailabilityFilter>("ALL");

  const [sortKey, setSortKey] = useState<DoctorSortKey>("utilizationPct");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);

  const [doctors, setDoctors] = useState<OperatorDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDoctors = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchOperatorDoctorsOverview(selectedDate);
      setDoctors(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load doctors data",
      );
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void loadDoctors();
  }, [loadDoctors]);

  useEffect(() => {
    if (!drawerOpen) return;
    if (!selectedDoctorId) setDrawerOpen(false);
  }, [drawerOpen, selectedDoctorId]);

  const specialties = useMemo(() => {
    const uniq = Array.from(new Set(doctors.map((d) => d.specialty))).sort(
      (a, b) => a.localeCompare(b),
    );
    return ["ALL", ...uniq];
  }, [doctors]);

  const baseRows = useMemo(() => {
    return doctors.map((doctor): DoctorOperationalRow => ({
      doctor,
      workingHoursLabel: doctor.selectedDate.workingHoursLabel,
      totalSlots: doctor.selectedDate.totalSlots,
      bookedSlots: doctor.selectedDate.bookedSlots,
      availableSlots: doctor.selectedDate.availableSlots,
      utilizationPct: doctor.selectedDate.utilizationPct,
      nextAvailableSlot: doctor.selectedDate.nextAvailableSlot,
      isDisabled: doctor.status === "ON_LEAVE",
    }));
  }, [doctors]);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return baseRows.filter((row) => {
      if (specialty !== "ALL" && row.doctor.specialty !== specialty)
        return false;
      if (status !== "ALL" && row.doctor.status !== status) return false;
      if (availability === "AVAILABLE" && row.availableSlots <= 0) return false;
      if (
        availability === "FULLY_BOOKED" &&
        (row.totalSlots === 0 || row.availableSlots > 0)
      ) {
        return false;
      }
      if (!q) return true;
      return (
        row.doctor.name.toLowerCase().includes(q) ||
        row.doctor.specialty.toLowerCase().includes(q)
      );
    });
  }, [availability, baseRows, search, specialty, status]);

  const sortedRows = useMemo(() => {
    const mul = sortDir === "asc" ? 1 : -1;
    const getPrimary = (r: DoctorOperationalRow) => {
      if (sortKey === "name") return r.doctor.name;
      if (sortKey === "availableSlots") return r.availableSlots;
      return r.utilizationPct;
    };

    return [...filteredRows].sort((a, b) => {
      const primary = mul * compare(getPrimary(a), getPrimary(b));
      if (primary !== 0) return primary;
      if (a.doctor.status !== b.doctor.status) {
        return a.doctor.status === "ACTIVE" ? -1 : 1;
      }
      const byAvail = compare(b.availableSlots, a.availableSlots);
      if (byAvail !== 0) return byAvail;
      return compare(a.doctor.name, b.doctor.name);
    });
  }, [filteredRows, sortDir, sortKey]);

  const selectedDoctor = useMemo(() => {
    if (!selectedDoctorId) return null;
    return doctors.find((d) => d.id === selectedDoctorId) ?? null;
  }, [doctors, selectedDoctorId]);

  const chartData = useMemo(() => {
    return sortedRows.map((r) => ({
      name: r.doctor.name.replace("Dr. ", ""),
      utilizationPct: r.doctor.status === "ON_LEAVE" ? 0 : r.utilizationPct,
      isOnLeave: r.doctor.status === "ON_LEAVE",
    }));
  }, [sortedRows]);

  const hasDoctors = doctors.length > 0;
  const hasRows = sortedRows.length > 0;
  const hasServerEmpty = !loading && !error && !hasDoctors;
  const hasFilteredEmpty = !loading && !error && hasDoctors && !hasRows;

  const openDoctor = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setDrawerOpen(true);
  };

  const toggleSort = (key: DoctorSortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir(key === "name" ? "asc" : "desc");
      return;
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"));
  };

  const resetFilters = () => {
    setSearch("");
    setSpecialty("ALL");
    setStatus("ALL");
    setAvailability("ALL");
    setSortKey("utilizationPct");
    setSortDir("desc");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8 w-full max-w-full overflow-x-hidden">
      <header className="mb-2">
        <h1 className="text-2xl font-semibold text-gray-800">Doctors</h1>
        <p className="text-sm text-gray-500 mt-1">
          Operational visibility for staffing, capacity, and appointment load -
          <span className="font-medium text-gray-700 ml-1">
            {formatLongDate(selectedDate)}
          </span>
        </p>
      </header>

      <section className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col gap-2 lg:gap-10 lg:flex-row lg:items-end lg:justify-between min-w-0">
          <div className="w-full lg:w-40 min-w-0">
            <label className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
            />
          </div>

          <div className="w-full flex flex-col gap-4 lg:flex-row lg:items-end min-w-0">
            <div className="w-full lg:w-60 min-w-0">
              <label className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name or specialty"
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              />
            </div>

            <div className="w-full lg:w-55 min-w-0">
              <label className="block text-sm font-medium text-gray-700">
                Specialty
              </label>
              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              >
                {specialties.map((s) => (
                  <option key={s} value={s}>
                    {s === "ALL" ? "All specialties" : s}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full lg:w-50 min-w-0">
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StatusFilter)}
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              >
                <option value="ALL">All</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="ON_LEAVE">ON_LEAVE</option>
              </select>
            </div>

            <div className="w-full lg:w-55 min-w-0">
              <label className="block text-sm font-medium text-gray-700">
                Availability
              </label>
              <select
                value={availability}
                onChange={(e) =>
                  setAvailability(e.target.value as AvailabilityFilter)
                }
                className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300"
              >
                <option value="ALL">All</option>
                <option value="AVAILABLE">Available</option>
                <option value="FULLY_BOOKED">Fully Booked</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center rounded-full bg-gray-50 ring-1 ring-gray-100 px-3 py-1">
            {sortedRows.length} doctor{sortedRows.length === 1 ? "" : "s"} shown
          </span>
          <span className="inline-flex items-center rounded-full bg-gray-50 ring-1 ring-gray-100 px-3 py-1">
            Sorting:
            <span className="ml-1 font-medium text-gray-700">{sortKey}</span> (
            {sortDir})
          </span>
        </div>
      </section>

      {error && <SectionError message={error} onRetry={() => void loadDoctors()} />}

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">
            Operational Snapshot
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Cards summarize workload and next available times for the selected
            date
          </p>
        </div>

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <DoctorOperationalCardSkeleton key={index} />
            ))}
          </div>
        )}

        {hasServerEmpty && (
          <EmptyState
            title="No doctors found for this hospital"
            description="This operator hospital has no doctor profiles yet."
          />
        )}

        {hasFilteredEmpty && (
          <EmptyState
            title="No doctors match current filters"
            description="Try resetting filters or changing search/date."
            action={
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Reset Filters
              </button>
            }
          />
        )}

        {!loading && !error && hasRows && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sortedRows.map((row) => (
              <DoctorCard
                key={row.doctor.id}
                row={row}
                onClick={() => openDoctor(row.doctor.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        {loading ? (
          <ChartSkeleton />
        ) : !error && hasRows ? (
          <UtilizationChart data={chartData} />
        ) : (
          <EmptyState
            title="No utilization chart data"
            description="Chart data appears when doctors are available for the selected filters/date."
          />
        )}
      </section>

      <section>
        {loading ? (
          <TableSkeleton />
        ) : !error && hasRows ? (
          <DoctorTable
            rows={sortedRows}
            sortKey={sortKey}
            sortDir={sortDir}
            onChangeSort={toggleSort}
            onViewDetails={(doctorId) => openDoctor(doctorId)}
          />
        ) : (
          <EmptyState
            title="No table data to display"
            description="Doctor operational rows appear once doctors are available."
          />
        )}
      </section>

      <DoctorDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        doctor={selectedDoctor}
        selectedDate={selectedDate}
      />
    </div>
  );
}
