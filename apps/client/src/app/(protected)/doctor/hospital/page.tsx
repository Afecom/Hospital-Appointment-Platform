"use client";

import React, { useState } from "react";
import PageHeader from "./components/PageHeader";
import ActiveRelationships from "./components/ActiveRelationships/ActiveRelationships";
import ApplicationsSection from "./components/Applications/ApplicationsSection";
import ApplyModal from "./components/modals/ApplyModal";
import SlotDurationModal from "./components/modals/SlotDurationModal";
import RemovalModal from "./components/modals/RemovalModal";

export default function DoctorsHospitalPage() {
  const [applyOpen, setApplyOpen] = useState(false);
  const [slotModalOpen, setSlotModalOpen] = useState(false);
  const [removalModalOpen, setRemovalModalOpen] = useState(false);
  const [activeRelForAction, setActiveRelForAction] = useState<any | null>(
    null,
  );

  // Mock data for UI review / API shape decision
  const relationships: any[] = [
    {
      id: "rel_1",
      hospitalName: "Saint Mary General Hospital",
      location: "123 Health Ave, Springfield",
      slotDuration: "20 minutes",
      workingTime: "Mon–Fri · 09:00–16:00",
      activeSchedulesCount: 5,
      startDate: "2022-06-01",
    },
    {
      id: "rel_2",
      hospitalName: "Riverside Clinic",
      location: "45 Riverside Rd",
      slotDuration: "15 minutes",
      workingTime: "Tue, Thu · 10:00–14:00",
      activeSchedulesCount: 2,
      startDate: "2023-01-15",
    },
  ];

  const pendingApplications: any[] = [
    {
      id: "app_1",
      hospitalName: "Saint Mary General Hospital",
      type: "Slot duration update",
      summary: "Change from 20 to 25 minutes",
      status: "Pending",
      submittedAt: "2026-02-05",
    },
    {
      id: "app_2",
      hospitalName: "New Hope Hospital",
      type: "Join hospital",
      summary: "Application to join",
      status: "Pending",
      submittedAt: "2026-02-07",
    },
  ];

  const applicationHistory: any[] = [
    {
      id: "hist_1",
      hospitalName: "Riverside Clinic",
      type: "Join hospital",
      status: "Approved",
      decisionAt: "2025-12-01",
    },
    {
      id: "hist_2",
      hospitalName: "Old Town Hospital",
      type: "Relationship removal",
      status: "Rejected",
      decisionAt: "2024-11-10",
    },
  ];

  return (
    <div className="min-h-screen p-6">
      <PageHeader onOpenApply={() => setApplyOpen(true)} />

      <ActiveRelationships
        relationships={relationships}
        onRequestSlotChange={(rel) => {
          setActiveRelForAction(rel);
          setSlotModalOpen(true);
        }}
        onRequestRemoval={(rel) => {
          setActiveRelForAction(rel);
          setRemovalModalOpen(true);
        }}
      />

      <ApplicationsSection
        pending={pendingApplications}
        history={applicationHistory}
      />

      <ApplyModal open={applyOpen} onClose={() => setApplyOpen(false)} />

      <SlotDurationModal
        open={slotModalOpen}
        onClose={() => setSlotModalOpen(false)}
        relationshipId={activeRelForAction?.id}
        currentDuration={activeRelForAction?.slotDuration}
      />

      <RemovalModal
        open={removalModalOpen}
        onClose={() => setRemovalModalOpen(false)}
        relationshipId={activeRelForAction?.id}
      />
    </div>
  );
}
