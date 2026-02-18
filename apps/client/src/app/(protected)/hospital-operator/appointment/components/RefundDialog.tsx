"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { Appointment } from "../types";

interface RefundDialogProps {
  open: boolean;
  onClose: () => void;
  appointment: Appointment | null;
  onConfirm: (appointment: Appointment) => void;
}

export default function RefundDialog({
  open,
  onClose,
  appointment,
  onConfirm,
}: RefundDialogProps) {
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

  const handleConfirm = () => {
    if (appointment) {
      onConfirm(appointment);
      onClose();
    }
  };

  if (!open || !appointment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-hidden={!open}>
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="refund-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 id="refund-dialog-title" className="text-lg font-semibold text-gray-900">
            Confirm Refund
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 hover:text-gray-700"
            aria-label="Close"
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
              {appointment.patientName}
            </p>
            <p>
              <span className="font-medium text-gray-700">Doctor:</span>{" "}
              {appointment.doctorName}
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
          </div>
          <p className="text-sm text-gray-600">
            Are you sure you want to refund this appointment?
          </p>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Confirm Refund
          </button>
        </div>
      </div>
    </div>
  );
}
