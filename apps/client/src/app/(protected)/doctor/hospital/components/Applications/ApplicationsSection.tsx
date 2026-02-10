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
        <h3 className="text-sm font-medium text-slate-700 mb-2">
          Pending Applications
        </h3>
        {pending.length === 0 ? (
          <div className="text-slate-600">
            You have no pending hospital requests.
          </div>
        ) : (
          <div className="bg-white border rounded-md">
            <table className="w-full text-sm">
              <thead className="text-slate-600 text-left">
                <tr>
                  <th className="px-4 py-2">Hospital</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Summary</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Submitted</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="px-4 py-2">{a.hospitalName}</td>
                    <td className="px-4 py-2">{a.type}</td>
                    <td className="px-4 py-2">{a.summary}</td>
                    <td className="px-4 py-2">{a.status}</td>
                    <td className="px-4 py-2">{a.submittedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-sm font-medium text-slate-700 mb-2">
          Application History
        </h3>
        {history.length === 0 ? (
          <div className="text-slate-600">
            No past hospital applications found.
          </div>
        ) : (
          <div className="bg-white border rounded-md">
            <table className="w-full text-sm">
              <thead className="text-slate-600 text-left">
                <tr>
                  <th className="px-4 py-2">Hospital</th>
                  <th className="px-4 py-2">Type</th>
                  <th className="px-4 py-2">Outcome</th>
                  <th className="px-4 py-2">Decision date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((a) => (
                  <tr key={a.id} className="border-t">
                    <td className="px-4 py-2">{a.hospitalName}</td>
                    <td className="px-4 py-2">{a.type}</td>
                    <td className="px-4 py-2">{a.status}</td>
                    <td className="px-4 py-2">{a.decisionAt ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
