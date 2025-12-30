import {
  LayoutDashboard,
  BriefcaseMedical,
  ClipboardClock,
  Calendar,
  Hospital,
  Settings,
  Star,
  History,
  HandCoins,
} from "lucide-react";

export const NavSchema = {
  hospital_admin: [
    {
      id: 1,
      text: "Dashboard",
      path: "/hospital-admin/dashboard",
      icon: <LayoutDashboard />,
    },
    {
      id: 2,
      text: "Doctors",
      path: "/hospital-admin/doctor",
      icon: <BriefcaseMedical />,
    },
    {
      id: 3,
      text: "Schedules",
      path: "/hospital-admin/schedule",
      icon: <ClipboardClock />,
    },
    {
      id: 4,
      text: "Appointments",
      path: "/hospital-admin/appointment",
      icon: <Calendar />,
    },
    {
      id: 5,
      text: "Hospital",
      path: "/hospital-admin/hospital",
      icon: <Hospital />,
    },
  ],
  user: [
    {
      id: 1,
      text: "Appointments",
      path: "/user/appointment",
      icon: <ClipboardClock />,
    },
    {
      id: 2,
      text: "Favorites",
      path: "/user/favorite",
      icon: <Star />,
    },
  ],
  hospital_operator: [
    {
      id: 1,
      text: "Appointments",
      path: "/hospital-operator/appointment",
      icon: <ClipboardClock />,
    },
    {
      id: 2,
      text: "Schedules",
      path: "/hospital-operator/schedule",
      icon: <Calendar />,
    },
  ],
  hospital_user: [
    {
      id: 1,
      text: "Dashboard",
      path: "/hospital-user/dashboard",
      icon: <LayoutDashboard />,
    },
    {
      id: 2,
      text: "Apointments",
      path: "/hospital-user/appointment",
      icon: <ClipboardClock />,
    },
    {
      id: 1,
      text: "Recents",
      path: "/hospital-user/recent",
      icon: <History />,
    },
  ],
  doctor: [
    {
      id: 1,
      text: "Dashboard",
      path: "/doctor/dashboard",
      icon: <LayoutDashboard />,
    },
    {
      id: 2,
      text: "Schedules",
      path: "/doctor/schedule",
      icon: <ClipboardClock />,
    },
    {
      id: 3,
      text: "Appointments",
      path: "/doctor/appointment",
      icon: <Calendar />,
    },
    {
      id: 4,
      text: "Hospitals",
      path: "/doctor/hospital",
      icon: <Hospital />,
    },
    {
      id: 5,
      text: "Settings",
      path: "/doctor/setting",
      icon: <Settings />,
    },
  ],
  admin: [
    {
      id: 1,
      text: "Dashboard",
      path: "/admin/dashboard",
      icon: <LayoutDashboard />,
    },
    {
      id: 2,
      text: "Doctors",
      path: "/admin/doctor",
      icon: <BriefcaseMedical />,
    },
    {
      id: 3,
      text: "Hospitals",
      path: "/admin/hospital",
      icon: <Hospital />,
    },
    {
      id: 4,
      text: "Schedules",
      path: "/admin/schedule",
      icon: <ClipboardClock />,
    },
    {
      id: 5,
      text: "Appointments",
      path: "/admin/appointment",
      icon: <Calendar />,
    },
    {
      id: 6,
      text: "Settings",
      path: "/admin/setting",
      icon: <Settings />,
    },
    {
      id: 7,
      text: "Specialization",
      path: "/admin/specialization",
      icon: <Settings />,
    },
    {
      id: 8,
      text: "Finance",
      path: "/admin/finance",
      icon: <HandCoins />,
    },
  ],
};
