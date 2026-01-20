import DashboardCard from "@/components/shared/ui/dasboardCard";
import LogCardComponent from "@/components/shared/ui/logCard";
import { User, BriefcaseMedical, ClipboardClock, Calendar } from "lucide-react";
import { headers } from "next/headers";
import {
  countHospitalDoctorsRes,
  countPendingAppointmentsRes,
  countPendingDoctorsRes,
  countPendingSchedulesRes,
  uniqueHospital,
} from "@hap/contract";

async function getData() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  const fetchOptions = {
    cache: "no-store" as RequestCache,
    headers: await headers(),
  };

  try {
    const [
      pendingDoctorsRes,
      pendingSchedulesRes,
      totalDoctorsRes,
      appointmentsRes,
      hospitalRes,
    ] = await Promise.all([
      fetch(`${apiBaseUrl}/doctor/hospital/pending/count`, fetchOptions),
      fetch(`${apiBaseUrl}/schedule/pending/count`, fetchOptions),
      fetch(`${apiBaseUrl}/doctor/hospital/count`, fetchOptions),
      fetch(`${apiBaseUrl}/appointment/pending/count`, fetchOptions),
      fetch(`${apiBaseUrl}/hospital/unique`, fetchOptions),
    ]);

    if (!pendingDoctorsRes.ok)
      throw new Error("Failed to fetch pending doctors");
    if (!pendingSchedulesRes.ok)
      throw new Error("Failed to fetch pending schedules");
    if (!totalDoctorsRes.ok) throw new Error("Failed to fetch total doctors");
    if (!appointmentsRes.ok)
      throw new Error("Failed to fetch pending appointments");
    if (!hospitalRes.ok)
      throw new Error("Failed to fetch pending appointments");

    const pendingDoctorsData: countPendingDoctorsRes =
      await pendingDoctorsRes.json();
    const pendingSchedulesData: countPendingSchedulesRes =
      await pendingSchedulesRes.json();
    const totalDoctorsData: countHospitalDoctorsRes =
      await totalDoctorsRes.json();
    const appointmentsData: countPendingAppointmentsRes =
      await appointmentsRes.json();
    const hospitalData: uniqueHospital = await hospitalRes.json();

    return {
      totalPendingDoctors: pendingDoctorsData.pendingDoctors,
      totalPendingSchedules: pendingSchedulesData.total,
      totalDoctors: totalDoctorsData.total,
      totalPendingAppointments: appointmentsData.totalAppointments,
      hospitalName: hospitalData.data.name,
      hospitalSlogan: hospitalData.data.slogan,
    };
  } catch (error) {
    return {
      totalPendingDoctors: 0,
      totalPendingSchedules: 0,
      totalDoctors: 0,
      totalPendingAppointments: 0,
      hospitalName: "Hospital",
      hospitalSlogan: "Error loading data",
    };
  }
}

export default async function AdminDashboardFunction() {
  const {
    totalPendingDoctors,
    totalPendingSchedules,
    totalDoctors,
    totalPendingAppointments,
    hospitalName,
    hospitalSlogan,
  } = await getData();

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
            text="Upcoming Visits"
            data={totalPendingAppointments}
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
