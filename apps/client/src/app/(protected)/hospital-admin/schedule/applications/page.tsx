import ScheduleCard from "@/components/schedule/ScheduleCard";
import React from "react";

type ScheduleApplication = {
  doctorName: string;
  phoneNumber: string;
  status: string;
  type: string;
  period: string;
  startDate: string;
  endDate?: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
};

const mockScheduleApplications: ScheduleApplication[] = [
  {
    doctorName: "Dr. John Doe",
    phoneNumber: "+1234567890",
    status: "Pending",
    type: "reccuring",
    period: "morning",
    startDate: "2024-07-01",
    startTime: "09:00 AM",
    endTime: "05:00 PM",
    daysOfWeek: [0, 2, 4],
  },
  {
    doctorName: "Dr. Jane Smith",
    phoneNumber: "+0987654321",
    status: "Pending",
    type: "reccuring",
    period: "afternoon",
    startDate: "2024-07-15",
    startTime: "10:00 AM",
    endTime: "01:00 PM",
    daysOfWeek: [1, 3],
  },
  {
    doctorName: "Dr. Emily Brown",
    phoneNumber: "+1122334455",
    status: "Pending",
    type: "One Time",
    period: "Morning",
    startDate: "2024-08-01",
    endDate: "2024-08-01",
    startTime: "08:00 AM",
    endTime: "06:00 PM",
    daysOfWeek: [0, 1, 2, 3, 4, 5, 6],
  },
  {
    doctorName: "Dr. Michael Johnson",
    phoneNumber: "+1231231234",
    status: "Pending",
    type: "One Time",
    period: "morning",
    startDate: "2024-08-10",
    endDate: "2024-08-10",
    startTime: "02:00 PM",
    endTime: "03:00 PM",
    daysOfWeek: [5],
  },
];

export default function ScheduleApplicationsPage() {
  return (
    <div className="p-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-6">
          Pending Schedule Applications
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockScheduleApplications.map((app) => (
          <ScheduleCard key={app.doctorName} schedule={app} />
        ))}
      </div>
    </div>
  );
}
