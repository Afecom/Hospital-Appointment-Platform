"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import type { PendingAppointment } from "../types";

interface ViewModalProps {
  open: boolean;
  onClose: () => void;
  appointment: PendingAppointment | null;
}

export default function ViewModal({
  open,
  onClose,
  appointment,
}: ViewModalProps) {
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

  if (!open || !appointment) return null;

  const paymentLabel = appointment.isFree
    ? "Free"
    : appointment.isPaid
      ? "Paid"
      : "Unpaid";

  const paymentClass = appointment.isFree
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
    : appointment.isPaid
      ? "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100"
      : "bg-rose-50 text-rose-700 ring-1 ring-rose-100";

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
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="view-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2
            id="view-modal-title"
            className="text-xl font-semibold text-gray-900"
          >
            Appointment Details
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

        <div className="overflow-y-auto px-6 py-6 space-y-6">
          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Appointment Information
            </h3>
            <div className="rounded-xl bg-gray-50 p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Appointment ID:</span>
                <span className="font-mono text-gray-900">{appointment.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Status:</span>
                <span className="text-gray-900">{appointment.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Source:</span>
                <span className="text-gray-900">{appointment.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Created:</span>
                <span className="text-gray-900">{appointment.createdAt}</span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Patient Information
            </h3>
            <div className="rounded-xl bg-gray-50 p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Name:</span>
                <span className="text-gray-900">{appointment.patient}</span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Appointment Schedule
            </h3>
            <div className="rounded-xl bg-gray-50 p-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Doctor:</span>
                <span className="text-gray-900">{appointment.doctor}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Date:</span>
                <span className="text-gray-900">
                  {new Date(appointment.date).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Time:</span>
                <span className="text-gray-900">{appointment.time}</span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">
              Payment Information
            </h3>
            <div className="rounded-xl bg-gray-50 p-4 space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">Payment Status:</span>
                <span
                  className={`text-xs px-2 py-1 rounded-md ${paymentClass}`}
                >
                  {paymentLabel}
                </span>
              </div>
            </div>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
