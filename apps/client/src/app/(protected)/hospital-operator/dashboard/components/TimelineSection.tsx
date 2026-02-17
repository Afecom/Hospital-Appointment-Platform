"use client";

import { DoctorTimeline } from "../mockData";
import TimelineItem from "./TimelineItem";

interface TimelineSectionProps {
  timelineData: DoctorTimeline[];
}

export default function TimelineSection({
  timelineData,
}: TimelineSectionProps) {
  return (
    <div className="space-y-6">
      {timelineData.map((doctorGroup) => (
        <div key={doctorGroup.doctor} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {doctorGroup.doctor}
          </h3>
          <div className="space-y-1">
            {doctorGroup.appointments.map((appointment) => (
              <TimelineItem key={appointment.id} appointment={appointment} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
