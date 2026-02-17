"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { DoctorOperationalRow } from "./DoctorCard";
import StatusBadge from "./StatusBadge";
import { formatTimeLabel, SortDir } from "../utils";

export type DoctorSortKey = "name" | "utilizationPct" | "availableSlots";

function SortIcon({ activeDir }: { activeDir: SortDir | null }) {
  if (!activeDir) return <span className="text-gray-300">—</span>;
  return activeDir === "asc" ? (
    <ArrowUp className="w-4 h-4" />
  ) : (
    <ArrowDown className="w-4 h-4" />
  );
}

function ThButton({
  label,
  activeDir,
  onClick,
}: {
  label: string;
  activeDir: SortDir | null;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 hover:text-gray-900 transition-colors"
    >
      <span>{label}</span>
      <span className="text-gray-500">
        <SortIcon activeDir={activeDir} />
      </span>
    </button>
  );
}

export default function DoctorTable({
  rows,
  sortKey,
  sortDir,
  onChangeSort,
  onViewDetails,
}: {
  rows: DoctorOperationalRow[];
  sortKey: DoctorSortKey;
  sortDir: SortDir;
  onChangeSort: (key: DoctorSortKey) => void;
  onViewDetails: (doctorId: string) => void;
}) {
  const activeDirFor = (key: DoctorSortKey) => (sortKey === key ? sortDir : null);

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Doctors — Operational View</h3>
        <p className="text-sm text-gray-500 mt-1">
          Sort and scan workload, capacity, and next available times
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                <ThButton
                  label="Doctor"
                  activeDir={activeDirFor("name")}
                  onClick={() => onChangeSort("name")}
                />
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Specialty
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Working Hours
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                Total Slots
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                Booked
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                <ThButton
                  label="Available"
                  activeDir={activeDirFor("availableSlots")}
                  onClick={() => onChangeSort("availableSlots")}
                />
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                <ThButton
                  label="Utilization"
                  activeDir={activeDirFor("utilizationPct")}
                  onClick={() => onChangeSort("utilizationPct")}
                />
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Next Available
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const disabled = row.isDisabled;
              return (
                <tr
                  key={row.doctor.id}
                  className={`border-b border-gray-100 transition-colors duration-150 ${
                    disabled ? "bg-gray-50/70" : "hover:bg-gray-50"
                  }`}
                >
                  <td className="py-4 px-4 text-sm text-gray-900 font-medium">
                    {row.doctor.name}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">{row.doctor.specialty}</td>
                  <td className="py-4 px-4">
                    <StatusBadge kind="doctor" status={row.doctor.status} />
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">{row.workingHoursLabel}</td>
                  <td className="py-4 px-4 text-sm text-gray-700 text-right">
                    {row.totalSlots}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700 text-right">
                    {row.bookedSlots}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900 text-right font-medium">
                    {row.availableSlots}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-900 text-right font-medium">
                    {row.utilizationPct}%
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-700">
                    {row.nextAvailableSlot ? formatTimeLabel(row.nextAvailableSlot) : "—"}
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onViewDetails(row.doctor.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-150 ring-1 ${
                        disabled
                          ? "bg-gray-50 text-gray-600 hover:bg-gray-100 ring-gray-200"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100 ring-gray-200"
                      }`}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

