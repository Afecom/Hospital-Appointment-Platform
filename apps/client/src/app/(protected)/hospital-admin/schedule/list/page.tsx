"use client";

import React, { useState, useMemo } from "react";
import Tabs from "@/components/shared/ui/Tabs";
import ScheduleCard from "@/components/schedule/ScheduleCard";
import { scheduleApplicationSchedule } from "@hap/contract";

// Mock data for schedules
const mockSchedules = [
  {
    id: "1",
    doctorName: "Dr. Smith",
    specialization: "Cardiology",
    date: "2026-02-10",
    time: "10:00 - 11:00",
    status: "active",
  },
  {
    id: "2",
    doctorName: "Dr. Jones",
    specialization: "Neurology",
    date: "2026-02-11",
    time: "14:00 - 15:00",
    status: "active",
  },
  {
    id: "3",
    doctorName: "Dr. Brown",
    specialization: "Pediatrics",
    date: "2026-02-12",
    time: "09:00 - 10:00",
    status: "pending",
  },
  {
    id: "4",
    doctorName: "Dr. White",
    specialization: "Dermatology",
    date: "2026-02-13",
    time: "11:00 - 12:00",
    status: "pending",
  },
  {
    id: "5",
    doctorName: "Dr. Green",
    specialization: "Oncology",
    date: "2026-02-14",
    time: "16:00 - 17:00",
    status: "rejected",
  },
  {
    id: "6",
    doctorName: "Dr. Black",
    specialization: "Psychiatry",
    date: "2026-02-15",
    time: "13:00 - 14:00",
    status: "rejected",
  },
];

type ScheduleStatus = "active" | "pending" | "rejected";

const ScheduleListPage = () => {
  const [activeTab, setActiveTab] = useState<ScheduleStatus>("active");
  const [searchTerm, setSearchTerm] = useState("");

  const tabs = useMemo(
    () => [
      { label: "Active", value: "active" },
      { label: "Pending", value: "pending" },
      { label: "Rejected", value: "rejected" },
    ],
    [],
  );

  const handleTabClick = (tab: string) => {
    setActiveTab(tab as ScheduleStatus);
  };

  // Button handlers (for now, they just log to the console)
  const handleDelete = (id: string) =>
    console.log(`Soft deleting schedule ${id}`);
  const handleUndo = (id: string) =>
    console.log(`Undoing rejection for schedule ${id}`);
  const handleApprove = (id: string) => console.log(`Approving schedule ${id}`);
  const handleReject = (id: string) => console.log(`Rejecting schedule ${id}`);

  const filteredSchedules = mockSchedules
    .filter((s) => s.status === activeTab)
    .filter((s) => {
      if (!searchTerm) return true;
      const lower = searchTerm.toLowerCase();
      const startTime = s.time.split(" - ")[0] || "";
      return (
        s.doctorName.toLowerCase().includes(lower) ||
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

        <Tabs tabs={tabs} activeTab={activeTab} onTabClick={handleTabClick} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((s) => {
              const [startTime, endTime] = s.time.split(" - ");

              const scheduleObj: scheduleApplicationSchedule = {
                name: s.doctorName,
                Doctor: {
                  id: s.id,
                  User: {
                    fullName: s.doctorName,
                    phoneNumber: "1234567890",
                  },
                },
                id: s.id,
                startDate: s.date,
                endDate: s.date,
                startTime,
                endTime,
                status: s.status,
                period: "",
                type: "one-time",
                dayOfWeek: [3, 4],
              };

              const actions =
                s.status === "active"
                  ? [
                      {
                        key: `delete-${s.id}`,
                        label: "Delete",
                        onClick: () => handleDelete(s.id),
                        className: "bg-red-600 hover:bg-red-800",
                        requiresConfirmation: true,
                        confirmTitle: "Confirm Delete",
                        confirmMessage:
                          "Are you sure you want to delete this schedule?",
                      },
                    ]
                  : s.status === "rejected"
                    ? [
                        {
                          key: `undo-${s.id}`,
                          label: "Undo",
                          onClick: () => handleUndo(s.id),
                          className: "bg-yellow-500 hover:bg-yellow-600",
                        },
                        {
                          key: `delete-${s.id}`,
                          label: "Delete",
                          onClick: () => handleDelete(s.id),
                          className: "bg-red-600 hover:bg-red-800",
                          requiresConfirmation: true,
                          confirmTitle: "Confirm Delete",
                          confirmMessage:
                            "Are you sure you want to delete this schedule?",
                        },
                      ]
                    : [
                        {
                          key: `approve-${s.id}`,
                          label: "Approve",
                          onClick: () => handleApprove(s.id),
                          className: "bg-secondary hover:bg-blue-950",
                        },
                        {
                          key: `reject-${s.id}`,
                          label: "Reject",
                          onClick: () => handleReject(s.id),
                          className: "bg-red-600 hover:bg-red-800",
                          requiresConfirmation: true,
                          confirmTitle: "Confirm Reject",
                          confirmMessage:
                            "Are you sure you want to reject this schedule?",
                        },
                      ];

              return (
                <ScheduleCard
                  key={s.id}
                  schedule={scheduleObj}
                  actions={actions}
                />
              );
            })
          ) : (
            <div className="col-span-full text-center">
              <p className="text-lg text-gray-600">
                No {activeTab} schedules at the moment.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduleListPage;
