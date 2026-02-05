"use client";
import StatusBadge, { Status } from "./StatusBadge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faPause, faTrash } from "@fortawesome/free-solid-svg-icons";

export default function ScheduleCard({
  schedule,
  onEdit,
  onDeactivate,
  onDelete,
}: {
  schedule: {
    id: string;
    hospital: string;
    type: string;
    startDate: string;
    endDate?: string;
    period: string;
    startTime: string;
    endTime: string;
    status: Status;
  };
  onEdit: (s: any) => void;
  onDeactivate: (s: any) => void;
  onDelete: (s: any) => void;
}) {
  const s = schedule;
  function formatDateRange() {
    if (s.endDate && s.endDate !== s.startDate)
      return `${s.startDate} — ${s.endDate}`;
    return s.startDate;
  }
  function formatTimeRange() {
    return `${s.startTime} - ${s.endTime}`;
  }

  return (
    <div className="flex items-center justify-between rounded-lg p-4 bg-white shadow-md hover:shadow-lg transition-transform transition-shadow transform duration-150 ease-in-out hover:-translate-y-1 hover:shadow-xl">
      <div>
        <div className="text-sm text-gray-500">{s.hospital}</div>
        <div className="font-medium text-gray-800">{formatDateRange()}</div>
        <div className="mt-1 flex items-center gap-3">
          <span className="inline-block mr-2 px-2 py-1 rounded-full bg-indigo-50 text-sm text-indigo-700">
            {s.type === "one_time"
              ? "One-time"
              : s.type.charAt(0).toUpperCase() + s.type.slice(1)}
          </span>
          <span className="inline-block mr-2 px-2 py-1 rounded-full bg-gray-100 text-sm text-gray-700">
            {s.period.charAt(0).toUpperCase() + s.period.slice(1)}
          </span>
          <span className="text-sm text-gray-600">{formatTimeRange()}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <StatusBadge status={s.status} />

        <div className="flex items-center gap-2">
          <button
            aria-label={`Edit schedule ${s.id}`}
            title="Edit"
            className="p-2 rounded text-gray-600 hover:text-blue-600 hover:bg-gray-50 transform transition duration-150 ease-in-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-blue-100 focus:outline-none"
            onClick={() => onEdit(s)}
          >
            <FontAwesomeIcon icon={faPen} />
          </button>

          <button
            aria-label={`Deactivate schedule ${s.id}`}
            title={
              s.status === "approved"
                ? "Deactivate"
                : "Only approved schedules can be deactivated"
            }
            onClick={() => s.status === "approved" && onDeactivate(s)}
            disabled={s.status !== "approved"}
            className={`p-2 rounded ${s.status !== "approved" ? "opacity-40 cursor-not-allowed text-gray-400" : "text-gray-600 hover:bg-gray-50"}`}
          >
            <FontAwesomeIcon icon={faPause} />
          </button>

          <button
            aria-label={`Delete schedule ${s.id}`}
            title={
              s.status === "pending" || s.status === "rejected"
                ? "Delete"
                : "Only pending or rejected schedules can be deleted"
            }
            onClick={() =>
              (s.status === "pending" || s.status === "rejected") && onDelete(s)
            }
            disabled={!(s.status === "pending" || s.status === "rejected")}
            className={`p-2 rounded ${s.status === "pending" || s.status === "rejected" ? "text-gray-600 hover:text-red-600 hover:bg-gray-50 transform transition duration-150 ease-in-out hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-red-100 focus:outline-none" : "opacity-40 cursor-not-allowed text-gray-400"}`}
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
        </div>
      </div>
    </div>
  );
}
