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

  const relationships: any[] = [];
  const pendingApplications: any[] = [];
  const applicationHistory: any[] = [];

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
