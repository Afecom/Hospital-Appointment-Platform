import ScheduleCard from "@/components/schedule/ScheduleCard";
import React from "react";
import { getScheduleForAdminRes } from "@hap/contract";
import { headers } from "next/headers";

const schedulesReq = async () => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const fetchOptions = {
    cache: "no-store" as RequestCache,
    headers: await headers(),
  };
  try {
    const res = await fetch(`${apiBaseUrl}/schedule`, fetchOptions);
    if (!res.ok) throw new Error("Failed to fetch schedules");
    const data: getScheduleForAdminRes = await res.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch schedules", error);
  }
};

const scheduleAction = async (
  scheduleId: string,
  action: "approve" | "reject",
) => {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const fetchOptions = {
    cache: "no-store" as RequestCache,
    headers: await headers(),
    method: "PATCH",
  };
  try {
    if (action === "reject") {
      const res = await fetch(
        `${apiBaseUrl}/schedule/reject/${scheduleId}`,
        fetchOptions,
      );
      if (!res.ok) throw new Error("Failed to reject schedule");
    } else if (action === "approve") {
      const res = await fetch(
        `${apiBaseUrl}/schedule/approve/${scheduleId}`,
        fetchOptions,
      );
      if (!res.ok) throw new Error("Failed to approve schedule");
    } else throw new Error("Invalid action");
  } catch (error) {
    throw new Error(`Failed to ${action} schedule`);
  }
};

export default async function ScheduleApplicationsPage() {
  const schedules = await schedulesReq();
  const schedulesData = schedules?.data.schedules || [];
  return (
    <div className="p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-6">
          Pending Schedule Applications
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schedulesData.length > 0 ? (
          schedulesData.map((schedule) => (
            <ScheduleCard key={schedule.id} schedule={schedule} />
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
