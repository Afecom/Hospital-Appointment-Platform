"use client";
import { useState } from "react";
import { Users, UserPlus, AlertTriangle } from "lucide-react";
import DoctorDashboardCard from "@/components/shared/ui/DoctorDashboardCard";
import DoctorActivityLog from "@/components/shared/ui/DoctorActivityLog";
import api from "@/lib/axios";

const recentActivities = [
  {
    id: 1,
    activity: "Dr. Emily White added a new schedule.",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    activity: "Dr. Michael Green's profile was updated.",
    timestamp: "1 day ago",
  },
  {
    id: 3,
    activity: "New doctor application from Dr. Sarah Brown.",
    timestamp: "3 days ago",
  },
];

let totalDoctors = 0;
let doctorApplications = 0;
let totalInactiveDoctors = 0;
let inactiveDoctors: any[] = [];

export default function DoctorsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // TODO: Fetch recent doctor activities from /api/doctors/activities

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-primary text-center">
        Doctors Management
      </h1>

      {/* Doctors Management Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <DoctorDashboardCard
          text="Total Doctors"
          path="/hospital-admin/doctor/list"
          data={totalDoctors}
          icon={<Users className="w-8 h-8 text-secondary" />}
        />
        <DoctorDashboardCard
          text="Doctor Applications"
          path="/hospital-admin/doctor/applications"
          data={doctorApplications}
          icon={<UserPlus className="w-8 h-8 text-secondary" />}
        />
      </div>

      {/* Attention Required Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-primary">
          Attention Required
        </h2>
        <DoctorDashboardCard
          text="Doctors with No Schedules"
          data={totalInactiveDoctors}
          icon={<AlertTriangle className="w-8 h-8 text-yellow-500" />}
          onClick={() => setIsModalOpen(true)}
        />
      </div>

      {/* Recent Doctor Activity Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-primary">
          Recent Doctor Activity
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {recentActivities.map((activity) => (
            <DoctorActivityLog
              key={activity.id}
              activity={activity.activity}
              timestamp={activity.timestamp}
            />
          ))}
        </div>
      </div>

      {/* Modal for Doctors with No Schedules */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center transition-opacity"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="bg-white p-8 rounded-lg shadow-xl w-1/3">
            <h2 className="text-2xl font-bold mb-4 text-secondary">
              Doctors with No Schedules
            </h2>
            <ul>
              {inactiveDoctors.map((doctor) => (
                <li key={doctor.id} className="text-gray-700 py-1">
                  {doctor.user.fullName}
                </li>
              ))}
            </ul>
            <button
              className="mt-6 bg-secondary text-white px-4 py-2 rounded-lg hover:bg-blue-950 transition-colors hover:cursor-pointer"
              onClick={() => setIsModalOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
