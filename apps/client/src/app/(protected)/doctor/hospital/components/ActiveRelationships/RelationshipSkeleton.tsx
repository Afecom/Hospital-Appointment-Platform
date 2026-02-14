"use client";

import React from "react";

export default function RelationshipSkeleton() {
  return (
    <div className="bg-white shadow-sm border border-slate-100 rounded-lg p-5 animate-pulse">
      <div className="flex items-start justify-between">
        <div className="w-3/4">
          <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>
        <div className="w-24 h-4 bg-gray-200 rounded" />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
        <div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-6 bg-gray-200 rounded w-20" />
        </div>
        <div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-6 bg-gray-200 rounded w-24" />
        </div>
        <div>
          <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
          <div className="h-6 bg-gray-200 rounded w-20" />
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="h-8 w-48 bg-gray-200 rounded" />
      </div>
    </div>
  );
}
