"use client";

import { ActivityLogEntry } from "../mockData";
import ActivityItem from "./ActivityItem";
import SectionCard from "./SectionCard";

interface ActivityLogSectionProps {
  activities: ActivityLogEntry[];
}

export default function ActivityLogSection({
  activities,
}: ActivityLogSectionProps) {
  return (
    <SectionCard
      title="Recent Activity Log"
      subtitle={`Showing latest ${activities.length} activities`}
    >
      <div className="max-h-96 overflow-y-auto">
        <div className="divide-y divide-gray-100">
          {activities.map((activity) => (
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
