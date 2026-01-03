import DashboardCard from "@/components/shared/ui/dasboardCard";
import LogCardComponent from "@/components/shared/ui/logCard";
import { User, BriefcaseMedical, ClipboardClock, Calendar } from "lucide-react";
import api from "@/lib/axios";

let totalPendingDoctors = 0;
let totalPendingSchedules = 0;
let totalDoctors = 0;
let totalAppointments = 0;
let hospitalName = "";
let hospitalSlogan = "";

export default async function adminDashboardFunction() {
  try {
    totalPendingDoctors = await api.get("/doctor/hospital/pending/count");
    const PendingSchedules = await api.get("/schedule");
    totalPendingSchedules = PendingSchedules.data.meta.total;
    totalDoctors = await api.get("/doctor/hospital");
    const appointments = await api.get("/appointment");
    totalAppointments = appointments.data.meta.total;
  } catch (error) {
    console.warn(error);
  }
  // Mock data for recent activities
  const recentActivities = [
    {
      id: 1,
      activity: "Dr. Sara approved as Cardiologist.",
      timestamp: "12 min ago",
    },
    {
      id: 2,
      activity: "Schedule approved for Dr. Mohammed.",
      timestamp: "10 min ago",
    },
    {
      id: 3,
      activity: "User Hana assigned Hospital-operator role.",
      timestamp: "Yesterday",
    },
  ];

  return (
    <div className="p-6">
      <div className="text-center mb-8">
        <h1 className="text-primary text-4xl font-extrabold">{hospitalName}</h1>
        <h3 className="text-secondary text-xl font-semibold">
          {hospitalSlogan}
        </h3>
      </div>

      <div>
        <h1 className="font-bold text-2xl text-primary mt-6 mb-4">
          Pending Approvals
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard
            text="Doctor Approvals"
            path="/hospital-admin/doctor/applications"
            data={totalPendingDoctors}
            icon={<BriefcaseMedical className="w-8 h-8 text-secondary" />}
          />
          <DashboardCard
            text="Schedule Approvals"
            path="/hospital-admin/schedule/review"
            data={totalPendingSchedules}
            icon={<Calendar className="w-8 h-8 text-secondary" />}
          />
          <DashboardCard
            text="User Approvals"
            path="/hospital-admin/users/review"
            data={6}
            icon={<User className="w-8 h-8 text-secondary" />}
          />
        </div>
      </div>

      <div className="mt-8">
        <h1 className="font-bold text-2xl text-primary mb-4">Key Metrics</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <DashboardCard
            text="Total Doctors"
            data={totalDoctors}
            active={8}
            icon={<BriefcaseMedical className="w-8 h-8 text-secondary" />}
          />
          <DashboardCard
            text="Total Visits"
            data={totalAppointments}
            active={13}
            icon={<ClipboardClock className="w-8 h-8 text-secondary" />}
          />
          <DashboardCard
            text="Total users"
            data={3}
            active={1}
            icon={<User className="w-8 h-8 text-secondary" />}
          />
        </div>
      </div>

      <div className="mt-8">
        <h1 className="font-bold text-2xl text-primary mb-4">
          Recent Activities
        </h1>
        <div className="bg-white p-6 rounded-lg shadow-md">
          {recentActivities.map((activity) => (
            <LogCardComponent
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
