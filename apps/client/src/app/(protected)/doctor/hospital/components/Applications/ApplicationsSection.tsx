"use client";

import React from "react";

type Application = {
  id: string;
  hospitalName: string;
  type: string;
  summary?: string;
  status: string;
  submittedAt: string;
  decisionAt?: string;
};

type Props = {
  pending: Application[];
  history: Application[];
};

export default function ApplicationsSection({ pending, history }: Props) {
  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-800 mb-4">
        Relationship Applications
      </h2>

      <div className="mb-6">
        <h3 className="text-sm font-medium text-slate-700 mb-3">
          Pending Applications
        </h3>
        {pending.length === 0 ? (
          <div className="text-slate-600">
            You have no pending hospital requests.
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((a) => (
              <div
                key={a.id}
                className="bg-white border border-slate-100 rounded-md p-4 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {a.hospitalName}
                  </div>
                  <div className="text-sm text-slate-600">
                    {a.type} · {a.summary}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-700">{a.status}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {a.submittedAt}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-700 mb-3">
          Application History
        </h3>
        {history.length === 0 ? (
          <div className="text-slate-600">
            No past hospital applications found.
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((a) => (
              <div
                key={a.id}
                className="bg-white border border-slate-100 rounded-md p-4 flex items-center justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-slate-900">
                    {a.hospitalName}
                  </div>
                  <div className="text-sm text-slate-600">{a.type}</div>
                </div>
                <div className="text-right text-sm text-slate-700">
                  <div>{a.status}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {a.decisionAt ?? "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
