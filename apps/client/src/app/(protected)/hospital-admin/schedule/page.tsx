import { AlertTriangle, CalendarDays } from "lucide-react";
import DashboardCard from "@/components/shared/ui/DashboardCard";
import ActivityLog from "@/components/shared/ui/ActivityLog";

const recentActivities = [
  {
    id: 1,
    activity: "New schedule application from Dr. Sarah Brown.",
    timestamp: "3 days ago",
  },
  {
    id: 2,
    activity: "Dr. Emily White added a new schedule.",
    timestamp: "2 hours ago",
  },
  {
    id: 3,
    activity: "Dr. Michael Green's schedule was updated.",
    timestamp: "1 day ago",
  },
];

export default function SchedulesPage() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4 text-primary text-center">
        Schedules Management
      </h1>

      {/* Attention Required Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-primary">
          Attention Required
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <DashboardCard
            text="Schedule applications"
            isLoading={false}
            path="/hospital-admin/schedule/applications"
            data={10}
            icon={<AlertTriangle className="w-8 h-8 text-yellow-500" />}
          />
        </div>
      </div>

      {/* Manage schedules section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 text-primary">
          Manage Schedules
        </h2>
        <div className="grid grid-cols-1 gap-6">
          <DashboardCard
            text="Total schedules"
            isLoading={false}
            path="/hospital-admin/schedule/list"
            data={50}
            icon={<CalendarDays className="w-8 h-8 text-secondary" />}
          />
        </div>
      </div>

      {/* Logs Section */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-primary">
          Recent Schedule Activities
        </h2>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {recentActivities.map((activity) => (
            <ActivityLog
              key={activity.id}
              activity={activity.activity}
              timestamp={activity.timestamp}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
