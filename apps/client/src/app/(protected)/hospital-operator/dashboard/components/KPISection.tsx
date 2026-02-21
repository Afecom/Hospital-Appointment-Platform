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
import { KPIData, KPITrendData } from "../types";

interface KPISectionProps {
  data: KPIData;
  trends: KPITrendData;
}

export default function KPISection({ data, trends }: KPISectionProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <KPICard
        title="Pending Approvals"
        value={data.pending}
        subtext={trends.pending}
        icon={Clock}
        color="yellow"
      />
      <KPICard
        title="Approved Today"
        value={data.approvedToday}
        subtext={trends.approvedToday}
        icon={CheckCircle}
        color="green"
      />
      <KPICard
        title="Rescheduled Today"
        value={data.rescheduledToday}
        subtext={trends.rescheduledToday}
        icon={Calendar}
        color="blue"
      />
      <KPICard
        title="Refund Requests"
        value={data.refunds}
        subtext={trends.refunds}
        icon={DollarSign}
        color="red"
      />
      <KPICard
        title="Total Appointments Today"
        value={data.totalToday}
        subtext={trends.totalToday}
        icon={CalendarDays}
        color="gray"
      />
      <KPICard
        title="Slot Utilization"
        value={`${data.slotUtilization}%`}
        subtext={trends.slotUtilization}
        icon={TrendingUp}
        color="purple"
      />
    </div>
  );
}
