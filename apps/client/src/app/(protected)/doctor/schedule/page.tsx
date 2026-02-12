"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import ScheduleHeader from "./components/Header";
import ScheduleModal from "./components/ScheduleModal";
import StatusTabs from "./components/StatusTabs";
import FiltersPanel from "./components/FiltersPanel";
import ScheduleCard from "./components/ScheduleCard";
import type { Status } from "./components/StatusBadge";
import api from "@/lib/axios";
import { doctorHospital } from "@hap/contract";

type ScheduleType = "recurring" | "temporary" | "one_time";

type Period = "morning" | "afternoon" | "evening";

type Schedule = {
  id: string;
  hospital: string;
  name?: string;
  dayOfWeek?: number[];
  isDeactivated?: boolean;
  isExpired?: boolean;
  isDeleted?: boolean;
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

const STATUS_TABS: { key: string; label: string }[] = [
  { key: "all", label: "All" },
  { key: "approved", label: "Approved" },
  { key: "pending", label: "Pending" },
  { key: "rejected", label: "Rejected" },
  { key: "deactivated", label: "Deactivated" },
  { key: "expired", label: "Expired" },
];

export default function DoctorSchedulePage() {
  const { data: doctorHospitalData } = useQuery({
    queryKey: ["doctorhospital"],
    queryFn: async () => {
      try {
        const res = await api.get<doctorHospital>("/hospital/doctor");
        return res.data ?? { data: [] };
      } catch (error) {
        return { data: [] };
      }
    },
  });
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize active tab from query param `status`
  const initialStatus = (() => {
    if (searchParams?.get("deactivated") === "true") return "deactivated";
    if (searchParams?.get("expired") === "true") return "expired";
    return (searchParams?.get("status") as any) ?? "all";
  })();
  type ActiveTab = "all" | Status | "deactivated" | string;
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    (initialStatus as any) || "all",
  );

  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Filters
  const [scheduleType, setScheduleType] = useState<ScheduleType | "">("");
  const [period, setPeriod] = useState<Period | "">("");
  const [hospital, setHospital] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [fromTime, setFromTime] = useState<string>("");
  const [toTime, setToTime] = useState<string>("");

  // Extract hospitals array from API response
  const hospitals = useMemo(() => {
    if (doctorHospitalData && Array.isArray(doctorHospitalData.data)) {
      return doctorHospitalData.data;
    }
    return [];
  }, [doctorHospitalData]);

  // Sync activeTab when the URL changes (e.g., back/forward)
  useEffect(() => {
    const status = (() => {
      if (searchParams?.get("deactivated") === "true") return "deactivated";
      if (searchParams?.get("expired") === "true") return "expired";
      return (searchParams?.get("status") as any) ?? "all";
    })();
    if (status !== activeTab) setActiveTab(status as any);
  }, [searchParams]);

  function handleTabChange(k: string) {
    setActiveTab(k as any);
    const sp = new URLSearchParams(searchParams?.toString() ?? "");
    // clear flags
    sp.delete("status");
    sp.delete("deactivated");
    sp.delete("expired");
    if (k === "all") {
      // nothing to set
    } else if (k === "deactivated") {
      sp.set("deactivated", "true");
    } else if (k === "expired") {
      sp.set("expired", "true");
    } else {
      sp.set("status", k as string);
    }
    const q = sp.toString();
    router.replace(`${pathname}${q ? `?${q}` : ""}`);
  }

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

  // Fetch schedules from API using current filters (server-side filtering when possible)
  const { data: schedulesRes, isLoading: schedulesLoading } = useQuery({
    queryKey: [
      "doctorSchedules",
      activeTab,
      scheduleType,
      hospital,
      fromDate,
      toDate,
    ],
    queryFn: async () => {
      const params: any = {};
      if (
        activeTab &&
        activeTab !== "all" &&
        activeTab !== "deactivated" &&
        activeTab !== "expired"
      )
        params.status = activeTab;
      if (activeTab === "deactivated") params.deactivated = true;
      if (activeTab === "expired") params.expired = true;
      if (scheduleType) params.type = scheduleType;
      // map hospital name (from UI) to hospitalId if possible
      if (hospital) {
        const h = hospitals.find((x: any) => x.Hospital?.name === hospital);
        if (h) params.hospitalId = h.Hospital.id;
      }
      if (fromDate) params.startDate = fromDate;
      if (toDate) params.endDate = toDate;
      const res = await api.get("/schedule/doctor", { params });
      return res.data;
    },
  });

  // Normalize API response to local Schedule[] shape and apply remaining client-side filters
  const apiSchedules: any[] =
    schedulesRes?.data?.schedules ??
    schedulesRes?.schedules ??
    schedulesRes?.data ??
    schedulesRes ??
    [];

  const mappedSchedules: Schedule[] = (apiSchedules || []).map((s: any) => {
    const hospitalName =
      s.Hospital?.name ||
      hospitals.find((h: any) => h.Hospital?.id === s.hospitalId)?.Hospital
        ?.name ||
      s.hospitalName ||
      "";
    return {
      id: s.id,
      name: s.name ?? s.title ?? "",
      hospital: hospitalName,
      type: s.type as ScheduleType,
      startDate: s.startDate,
      endDate: s.endDate,
      period: (s.period as Period) ?? (s.name ? "morning" : "morning"),
      startTime: s.startTime ?? "",
      endTime: s.endTime ?? "",
      isDeactivated: !!s.isDeactivated,
      isExpired: !!s.isExpired,
      isDeleted: !!s.isDeleted,
      dayOfWeek: s.dayOfWeek ?? s.DayOfWeek ?? [],
      status: s.status as Status,
    };
  });
  const queryClient = useQueryClient();

  const filteredSchedules = useMemo(() => {
    return mappedSchedules
      .filter((s: any) => {
        // Deactivated tab shows only deactivated schedules
        if (activeTab === "deactivated") return !!s.isDeactivated;
        // Expired tab shows only expired schedules
        if (activeTab === "expired") return !!s.isExpired;

        // For other tabs, exclude deleted, expired or deactivated schedules
        if (s.isDeleted || s.isExpired || s.isDeactivated) return false;

        // Apply status filter if not `all`
        if (activeTab !== "all" && activeTab !== undefined) {
          if (s.status !== activeTab) return false;
        }

        return matchesFilters(s);
      })
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [
    mappedSchedules,
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
    // No-op here; edit handled by EditScheduleModal -> page onSave handler
    console.log("Edit schedule", s.id);
  }
  function onDeactivate(s: Schedule) {
    // toggle deactivate -> handled in action handler below
    console.log("Deactivate schedule", s.id);
  }
  function onDelete(s: Schedule) {
    console.log("Delete schedule", s.id);
  }

  async function handleScheduleAction(id: string, action: string) {
    try {
      if (action === "approve" || action === "reject") {
        await api.patch(`/schedule/${action}/${id}`);
      } else {
        await api.patch(`/schedule/${id}`, { action });
      }
      await queryClient.invalidateQueries({ queryKey: ["doctorSchedules"] });
    } catch (err) {
      console.error("Schedule action failed", err);
      throw err;
    }
  }

  async function handleUpdateSchedule(id: string, payload: any) {
    try {
      // ensure hospitalId is not sent
      const { hospitalId, ...rest } = payload;
      await api.patch(`/schedule/update/${id}`, rest);
      await queryClient.invalidateQueries({ queryKey: ["doctorSchedules"] });
    } catch (err) {
      console.error("Failed to update schedule", err);
      throw err;
    }
  }

  const [showEmptyModal, setShowEmptyModal] = useState(false);

  return (
    <div className="p-6">
      {/* Header */}
      <ScheduleHeader
        onApply={() => console.log("Apply for Schedule clicked")}
        hospitals={hospitals}
      />

      {/* Tabs */}
      <StatusTabs
        tabs={STATUS_TABS}
        active={activeTab}
        onChange={(k) => handleTabChange(k as any)}
      />

      {/* Filters */}
      <FiltersPanel
        period={period}
        setPeriod={(p) => setPeriod(p as any)}
        hospital={hospital}
        setHospital={setHospital}
        hospitals={hospitals.map((h: any) => h.Hospital.name)}
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
        {schedulesLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="rounded-lg bg-white shadow-sm p-4 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
                <div className="flex items-center gap-2 mt-3">
                  <div className="h-8 w-24 bg-gray-200 rounded" />
                  <div className="h-8 w-16 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredSchedules.length === 0 ? (
          <div className="text-center py-12 rounded-lg bg-gray-50 shadow-sm">
            <p className="text-gray-700 mb-4">
              No schedules found for the selected tab and filters.
            </p>
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:shadow-md transition transform duration-150 ease-in-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-blue-100 focus:outline-none"
              onClick={() => setShowEmptyModal(true)}
            >
              Apply for Schedule
            </button>
            {showEmptyModal && (
              <ScheduleModal
                hospitals={hospitals}
                initialHospitalId={
                  // If the current `hospital` filter is a name, try to find the matching id
                  (hospitals.find((h: any) => h.Hospital.name === hospital)
                    ?.Hospital.id as string) ??
                  hospitals[0]?.Hospital.id ??
                  ""
                }
                onClose={() => setShowEmptyModal(false)}
                onApply={(payload) => {
                  console.log("Apply payload (empty state):", payload);
                  setShowEmptyModal(false);
                }}
              />
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {filteredSchedules.map((s) => (
              <ScheduleCard
                key={s.id}
                schedule={s}
                onEdit={async (updated) => {
                  // updated contains full schedule object; send normalized payload
                  const payload: any = {
                    type: updated.type,
                    name: updated.name,
                    period: updated.period,
                    dayOfWeek: updated.dayOfWeek,
                    startDate: updated.startDate,
                    endDate: updated.endDate,
                    startTime: updated.startTime,
                    endTime: updated.endTime,
                  };
                  await handleUpdateSchedule(s.id, payload);
                }}
                onDeactivate={async (sch) => {
                  // if deactivated -> activate, else deactivate
                  const action = sch.isDeactivated ? "activate" : "deactivate";
                  await handleScheduleAction(s.id, action);
                }}
                onDelete={async (sch) => {
                  await handleScheduleAction(s.id, "delete");
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
