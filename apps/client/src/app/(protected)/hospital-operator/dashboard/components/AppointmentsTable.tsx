"use client";

import { PendingAppointment, AppointmentStatus } from "../mockData";
import StatusBadge from "./StatusBadge";
import ActionButton from "./ActionButton";

interface AppointmentsTableProps {
  appointments: PendingAppointment[];
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
                        ? "bg-blue-50 text-blue-700"
                        : appointment.source === "Operator"
                          ? "bg-gray-50 text-gray-700"
                          : appointment.source === "APP"
                            ? "bg-green-50 text-green-700"
                            : appointment.source === "Call Center"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-gray-50 text-gray-700"
                    }`}
                  >
                    {appointment.source}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <StatusBadge status={appointment.status} />
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`text-xs px-2 py-1 rounded-md ${
                      appointment.isFree
                        ? "bg-green-50 text-green-700 ring-1 ring-green-100"
                        : "bg-gray-50 text-gray-700 ring-1 ring-gray-100"
                    }`}
                  >
                    {appointment.isFree ? "Free" : "Paid"}
                  </span>
                </td>
                <td className="py-4 px-4 text-sm text-gray-500">
                  {appointment.createdAt}
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    {actions.approve && (
                      <ActionButton label="Approve" variant="approve" />
                    )}
                    {actions.reschedule && (
                      <ActionButton label="Reschedule" variant="reschedule" />
                    )}
                    {actions.refund && (
                      <ActionButton label="Refund" variant="refund" />
                    )}
                    {actions.view && (
                      <ActionButton label="View" variant="view" />
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
