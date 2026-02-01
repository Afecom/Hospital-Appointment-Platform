"use client";

import React, { useState, useMemo } from "react";
import Tabs from "@/components/shared/ui/Tabs";
import ScheduleCard from "@/components/schedule/ScheduleCard";
import ShimmerCard from "@/components/shared/ui/ShimmerCard";
import { scheduleApplicationSchedule } from "@hap/contract";
import { useQuery } from "@tanstack/react-query";
import { getSchedules, scheduleAction } from "@/actions/api";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { on } from "events";

const ScheduleListPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status");
  const expired = searchParams.get("expired") === "true";
  const deactivated = searchParams.get("deactivated") === "true";
  const [searchTerm, setSearchTerm] = useState("");
  const pathname = usePathname();
  const queryClient = useQueryClient();

  const queryStatus =
    expired || deactivated ? undefined : (statusParam ?? "approved");

  const activeTab =
    statusParam ??
    (expired ? "expired" : deactivated ? "deactivated" : "approved");

  const {
    data: schedules = [],
    isLoading,
    isError,
  } = useQuery<scheduleApplicationSchedule[]>({
    queryKey: ["schedules", queryStatus, expired, deactivated],
    queryFn: () => getSchedules(queryStatus, expired, deactivated),
  });

  const tabs = useMemo(
    () => [
      { label: "Active", value: "approved" },
      { label: "Pending", value: "pending" },
      { label: "Rejected", value: "rejected" },
      { label: "Expired", value: "expired" },
      { label: "Deactivated", value: "deactivated" },
    ],
    [],
  );

  const handleTabClick = (tab: string) => {
    if (tab === "approved" || tab === "pending" || tab === "rejected")
      router.push(`${pathname}?status=${tab}`);
    else if (tab === "expired") router.push(`${pathname}?expired=true`);
    else if (tab === "deactivated") router.push(`${pathname}?deactivated=true`);
  };

  const handleDelete = (id: string) =>
    console.log(`Soft deleting schedule ${id}`);
  const handleUndo = (id: string) =>
    scheduleAction(id, "undo")
      .then((res) => {
        queryClient.invalidateQueries({
          queryKey: ["schedules", queryStatus, expired, deactivated],
        });
        return res;
      })
      .catch((err) => {
        queryClient.invalidateQueries({
          queryKey: ["schedules", queryStatus, expired, deactivated],
        });
        throw err;
      });
  const handleApprove = (id: string) =>
    scheduleAction(id, "approve")
      .then((res) => {
        queryClient.invalidateQueries({
          queryKey: ["schedules", queryStatus, expired, deactivated],
        });
        return res;
      })
      .catch((err) => {
        queryClient.invalidateQueries({
          queryKey: ["schedules", queryStatus, expired, deactivated],
        });
        throw err;
      });
  const handleActivate = (id: string) =>
    scheduleAction(id, "activate")
      .then((res) => {
        queryClient.invalidateQueries({
          queryKey: ["schedules", queryStatus, expired, deactivated],
        });
        return res;
      })
      .catch((err) => {
        queryClient.invalidateQueries({
          queryKey: ["schedules", queryStatus, expired, deactivated],
        });
        throw err;
      });
  const handleReject = (id: string) =>
    scheduleAction(id, "reject")
      .then((res) => {
        queryClient.invalidateQueries({
          queryKey: ["schedules", queryStatus, expired, deactivated],
        });
        return res;
      })
      .catch((err) => {
        queryClient.invalidateQueries({
          queryKey: ["schedules", queryStatus, expired, deactivated],
        });
        throw err;
      });

  const filteredSchedules = schedules
    .filter((s) => {
      if (activeTab === "expired") return !!s.isExpired;
      if (activeTab === "deactivated") return !!s.isDeactivated;
      return s.status === activeTab;
    })
    .filter((s) => {
      if (!searchTerm) return true;
      const lower = searchTerm.toLowerCase();
      const startTime = s.startTime.split(" - ")[0] || "";
      return (
        s.Doctor.User.fullName.toLowerCase().includes(lower) ||
        startTime.toLowerCase().includes(lower)
      );
    });

  const labelMap = {
    approved: "Active",
    pending: "Pending",
    rejected: "Rejected",
    expired: "Expired",
    deactivated: "Deactivated",
  };

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

        <Tabs tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
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
                schedule.status === "approved" &&
                !schedule.isDeactivated &&
                !schedule.isExpired &&
                !schedule.isDeleted
                  ? [
                      {
                        key: `undo-${schedule.id}`,
                        label: "Undo",
                        onClick: async () => {
                          await handleUndo(schedule.id);
                        },
                        className:
                          "bg-yellow-500 hover:bg-yellow-600 hover:cursor-pointer",
                      },
                      {
                        key: `delete-${schedule.id}`,
                        label: "Delete",
                        onClick: async () => {
                          await handleDelete(schedule.id);
                        },
                        className:
                          "bg-red-600 hover:bg-red-800 hover:cursor-pointer",
                        requiresConfirmation: true,
                        confirmTitle: "Confirm Delete",
                        confirmMessage:
                          "Are you sure you want to delete this schedule?",
                      },
                    ]
                  : schedule.status === "rejected" &&
                      !schedule.isDeactivated &&
                      !schedule.isExpired &&
                      !schedule.isDeleted
                    ? [
                        {
                          key: `undo-${schedule.id}`,
                          label: "Undo",
                          onClick: async () => {
                            await handleUndo(schedule.id);
                          },
                          className:
                            "bg-yellow-500 hover:bg-yellow-600 hover:cursor-pointer",
                        },
                        {
                          key: `delete-${schedule.id}`,
                          label: "Delete",
                          onClick: async () => {
                            await handleDelete(schedule.id);
                          },
                          className:
                            "bg-red-600 hover:bg-red-800 hover:cursor-pointer",
                          requiresConfirmation: true,
                          confirmTitle: "Confirm Delete",
                          confirmMessage:
                            "Are you sure you want to delete this schedule?",
                        },
                      ]
                    : schedule.status === "pending" &&
                        !schedule.isDeactivated &&
                        !schedule.isExpired &&
                        !schedule.isDeleted
                      ? [
                          {
                            key: `approve-${schedule.id}`,
                            label: "Approve",
                            onClick: async () => {
                              await handleApprove(schedule.id);
                            },
                            className:
                              "bg-secondary hover:bg-blue-950 hover:cursor-pointer",
                          },
                          {
                            key: `reject-${schedule.id}`,
                            label: "Reject",
                            onClick: async () => {
                              await handleReject(schedule.id);
                            },
                            className:
                              "bg-red-600 hover:bg-red-800 hover:cursor-pointer",
                            requiresConfirmation: true,
                            confirmTitle: "Confirm Reject",
                            confirmMessage:
                              "Are you sure you want to reject this schedule?",
                          },
                        ]
                      : schedule.isDeactivated &&
                          !schedule.isExpired &&
                          !schedule.isDeleted
                        ? [
                            {
                              key: `activate-${schedule.id}`,
                              label: "Activate",
                              onClick: async () => {
                                await handleActivate(schedule.id);
                              },
                              className:
                                "bg-secondary hover:bg-blue-950 hover:cursor-pointer",
                            },
                            {
                              key: `delete-${schedule.id}`,
                              label: "Delete",
                              onClick: async () => {
                                await handleDelete(schedule.id);
                              },
                              className:
                                "bg-red-600 hover:bg-red-800 hover:cursor-pointer",
                              requiresConfirmation: true,
                              confirmTitle: "Confirm Delete",
                              confirmMessage:
                                "Are you sure you want to delete this schedule?",
                            },
                          ]
                        : [
                            {
                              key: `delete-${schedule.id}`,
                              label: "Delete",
                              onClick: async () => {
                                await handleDelete(schedule.id);
                              },
                              className:
                                "bg-red-600 hover:bg-red-800 hover:cursor-pointer",
                              requiresConfirmation: true,
                              confirmTitle: "Confirm Delete",
                              confirmMessage:
                                "Are you sure you want to delete this schedule?",
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
                No {labelMap[activeTab as keyof typeof labelMap] ?? activeTab}{" "}
                schedules at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleListPage;
