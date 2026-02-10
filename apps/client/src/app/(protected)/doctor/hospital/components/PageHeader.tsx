"use client";

import React from "react";

type Props = {
  onOpenApply: () => void;
};

export default function PageHeader({ onOpenApply }: Props) {
  return (
    <header className="mb-6">
      <div className="flex flex-wrap gap-4 items-start justify-between">
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
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
          >
            Apply to a Hospital
          </button>
        </div>
      </div>
    </header>
  );
}
