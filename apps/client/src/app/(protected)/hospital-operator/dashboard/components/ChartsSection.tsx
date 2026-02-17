"use client";

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import ChartCard from "./ChartCard";
import { ChartStatusData, DoctorAppointmentData } from "../mockData";

interface ChartsSectionProps {
  statusData: ChartStatusData[];
  doctorData: DoctorAppointmentData[];
}

const COLORS = ["#10b981", "#f59e0b", "#3b82f6", "#ef4444"];

export default function ChartsSection({
  statusData,
  doctorData,
}: ChartsSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartCard title="Appointments by Status">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }: { name: string; percent: number }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Appointments by Doctor">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={doctorData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="doctor"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              stroke="#9ca3af"
            />
            <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Legend />
            <Bar
              dataKey="appointments"
              fill="#3b82f6"
              radius={[8, 8, 0, 0]}
              name="Appointments"
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
