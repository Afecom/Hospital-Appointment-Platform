"use client";

import React, { useState, useTransition } from "react";
import ConfirmationModal from "../shared/ui/ConfirmationModal";
import { scheduleApplicationSchedule } from "@hap/contract";
import { useRouter } from "next/navigation";
import { useToast } from "@/context/ToastContext";

const dayNumberToName = (dayNumber: number): string => {
  const days = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
  return days[dayNumber] || "";
};

type Action = {
  key: string;
  label: string;
  onClick?: () => Promise<void> | void;
  className?: string;
  requiresConfirmation?: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
  endpoint?: string;
  method?: string;
};

const ScheduleCard: React.FC<{
  schedule: scheduleApplicationSchedule;
  actions?: Action[];
}> = ({ schedule, actions = [] }) => {
  const [pendingMap, setPendingMap] = useState<Record<string, boolean>>({});
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean;
    actionKey: string | null;
  }>({ isOpen: false, actionKey: null });
  const [isPendingTransition, startTransition] = useTransition();
  const router = useRouter();

  const { addToast } = useToast();

  const runAction = async (action: Action) => {
    setPendingMap((s) => ({ ...s, [action.key]: true }));
    try {
      if (action.onClick) {
        await Promise.resolve(action.onClick());
        addToast({ type: "success", message: `${action.label} successful!` });
      } else if (action.endpoint) {
        const res = await fetch(action.endpoint, {
          method: action.method ?? "PATCH",
          credentials: "include",
        });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`Request failed: ${res.status} ${text}`);
        }
        startTransition(() => router.refresh());
        addToast({ type: "success", message: `${action.label} successful!` });
      }
    } catch (err) {
      console.error(`Action ${action.key} failed`, err);
      const message = err instanceof Error ? err.message : String(err);
      addToast({
        type: "error",
        message: `${action.label} failed: ${message}`,
      });
    } finally {
      setPendingMap((s) => ({ ...s, [action.key]: false }));
    }
  };

  const handleActionClick = (action: Action) => {
    if (action.requiresConfirmation) {
      setConfirmState({ isOpen: true, actionKey: action.key });
      return;
    }
    runAction(action);
  };

  const handleConfirm = async () => {
    const key = confirmState.actionKey;
    if (!key) return;
    const action = effectiveActions.find((a) => a.key === key);
    if (action) await runAction(action);
    setConfirmState({ isOpen: false, actionKey: null });
  };

  const defaultActions: Action[] = [];
  if ((!actions || actions.length === 0) && schedule?.id) {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL;
    defaultActions.push(
      {
        key: `approve-${schedule.id}`,
        label: "Approve",
        endpoint: `${apiBaseUrl || ""}/schedule/approve/${schedule.id}`,
        className: "bg-secondary hover:bg-blue-950 hover:cursor-pointer",
      },
      {
        key: `reject-${schedule.id}`,
        label: "Reject",
        endpoint: `${apiBaseUrl || ""}/schedule/reject/${schedule.id}`,
        className: "bg-red-600 hover:bg-red-800 hover:cursor-pointer",
        requiresConfirmation: true,
        confirmTitle: "Confirm Reject",
        confirmMessage: "Are you sure you want to reject this schedule?",
      },
    );
  }

  const effectiveActions = actions.length > 0 ? actions : defaultActions;

  return (
    <>
      <div className="bg-white shadow-md rounded-lg p-4 flex flex-col">
        <div className="mb-3">
          <p className="font-bold text-md">
            Dr. {schedule?.Doctor?.User?.fullName}
          </p>
          <p className="text-gray-500 text-sm">
            {schedule?.Doctor?.User?.phoneNumber}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
          <div>
            <p className="text-gray-500">Status</p>
            <p className="font-semibold">{schedule?.status}</p>
          </div>
          <div>
            <p className="text-gray-500">Type</p>
            <p className="font-semibold">{schedule?.type}</p>
          </div>
          <div>
            <p className="text-gray-500">Period</p>
            <p className="font-semibold">{schedule?.period}</p>
          </div>
          <div>
            <p className="text-gray-500">Start Date</p>
            <p className="font-semibold">
              {schedule?.startDate}{" "}
              {schedule?.endDate ? `to ${schedule.endDate}` : ""}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-500">Time</p>
            <p className="font-semibold">
              {schedule?.startTime}{" "}
              {schedule?.endTime ? `- ${schedule.endTime}` : ""}
            </p>
          </div>
        </div>
        {Array.isArray(schedule?.dayOfWeek) && (
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-1">Days of Week</p>
            <div className="flex flex-wrap gap-1">
              {schedule.dayOfWeek.map((day: number) => (
                <span
                  key={day}
                  className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full"
                >
                  {dayNumberToName(day)}
                </span>
              ))}
            </div>
          </div>
        )}
        <div className="flex justify-end space-x-2 mt-auto">
          {effectiveActions.map((action) => (
            <button
              key={action.key}
              className={`${action.className ?? "bg-secondary hover:bg-blue-950"} transition-all text-white font-bold py-1 px-3 text-sm rounded`}
              onClick={() => handleActionClick(action)}
              disabled={!!pendingMap[action.key]}
            >
              {pendingMap[action.key] ? `${action.label}ing...` : action.label}
            </button>
          ))}
        </div>
      </div>

      <ConfirmationModal
        isOpen={confirmState.isOpen}
        onClose={() => setConfirmState({ isOpen: false, actionKey: null })}
        onConfirm={handleConfirm}
        title={
          effectiveActions.find((a) => a.key === confirmState.actionKey)
            ?.confirmTitle ?? "Please confirm"
        }
        message={
          effectiveActions.find((a) => a.key === confirmState.actionKey)
            ?.confirmMessage ?? "Are you sure?"
        }
        isPending={
          !!(confirmState.actionKey && pendingMap[confirmState.actionKey])
        }
      />
    </>
  );
};

export default ScheduleCard;
