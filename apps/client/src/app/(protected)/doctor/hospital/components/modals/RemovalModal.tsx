"use client";

import React, { useState } from "react";
import { useToast } from "@/context/ToastContext";

type Props = {
  open: boolean;
  onClose: () => void;
  relationshipId?: string;
  onSuccess?: () => void;
};

export default function RemovalModal({
  open,
  onClose,
  relationshipId,
  onSuccess,
}: Props) {
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  if (!open) return null;

  const submit = async () => {
    if (!relationshipId) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/relationships/${relationshipId}/request-removal`,
        {
          method: "POST",
        },
      );
      if (!res.ok) throw new Error("Request failed");
      toast.addToast({
        title: "Relationship removal request submitted.",
        variant: "success",
      } as any);
      onSuccess?.();
      onClose();
    } catch (e) {
      toast.addToast({
        title: "Failed to submit removal request.",
        variant: "danger",
      } as any);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40">
      <div className="bg-black/40 absolute inset-0" />
      <div className="bg-white rounded-md shadow-md p-6 z-50 w-full max-w-md">
        <h3 className="text-lg font-medium text-slate-900">
          Request Relationship Removal
        </h3>
        <p className="mt-3 text-sm text-slate-700">
          This request will be reviewed by the hospital administrator. The
          relationship will remain active until approved.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-3 py-1 text-sm text-slate-700 bg-slate-50 rounded-md border"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm focus-visible:ring-2 focus-visible:ring-blue-100"
          >
            {submitting ? "Submitting..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}
