"use client";

import { useEffect, useMemo, useState } from "react";
import DoctorCard, { DoctorOperationalRow } from "./components/DoctorCard";
import DoctorDrawer from "./components/DoctorDrawer";
import DoctorTable, { DoctorSortKey } from "./components/DoctorTable";
import UtilizationChart from "./components/UtilizationChart";
import {
  doctors,
  getDailyStats,
  getNextAvailableSlotForDoctorOnDate,
  getWorkingHoursForDate,
} from "./mockData";
import { compare, formatLongDate, SortDir, toISODateString } from "./utils";

type StatusFilter = "ALL" | "ACTIVE" | "ON_LEAVE";
type AvailabilityFilter = "ALL" | "AVAILABLE" | "FULLY_BOOKED";

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

  useEffect(() => {
    if (!drawerOpen) return;
    if (!selectedDoctorId) setDrawerOpen(false);
  }, [drawerOpen, selectedDoctorId]);

  const specialties = useMemo(() => {
    const uniq = Array.from(new Set(doctors.map((d) => d.specialty))).sort(
      (a, b) => a.localeCompare(b),
    );
    return ["ALL", ...uniq];
  }, []);

  const baseRows = useMemo(() => {
    return doctors.map((doctor): DoctorOperationalRow => {
      const wh = getWorkingHoursForDate(doctor, selectedDate);
      const workingHoursLabel =
        doctor.status === "ON_LEAVE"
          ? "On leave"
          : wh.isWorking && wh.start && wh.end
            ? `${wh.start}–${wh.end}`
            : "Off";

      const stats = getDailyStats(doctor, selectedDate);
      const availableSlots = Math.max(0, stats.totalSlots - stats.bookedSlots);
      const utilizationPct =
        stats.totalSlots === 0
          ? 0
          : Math.round((stats.bookedSlots / stats.totalSlots) * 100);
      const nextAvailableSlot = getNextAvailableSlotForDoctorOnDate(
        doctor,
        selectedDate,
      );

      const isDisabled = doctor.status === "ON_LEAVE";

      return {
        doctor,
        workingHoursLabel,
        totalSlots: stats.totalSlots,
        bookedSlots: stats.bookedSlots,
        availableSlots,
        utilizationPct,
        nextAvailableSlot,
        isDisabled,
      };
    });
  }, [selectedDate]);

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
      )
        return false;

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

      // Tie-breakers (consistent, operationally useful)
      if (a.doctor.status !== b.doctor.status)
        return a.doctor.status === "ACTIVE" ? -1 : 1;
      const byAvail = compare(b.availableSlots, a.availableSlots);
      if (byAvail !== 0) return byAvail;
      return compare(a.doctor.name, b.doctor.name);
    });
  }, [filteredRows, sortDir, sortKey]);

  const selectedDoctor = useMemo(() => {
    if (!selectedDoctorId) return null;
    return doctors.find((d) => d.id === selectedDoctorId) ?? null;
  }, [selectedDoctorId]);

  const chartData = useMemo(() => {
    return sortedRows.map((r) => ({
      name: r.doctor.name.replace("Dr. ", ""),
      utilizationPct: r.doctor.status === "ON_LEAVE" ? 0 : r.utilizationPct,
      isOnLeave: r.doctor.status === "ON_LEAVE",
    }));
  }, [sortedRows]);

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

  return (
    <div className="min-h-screen bg-gray-50 p-6 space-y-8 w-full max-w-full overflow-x-hidden">
      {/* Header */}
      <header className="mb-2">
        <h1 className="text-2xl font-semibold text-gray-800">Doctors</h1>
        <p className="text-sm text-gray-500 mt-1">
          Operational visibility for staffing, capacity, and appointment load —{" "}
          <span className="font-medium text-gray-700">
            {formatLongDate(selectedDate)}
          </span>
        </p>
      </header>

      {/* Controls Section */}
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
            Sorting:{" "}
            <span className="ml-1 font-medium text-gray-700">{sortKey}</span> (
            {sortDir})
          </span>
        </div>
      </section>

      {/* Doctor Summary Grid (Cards) */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {sortedRows.map((row) => (
            <DoctorCard
              key={row.doctor.id}
              row={row}
              onClick={() => openDoctor(row.doctor.id)}
            />
          ))}
        </div>
      </section>

      {/* Utilization Chart (Compact) */}
      <section>
        <UtilizationChart data={chartData} />
      </section>

      {/* Doctors Operational Table */}
      <section>
        <DoctorTable
          rows={sortedRows}
          sortKey={sortKey}
          sortDir={sortDir}
          onChangeSort={toggleSort}
          onViewDetails={(doctorId) => openDoctor(doctorId)}
        />
      </section>

      {/* Doctor Detail Drawer */}
      <DoctorDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        doctor={selectedDoctor}
        selectedDate={selectedDate}
      />
    </div>
  );
}
