"use client";

import { PendingAppointment } from "../mockData";
import StatusBadge from "./StatusBadge";
import ActionButton from "./ActionButton";

interface AppointmentsTableProps {
  appointments: PendingAppointment[];
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
              Time Since Booking
            </th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment) => (
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
                      : "bg-gray-50 text-gray-700"
                  }`}
                >
                  {appointment.source}
                </span>
              </td>
              <td className="py-4 px-4">
                <StatusBadge status={appointment.status} />
              </td>
              <td className="py-4 px-4 text-sm text-gray-500">
                {appointment.createdAt}
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-2 flex-wrap">
                  {appointment.status === "PENDING" && (
                    <ActionButton label="Approve" variant="approve" />
                  )}
                  {appointment.status === "RESCHEDULE_REQUESTED" && (
                    <ActionButton label="Reschedule" variant="reschedule" />
                  )}
                  {appointment.status === "REFUND_REQUESTED" && (
                    <ActionButton label="Refund" variant="refund" />
                  )}
                  <ActionButton label="View" variant="view" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
