"use client";

import { formatTimeLabel } from "../utils";
import type { Appointment, AppointmentStatus } from "../types";
import StatusBadge from "./StatusBadge";
import SourceBadge from "./SourceBadge";

interface AppointmentTableProps {
  appointments: Appointment[];
  todayDate: string;
  onApprove: (a: Appointment) => void;
  onReschedule: (a: Appointment) => void;
  onRefund: (a: Appointment) => void;
}

function paymentBadgeClass(status: "PAID" | "UNPAID" | "REFUNDED"): string {
  const base = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1";
  switch (status) {
    case "PAID":
      return `${base} bg-green-50 text-green-700 ring-green-100`;
    case "UNPAID":
      return `${base} bg-amber-50 text-amber-700 ring-amber-100`;
    case "REFUNDED":
      return `${base} bg-gray-50 text-gray-600 ring-gray-100`;
    default:
      return base;
  }
}

function isWithinThreeHours(dateStr: string, timeStr: string): boolean {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [h, min] = timeStr.split(":").map(Number);
  const aptDate = new Date(y, (m ?? 1) - 1, d ?? 1, h ?? 0, min ?? 0);
  const now = new Date();
  const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
  return aptDate >= now && aptDate <= threeHoursFromNow;
}

function getActions(status: AppointmentStatus): {
  approve: boolean;
  reschedule: boolean;
  refund: boolean;
} {
  switch (status) {
    case "PENDING":
      return { approve: true, reschedule: true, refund: true };
    case "APPROVED":
      return { approve: false, reschedule: true, refund: true };
    case "RESCHEDULED":
      return { approve: true, reschedule: false, refund: true };
    case "REFUNDED":
    case "COMPLETED":
      return { approve: false, reschedule: false, refund: false };
    default:
      return { approve: false, reschedule: false, refund: false };
  }
}

export default function AppointmentTable({
  appointments,
  todayDate,
  onApprove,
  onReschedule,
  onRefund,
}: AppointmentTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/50">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
              ID
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Patient
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Phone
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Doctor
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Date
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Time
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Source
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Status
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Payment
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((apt) => {
            const isToday = apt.date === todayDate;
            const showStartingSoon =
              apt.status === "PENDING" && isWithinThreeHours(apt.date, apt.time);
            const actions = getActions(apt.status);

            return (
              <tr
                key={apt.id}
                className={`border-b border-gray-100 last:border-b-0 transition-colors duration-150 ${
                  isToday ? "bg-blue-50/30" : "hover:bg-gray-50"
                }`}
              >
                <td className="py-4 px-4 text-sm font-mono text-gray-600">
                  {apt.id}
                </td>
                <td className="py-4 px-4 text-sm font-medium text-gray-900">
                  {apt.patientName}
                </td>
                <td className="py-4 px-4 text-sm text-gray-600">{apt.phone}</td>
                <td className="py-4 px-4 text-sm text-gray-700">
                  {apt.doctorName}
                </td>
                <td className="py-4 px-4 text-sm text-gray-700">
                  {new Date(apt.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="py-4 px-4 text-sm text-gray-700">
                  {formatTimeLabel(apt.time)}
                </td>
                <td className="py-4 px-4">
                  <SourceBadge source={apt.source} />
                </td>
                <td className="py-4 px-4">
                  <StatusBadge
                    status={apt.status}
                    showStartingSoon={showStartingSoon}
                  />
                </td>
                <td className="py-4 px-4">
                  <span className={paymentBadgeClass(apt.paymentStatus)}>
                    {apt.paymentStatus}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {actions.approve && (
                      <button
                        type="button"
                        onClick={() => onApprove(apt)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-green-50 text-green-700 hover:bg-green-100 ring-1 ring-green-200 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {actions.reschedule && (
                      <button
                        type="button"
                        onClick={() => onReschedule(apt)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 ring-1 ring-blue-200 transition-colors"
                      >
                        Reschedule
                      </button>
                    )}
                    {actions.refund && (
                      <button
                        type="button"
                        onClick={() => onRefund(apt)}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium bg-red-50 text-red-700 hover:bg-red-100 ring-1 ring-red-200 transition-colors"
                      >
                        Refund
                      </button>
                    )}
                    {!actions.approve &&
                      !actions.reschedule &&
                      !actions.refund && (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
