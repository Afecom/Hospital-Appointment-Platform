"use client";
import React from "react";

type WeeklyChartProps = {
  labels: string[];
  completedSeries: number[];
  canceledSeries: number[];
};

export default function WeeklyChart({
  labels,
  completedSeries,
  canceledSeries,
}: WeeklyChartProps) {
  const days = labels;
  const completed = completedSeries;
  const canceled = canceledSeries;

  function getMax() {
    return Math.max(...completed, ...canceled) || 1;
  }

  const max = getMax();
  const width = 700;
  const height = 220;
  const pad = 24;

  const pointsCompleted = completed
    .map((v, i) => {
      const x = pad + (i * (width - pad * 2)) / (days.length - 1);
      const y = height - pad - (v / max) * (height - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="w-full h-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-56"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areaGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
          <line
            key={i}
            x1={pad}
            x2={width - pad}
            y1={pad + t * (height - pad * 2)}
            y2={pad + t * (height - pad * 2)}
            stroke="#e6e7ea"
            strokeWidth={1}
          />
        ))}

        {/* canceled bars */}
        {canceled.map((v, i) => {
          const x = pad + (i * (width - pad * 2)) / (days.length - 1) - 8;
          const barW = 16;
          const barH = (v / max) * (height - pad * 2);
          const y = height - pad - barH;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barW}
              height={barH}
              rx={3}
              fill="#f97373"
              opacity={0.9}
            />
          );
        })}

        {/* completed area */}
        <polyline
          points={pointsCompleted}
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* points */}
        {completed.map((v, i) => {
          const x = pad + (i * (width - pad * 2)) / (days.length - 1);
          const y = height - pad - (v / max) * (height - pad * 2);
          return <circle key={i} cx={x} cy={y} r={3.5} fill="#3b82f6" />;
        })}

        {/* x-axis labels */}
        {days.map((d, i) => {
          const x = pad + (i * (width - pad * 2)) / (days.length - 1);
          return (
            <text
              key={i}
              x={x}
              y={height - 6}
              fontSize={11}
              fill="#6b7280"
              textAnchor="middle"
            >
              {d}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
