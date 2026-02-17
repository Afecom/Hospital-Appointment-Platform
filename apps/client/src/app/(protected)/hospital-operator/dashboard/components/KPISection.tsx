"use client";

import {
  Clock,
  CheckCircle,
  Calendar,
  DollarSign,
  CalendarDays,
  TrendingUp,
} from "lucide-react";
import KPICard from "./KPICard";
import { KPIData } from "../mockData";

interface KPISectionProps {
  data: KPIData;
}

export default function KPISection({ data }: KPISectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <KPICard
        title="Pending Approvals"
        value={data.pending}
        subtext="+12% from yesterday"
        icon={Clock}
        color="yellow"
      />
      <KPICard
        title="Approved Today"
        value={data.approvedToday}
        subtext="+8% from yesterday"
        icon={CheckCircle}
        color="green"
      />
      <KPICard
        title="Rescheduled Today"
        value={data.rescheduledToday}
        subtext="+2 from yesterday"
        icon={Calendar}
        color="blue"
      />
      <KPICard
        title="Refund Requests"
        value={data.refunds}
        subtext="-1 from yesterday"
        icon={DollarSign}
        color="red"
      />
      <KPICard
        title="Total Appointments Today"
        value={data.totalToday}
        subtext="+15% from yesterday"
        icon={CalendarDays}
        color="gray"
      />
      <KPICard
        title="Slot Utilization"
        value={`${data.slotUtilization}%`}
        subtext="+5% from yesterday"
        icon={TrendingUp}
        color="purple"
      />
    </div>
  );
}
