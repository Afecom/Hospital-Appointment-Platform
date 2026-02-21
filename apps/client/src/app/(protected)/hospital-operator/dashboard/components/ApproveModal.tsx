"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { approveAppointment } from "@/actions/appointment";
import type { PendingAppointment } from "../types";

interface ApproveModalProps {
  open: boolean;
  onClose: () => void;
  appointment: PendingAppointment | null;
  onSuccess: (updated: PendingAppointment) => void;
}

export default function ApproveModal({
  open,
  onClose,
  appointment,
  onSuccess,
}: ApproveModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const handleConfirm = async () => {
    if (!appointment) return;

    setLoading(true);
    setError(null);

    try {
      const updated = await approveAppointment(appointment.id);
      const transformed: PendingAppointment = {
        ...appointment,
        status: "APPROVED",
      };
      onSuccess(transformed);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve appointment");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !appointment) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-hidden={!open}
    >
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="approve-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2
            id="approve-modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            Approve Appointment
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-700"
            aria-label="Close"
            disabled={loading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-6 space-y-4">
          <div className="rounded-xl bg-gray-50 p-4 space-y-2 text-sm">
            <p>
              <span className="font-medium text-gray-700">Appointment ID:</span>{" "}
              <span className="font-mono">{appointment.id}</span>
            </p>
            <p>
              <span className="font-medium text-gray-700">Patient:</span>{" "}
              {appointment.patient}
            </p>
            <p>
              <span className="font-medium text-gray-700">Doctor:</span>{" "}
              {appointment.doctor}
            </p>
            <p>
              <span className="font-medium text-gray-700">Date:</span>{" "}
              {new Date(appointment.date).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}{" "}
              at {appointment.time}
            </p>
            <p>
              <span className="font-medium text-gray-700">Source:</span>{" "}
              {appointment.source}
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <p className="text-sm text-gray-600">
            Are you sure you want to approve this appointment?
          </p>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Approving..." : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}
