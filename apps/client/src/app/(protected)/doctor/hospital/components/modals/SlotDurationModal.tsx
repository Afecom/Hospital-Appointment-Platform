"use client";

import React, { useState } from "react";
import { useToast } from "@/context/ToastContext";

type Props = {
  open: boolean;
  onClose: () => void;
  relationshipId?: string;
  currentDuration?: string;
  onSuccess?: () => void;
};

export default function SlotDurationModal({
  open,
  onClose,
  relationshipId,
  currentDuration,
  onSuccess,
}: Props) {
  const [newDuration, setNewDuration] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  if (!open) return null;

  const submit = async () => {
    if (!relationshipId) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/relationships/${relationshipId}/request-slot-change`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newDuration, note }),
        },
      );
      if (!res.ok) throw new Error("Request failed");
      toast.addToast({
        title: "Slot duration change request submitted successfully.",
        variant: "success",
      } as any);
      onSuccess?.();
      onClose();
    } catch (e) {
      toast.addToast({
        title: "Failed to submit slot duration request.",
        variant: "danger",
      } as any);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40">
      <div className="bg-black/50 absolute inset-0" onClick={onClose} />
      <div className="bg-white rounded-md shadow-md p-6 z-50 w-full max-w-md">
        <h3 className="text-lg font-medium text-slate-900">
          Request Slot Duration Change
        </h3>
        <div className="mt-4 space-y-3 text-sm text-slate-700">
          <div>
            <div className="text-xs text-slate-500">Current slot duration</div>
            <div className="mt-1">{currentDuration ?? "—"}</div>
          </div>
          <div>
            <label className="block text-sm text-slate-700">
              New slot duration
            </label>
            <input
              value={newDuration}
              onChange={(e) => setNewDuration(e.target.value)}
              type="number"
              min="5"
              max="30"
              placeholder="min: 5, max: 30"
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-700">
              Reason (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full border rounded-md px-3 py-2 h-24"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-3 py-1 text-sm text-slate-700 bg-slate-50 rounded-md border transition-all ease-in-out duration-150 hover:bg-slate-100 hover:text-slate-900 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-blue-100"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting || !newDuration}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm focus-visible:ring-2 focus-visible:ring-blue-100 transition-all ease-in-out duration-150 hover:-translate-y-1"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
