"use client";

import ScheduleCard from "@/components/schedule/ScheduleCard";
import React from "react";
import { getScheduleForAdminRes } from "@hap/contract";
import { scheduleAction } from "@/actions/api";
import api from "@/lib/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ShimmerCard from "@/components/shared/ui/ShimmerCard";
import ErrorMessage from "@/components/shared/ui/ErrorMessage";

const getPendingSchedules = async () => {
  try {
    const res = await api.get<getScheduleForAdminRes>("/schedule");
    return res.data;
  } catch (error) {
    throw new Error("Failed to fetch schedules.");
  }
};

export default function ScheduleApplicationsPage() {
  const queryClient = useQueryClient();
  const {
    data: schedules,
    isLoading,
    isError,
    error,
  } = useQuery<getScheduleForAdminRes>({
    queryKey: ["schedule-applications"],
    queryFn: getPendingSchedules,
  });
  const schedulesData = schedules?.data.schedules || [];
  const handleApprove = (id: string) =>
    scheduleAction(id, "approve")
      .then((res) => {
        queryClient.invalidateQueries({ queryKey: ["schedule-applications"] });
        return res;
      })
      .catch((err) => {
        queryClient.invalidateQueries({ queryKey: ["schedule-applications"] });
        throw err;
      });
  const handleReject = (id: string) => {
    return scheduleAction(id, "reject")
      .then((res) => {
        queryClient.invalidateQueries({ queryKey: ["schedule-applications"] });
        return res;
      })
      .catch((err) => {
        queryClient.invalidateQueries({ queryKey: ["schedule-applications"] });
        throw err;
      });
  };

  return (
    <div className="p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-6">
          Pending Schedule Applications
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <ShimmerCard key={index} />
          ))
        ) : isError ? (
          <div className="col-span-full">
            <ErrorMessage message={error?.message || "An error occurred."} />
          </div>
        ) : schedulesData.length > 0 ? (
          schedulesData.map((schedule) => (
            <ScheduleCard
              key={schedule.id}
              schedule={schedule}
              actions={[
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
                  className: "bg-red-600 hover:bg-red-800 hover:cursor-pointer",
                  requiresConfirmation: true,
                  confirmTitle: "Confirm Reject",
                  confirmMessage:
                    "Are you sure you want to reject this schedule?",
                },
              ]}
            />
          ))
        ) : (
          <p className="text-center col-span-full">
            There are no pending schedule applications at the moment
          </p>
        )}
      </div>
    </div>
  );
}
