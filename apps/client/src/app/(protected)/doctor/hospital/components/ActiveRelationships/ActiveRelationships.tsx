"use client";

import React from "react";
import RelationshipCard from "./RelationshipCard";

type Relationship = {
  id: string;
  hospitalName: string;
  location?: string;
  slotDuration: string;
  workingTime: string;
  activeSchedulesCount: number;
  startDate: string;
};

type Props = {
  relationships: Relationship[];
  onRequestSlotChange: (rel: Relationship) => void;
  onRequestRemoval: (rel: Relationship) => void;
};

export default function ActiveRelationships({
  relationships,
  onRequestSlotChange,
  onRequestRemoval,
}: Props) {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">
          Active Hospital Relationships
        </h2>
      </div>

      {relationships.length === 0 ? (
        <div className="text-slate-600">
          You are not currently affiliated with any hospitals.
        </div>
      ) : (
        <div className="space-y-4">
          {relationships.map((r) => (
            <RelationshipCard
              key={r.id}
              relationship={r}
              onRequestSlotChange={onRequestSlotChange}
              onRequestRemoval={onRequestRemoval}
            />
          ))}
        </div>
      )}
    </section>
  );
}
