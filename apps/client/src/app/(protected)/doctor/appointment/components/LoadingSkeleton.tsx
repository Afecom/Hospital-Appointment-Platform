import React from "react";

export default function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="w-48 h-4 bg-gray-200 rounded animate-pulse" />
          <div className="w-32 h-3 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      {/* Snapshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="h-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-16 bg-gray-200 rounded animate-pulse" />
        <div className="h-16 bg-gray-200 rounded animate-pulse" />
      </div>

      <main>
        {/* Today's Appointments */}
        <section className="mb-6">
          <div className="w-40 h-5 bg-gray-200 rounded animate-pulse mb-3" />
          <div className="space-y-3">
            <div className="h-12 bg-white/60 border rounded p-3 animate-pulse" />
            <div className="h-12 bg-white/60 border rounded p-3 animate-pulse" />
            <div className="h-12 bg-white/60 border rounded p-3 animate-pulse" />
          </div>
        </section>

        {/* Details */}
        <section className="mb-6">
          <div className="w-24 h-5 bg-gray-200 rounded animate-pulse mb-3" />
          <div className="h-32 bg-white/60 border rounded p-4 animate-pulse" />
        </section>

        {/* Upcoming */}
        <section className="mb-6">
          <div className="w-24 h-5 bg-gray-200 rounded animate-pulse mb-3" />
          <div className="space-y-4">
            <div className="h-10 bg-white/60 border rounded p-3 animate-pulse" />
            <div className="h-10 bg-white/60 border rounded p-3 animate-pulse" />
          </div>
        </section>

        {/* Past */}
        <section className="mb-6">
          <div className="w-20 h-5 bg-gray-200 rounded animate-pulse mb-3" />
          <div className="space-y-3">
            <div className="h-10 bg-white/60 border rounded p-3 animate-pulse" />
            <div className="h-10 bg-white/60 border rounded p-3 animate-pulse" />
            <div className="h-10 bg-white/60 border rounded p-3 animate-pulse" />
          </div>
        </section>
      </main>
    </div>
  );
}
