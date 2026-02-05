"use client";

import { useMemo, useState } from "react";
import ScheduleHeader from "./components/Header";
import StatusTabs from "./components/StatusTabs";
import FiltersPanel from "./components/FiltersPanel";
import ScheduleCard from "./components/ScheduleCard";
import type { Status } from "./components/StatusBadge";

type ScheduleType = "recurring" | "temporary" | "one_time";

type Period = "morning" | "afternoon" | "evening";

type Schedule = {
  id: string;
  hospital: string;
  type: ScheduleType;
  startDate: string; // YYYY-MM-DD
  endDate?: string;
  period: Period;
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: Status;
};

const MOCK_SCHEDULES: Schedule[] = [
  {
    id: "s1",
    hospital: "St. Mary General Hospital",
    type: "recurring",
    startDate: "2026-02-10",
    endDate: "2026-02-14",
    period: "morning",
    startTime: "08:00",
    endTime: "11:00",
    status: "approved",
  },
  {
    id: "s2",
    hospital: "Eastside Medical Center",
    type: "temporary",
    startDate: "2026-03-01",
    period: "afternoon",
    startTime: "13:00",
    endTime: "16:00",
    status: "approved",
  },
  {
    id: "s3",
    hospital: "St. Mary General Hospital",
    type: "one_time",
    startDate: "2026-03-05",
    period: "evening",
    startTime: "17:00",
    endTime: "20:00",
    status: "pending",
  },
  {
    id: "s4",
    hospital: "City Diagnostic Clinic",
    type: "recurring",
    startDate: "2026-04-10",
    period: "morning",
    startTime: "09:00",
    endTime: "11:30",
    status: "rejected",
  },
];

const STATUS_TABS: { key: "all" | Status; label: string }[] = [
  { key: "all", label: "All" },
  { key: "approved", label: "Approved" },
  { key: "pending", label: "Pending" },
  { key: "rejected", label: "Rejected" },
];

export default function DoctorSchedulePage() {
  const [activeTab, setActiveTab] = useState<"all" | Status>("approved");

  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Filters
  const [scheduleType, setScheduleType] = useState<ScheduleType | "">("");
  const [period, setPeriod] = useState<Period | "">("");
  const [hospital, setHospital] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [fromTime, setFromTime] = useState<string>("");
  const [toTime, setToTime] = useState<string>("");

  const hospitals = useMemo(() => {
    return Array.from(new Set(MOCK_SCHEDULES.map((s) => s.hospital)));
  }, []);

  function clearFilters() {
    setScheduleType("");
    setPeriod("");
    setHospital("");
    setFromDate("");
    setToDate("");
    setFromTime("");
    setToTime("");
  }

  function matchesFilters(s: Schedule) {
    if (scheduleType && s.type !== scheduleType) return false;
    if (period && s.period !== period) return false;
    if (hospital && s.hospital !== hospital) return false;

    // Date range filter (inclusive)
    if (fromDate) {
      if (s.endDate) {
        if (new Date(s.endDate) < new Date(fromDate)) return false;
      } else {
        if (new Date(s.startDate) < new Date(fromDate)) return false;
      }
    }
    if (toDate) {
      if (s.startDate > toDate) return false;
    }

    // Time range filter
    if (fromTime && s.endTime) {
      if (s.endTime < fromTime) return false;
    }
    if (toTime && s.startTime) {
      if (s.startTime > toTime) return false;
    }

    return true;
  }

  const filteredSchedules = useMemo(() => {
    return MOCK_SCHEDULES.filter((s) => {
      if (activeTab !== "all" && s.status !== activeTab) return false;
      return matchesFilters(s);
    }).sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [
    activeTab,
    scheduleType,
    period,
    hospital,
    fromDate,
    toDate,
    fromTime,
    toTime,
  ]);

  function onEdit(s: Schedule) {
    console.log("Edit schedule", s.id);
  }
  function onDeactivate(s: Schedule) {
    console.log("Deactivate schedule", s.id);
  }
  function onDelete(s: Schedule) {
    console.log("Delete schedule", s.id);
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <ScheduleHeader
        onApply={() => console.log("Apply for Schedule clicked")}
      />

      {/* Tabs */}
      <StatusTabs
        tabs={STATUS_TABS}
        active={activeTab}
        onChange={(k) => setActiveTab(k as any)}
      />

      {/* Filters */}
      <FiltersPanel
        period={period}
        setPeriod={(p) => setPeriod(p as any)}
        hospital={hospital}
        setHospital={setHospital}
        hospitals={hospitals}
        fromDate={fromDate}
        setFromDate={setFromDate}
        toDate={toDate}
        setToDate={setToDate}
        fromTime={fromTime}
        setFromTime={setFromTime}
        toTime={toTime}
        setToTime={setToTime}
        scheduleType={scheduleType}
        setScheduleType={(t) => setScheduleType(t as any)}
        clearFilters={clearFilters}
        showMobileToggle
        showMobile={showFiltersMobile}
        onToggleMobile={() => setShowFiltersMobile((s) => !s)}
      />

      {/* Schedules List */}
      <div>
        {filteredSchedules.length === 0 ? (
          <div className="text-center py-12 rounded-lg bg-gray-50 shadow-sm">
            <p className="text-gray-700 mb-4">
              No schedules found for the selected tab and filters.
            </p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:shadow-md transition"
              onClick={() =>
                console.log("Apply for Schedule clicked - empty state")
              }
            >
              Apply for Schedule
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSchedules.map((s) => (
              <ScheduleCard
                key={s.id}
                schedule={s}
                onEdit={(sch) => onEdit(sch)}
                onDeactivate={(sch) => onDeactivate(sch)}
                onDelete={(sch) => onDelete(sch)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
