"use client";

import React from "react";

type Props = {
  onOpenApply: () => void;
};

export default function PageHeader({ onOpenApply }: Props) {
  return (
    <header className="mb-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            My Hospitals
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage your hospital affiliations and submit requests for changes.
          </p>
        </div>
        <div>
          <button
            onClick={onOpenApply}
            className="inline-flex items-center px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 focus:outline-none"
          >
            Apply to a Hospital
          </button>
        </div>
      </div>
    </header>
  );
}
