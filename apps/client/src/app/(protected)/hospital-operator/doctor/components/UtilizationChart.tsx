"use client";

import {
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type UtilizationPoint = {
  name: string;
  utilizationPct: number;
  isOnLeave: boolean;
};

export default function UtilizationChart({ data }: { data: UtilizationPoint[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Doctor Utilization — Selected Date
        </h3>
        <p className="text-sm text-gray-500 mt-1">
          Compact workload overview for currently visible doctors
        </p>
      </div>

      <div className="w-full">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ left: 4, right: 12, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#6b7280", fontSize: 12 }}
              stroke="#9ca3af"
              interval={0}
              tickFormatter={(v: string) => (v.length > 10 ? `${v.slice(0, 10)}…` : v)}
              height={44}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fill: "#6b7280", fontSize: 12 }}
              stroke="#9ca3af"
              tickFormatter={(v: number) => `${v}%`}
            />
            <Tooltip
              formatter={(value: any, _name: any, props: any) => {
                const pct = Number(value);
                const label = props?.payload?.isOnLeave ? "On leave" : `${pct}%`;
                return [label, "Utilization"];
              }}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />
            <Bar
              dataKey="utilizationPct"
              radius={[8, 8, 0, 0]}
              name="Utilization"
            >
              {data.map((entry, idx) => (
                <Cell key={`cell-${idx}`} fill={entry.isOnLeave ? "#d1d5db" : "#3b82f6"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-500">
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-blue-500" aria-hidden />
          Utilization %
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-sm bg-gray-300" aria-hidden />
          On leave shown as 0%
        </span>
      </div>
    </div>
  );
}

