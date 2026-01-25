"use client";

import React, { useState, useMemo } from "react";
import Tabs from "@/components/shared/ui/Tabs";
import ScheduleCard from "@/components/schedule/ScheduleCard";
import ShimmerCard from "@/components/shared/ui/ShimmerCard";
import { scheduleApplicationSchedule } from "@hap/contract";
import { useQuery } from "@tanstack/react-query";
import { getSchedules } from "@/actions/api";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const ScheduleListPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams.get("status") || "approved";
  const [searchTerm, setSearchTerm] = useState("");
  const pathname = usePathname();

  const {
    data: schedules = [],
    isLoading,
    isError,
  } = useQuery<scheduleApplicationSchedule[]>({
    queryKey: ["schedules", status],
    queryFn: () => getSchedules(status),
  });

  const tabs = useMemo(
    () => [
      { label: "Active", value: "approved" },
      { label: "Pending", value: "pending" },
      { label: "Rejected", value: "rejected" },
    ],
    [],
  );

  const handleTabClick = (tab: string) => {
    router.push(`${pathname}?status=${tab}`);
  };

  // Button handlers (for now, they just log to the console)
  const handleDelete = (id: string) =>
    console.log(`Soft deleting schedule ${id}`);
  const handleUndo = (id: string) =>
    console.log(`Undoing rejection for schedule ${id}`);
  const handleApprove = (id: string) => console.log(`Approving schedule ${id}`);
  const handleReject = (id: string) => console.log(`Rejecting schedule ${id}`);

  const filteredSchedules = schedules
    .filter((s) => s.status === status)
    .filter((s) => {
      if (!searchTerm) return true;
      const lower = searchTerm.toLowerCase();
      const startTime = s.startTime.split(" - ")[0] || "";
      return (
        s.Doctor.User.fullName.toLowerCase().includes(lower) ||
        startTime.toLowerCase().includes(lower)
      );
    });

  return (
    <div className="h-full w-full flex flex-col p-4">
      <div className="max-w-6xl w-full">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Manage Schedules
            </h1>
            <p className="text-lg text-gray-600">
              Review and manage doctor schedules.
            </p>
          </div>

          <div className="w-60">
            <input
              type="text"
              placeholder="Search by doctor or start time"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm p-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
        </div>

        <Tabs tabs={tabs} activeTab={status} onTabClick={handleTabClick} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <ShimmerCard key={i} />)
          ) : isError ? (
            <div className="col-span-full text-center">
              <p className="text-lg text-red-600">Failed to load schedules.</p>
            </div>
          ) : filteredSchedules.length > 0 ? (
            filteredSchedules.map((schedule) => {
              const actions =
                schedule.status === "active"
                  ? [
                      {
                        key: `delete-${schedule.id}`,
                        label: "Delete",
                        onClick: () => handleDelete(schedule.id),
                        className: "bg-red-600 hover:bg-red-800",
                        requiresConfirmation: true,
                        confirmTitle: "Confirm Delete",
                        confirmMessage:
                          "Are you sure you want to delete this schedule?",
                      },
                    ]
                  : schedule.status === "rejected"
                    ? [
                        {
                          key: `undo-${schedule.id}`,
                          label: "Undo",
                          onClick: () => handleUndo(schedule.id),
                          className: "bg-yellow-500 hover:bg-yellow-600",
                        },
                        {
                          key: `delete-${schedule.id}`,
                          label: "Delete",
                          onClick: () => handleDelete(schedule.id),
                          className: "bg-red-600 hover:bg-red-800",
                          requiresConfirmation: true,
                          confirmTitle: "Confirm Delete",
                          confirmMessage:
                            "Are you sure you want to delete this schedule?",
                        },
                      ]
                    : [
                        {
                          key: `approve-${schedule.id}`,
                          label: "Approve",
                          onClick: () => handleApprove(schedule.id),
                          className: "bg-secondary hover:bg-blue-950",
                        },
                        {
                          key: `reject-${schedule.id}`,
                          label: "Reject",
                          onClick: () => handleReject(schedule.id),
                          className: "bg-red-600 hover:bg-red-800",
                          requiresConfirmation: true,
                          confirmTitle: "Confirm Reject",
                          confirmMessage:
                            "Are you sure you want to reject this schedule?",
                        },
                      ];

              return (
                <ScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  actions={actions}
                />
              );
            })
          ) : (
            <div className="col-span-full text-center">
              <p className="text-lg text-gray-600">
                No {status} schedules at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleListPage;
