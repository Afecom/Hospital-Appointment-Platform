"use client";

export default function DoctorOperationalCardSkeleton() {
  return (
    <div className="relative w-full bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-pulse">

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="h-5 w-40 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-100" />
        </div>
        <div className="h-6 w-20 rounded-full bg-gray-100" />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-gray-50 p-3 space-y-2">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-4 w-16 rounded bg-gray-200" />
        </div>
        <div className="rounded-xl bg-gray-50 p-3 space-y-2">
          <div className="h-3 w-20 rounded bg-gray-200" />
          <div className="h-4 w-12 rounded bg-gray-200" />
        </div>
        <div className="rounded-xl bg-gray-50 p-3 space-y-2">
          <div className="h-3 w-12 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-3 w-20 rounded bg-gray-100" />
        </div>
        <div className="rounded-xl bg-gray-50 p-3 space-y-2">
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="h-4 w-16 rounded bg-gray-200" />
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-3 w-16 rounded bg-gray-200" />
          <div className="h-3 w-8 rounded bg-gray-200" />
        </div>
        <div className="h-2.5 rounded-full bg-gray-100" />
      </div>
    </div>
  );
}
