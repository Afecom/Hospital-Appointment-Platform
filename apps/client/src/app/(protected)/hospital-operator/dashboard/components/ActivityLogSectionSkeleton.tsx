"use client";

import SectionCard from "./SectionCard";

export default function ActivityLogSectionSkeleton() {
  return (
    <SectionCard
      title="Recent Activity Log"
      subtitle="Loading recent activities..."
    >
      <div className="divide-y divide-gray-100 animate-pulse">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center justify-between py-3">
            <div className="h-4 bg-gray-200 rounded w-3/5" />
            <div className="h-4 bg-gray-200 rounded w-20" />
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
