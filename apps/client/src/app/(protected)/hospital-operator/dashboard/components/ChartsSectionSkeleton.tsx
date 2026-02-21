"use client";

export default function ChartsSectionSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-pulse"
        >
          <div className="h-6 bg-gray-200 rounded w-48 mb-6" />
          <div className="h-[300px] bg-gray-100 rounded-xl" />
        </div>
      ))}
    </div>
  );
}
