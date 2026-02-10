"use client";

import React, { useState } from "react";
import { useToast } from "@/context/ToastContext";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export default function ApplyModal({ open, onClose, onSuccess }: Props) {
  const [hospital, setHospital] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  if (!open) return null;

  const submit = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/hospitals/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospitalId: hospital, message }),
      });
      if (!res.ok) throw new Error("Request failed");
      toast.addToast({
        title: "Hospital application submitted successfully.",
        variant: "success",
      } as any);
      onSuccess?.();
      onClose();
    } catch (e) {
      toast.addToast({
        title: "Failed to submit hospital application.",
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
          Apply to a Hospital
        </h3>
        <div className="mt-4 space-y-3">
          <label className="block text-sm text-slate-700">Hospital</label>
          <input
            value={hospital}
            onChange={(e) => setHospital(e.target.value)}
            placeholder="Search or paste hospital id"
            className="w-full border rounded-md px-3 py-2"
          />

          <label className="block text-sm text-slate-700">
            Message (optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border rounded-md px-3 py-2 h-24"
          />
        </div>

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
            disabled={submitting || !hospital}
            className="px-4 py-2 bg-slate-800 text-white rounded-md text-sm"
          >
            {submitting ? "Submitting..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}
