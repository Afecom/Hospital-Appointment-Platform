"use client";

import { PendingAppointment, AppointmentStatus } from "../mockData";
import StatusBadge from "./StatusBadge";
import ActionButton from "./ActionButton";

interface AppointmentsTableProps {
  appointments: PendingAppointment[];
  onApprove?: (appointment: PendingAppointment) => void;
  onReschedule?: (appointment: PendingAppointment) => void;
  onRefund?: (appointment: PendingAppointment) => void;
  onView?: (appointment: PendingAppointment) => void;
}

function getActions(status: AppointmentStatus): {
  approve: boolean;
  refund: boolean;
  reschedule: boolean;
  view: boolean;
} {
  switch (status) {
    case "PENDING":
      return { approve: true, refund: true, reschedule: true, view: true };
    case "APPROVED":
      return { approve: false, refund: true, reschedule: true, view: true };
    case "REFUNDED":
    case "RESCHEDULED":
    case "EXPIRED":
    case "COMPLETED":
    case "CANCELLED":
      return { approve: false, refund: false, reschedule: false, view: true };
    default:
      return { approve: false, refund: false, reschedule: false, view: true };
  }
}

export default function AppointmentsTable({
  appointments,
  onApprove,
  onReschedule,
  onRefund,
  onView,
}: AppointmentsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Patient Name
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Doctor
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Date
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Time
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Source
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Status
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Payment
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Time Since Booking
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => {
            const actions = getActions(appointment.status);
            return (
              <tr
                key={appointment.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150"
              >
                <td className="py-4 px-4 text-sm text-gray-900">
                  {appointment.patient}
                </td>
                <td className="py-4 px-4 text-sm text-gray-700">
                  {appointment.doctor}
                </td>
                <td className="py-4 px-4 text-sm text-gray-700">
                  {new Date(appointment.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="py-4 px-4 text-sm text-gray-700">
                  {appointment.time}
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-md ${
                      appointment.source === "Web"
                        ? "bg-sky-50 text-sky-700 ring-1 ring-sky-100"
                        : appointment.source === "Operator"
                          ? "bg-slate-50 text-slate-700 ring-1 ring-slate-100"
                          : appointment.source === "APP"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                            : appointment.source === "Call Center"
                              ? "bg-amber-50 text-amber-700 ring-1 ring-amber-100"
                              : "bg-gray-50 text-gray-700 ring-1 ring-gray-100"
                    }`}
                  >
                    {appointment.source}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <StatusBadge status={appointment.status} />
                </td>
                <td className="py-4 px-4">
                  {(() => {
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
                      <span
                        className={`text-xs px-2 py-1 rounded-md ${paymentClass}`}
                      >
                        {paymentLabel}
                      </span>
                    );
                  })()}
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  {appointment.createdAt}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {actions.approve && (
                      <ActionButton
                        label="Approve"
                        variant="approve"
                        onClick={() => onApprove?.(appointment)}
                      />
                    )}
                    {actions.reschedule && (
                      <ActionButton
                        label="Reschedule"
                        variant="reschedule"
                        onClick={() => onReschedule?.(appointment)}
                      />
                    )}
                    {actions.refund && (
                      <ActionButton
                        label="Refund"
                        variant="refund"
                        onClick={() => onRefund?.(appointment)}
                      />
                    )}
                    {actions.view && (
                      <ActionButton
                        label="View"
                        variant="view"
                        onClick={() => onView?.(appointment)}
                      />
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
