"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import PageHeader from "./components/PageHeader";
import ActiveRelationships from "./components/ActiveRelationships/ActiveRelationships";
import RelationshipSkeleton from "./components/ActiveRelationships/RelationshipSkeleton";
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

  const {
    data: relData,
    isLoading: relLoading,
    error: relError,
  } = useQuery({
    queryKey: ["doctorRelationships"],
    queryFn: async () => {
      const res = await api.get("/hospital/doctor");
      // server returns { message, status, data }
      return res?.data?.data ?? res?.data;
    },
  });

  const relationships = relData ?? [];

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

      {relLoading ? (
        <div className="space-y-4">
          <RelationshipSkeleton />
          <RelationshipSkeleton />
        </div>
      ) : (
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
      )}

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
