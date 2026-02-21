"use client";

export default function TimelineSectionSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 animate-pulse"
        >
          <div className="h-6 bg-gray-200 rounded w-40 mb-5" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((__, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-3">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="w-2 h-2 rounded-full bg-gray-200" />
                <div className="h-4 bg-gray-200 rounded flex-1" />
                <div className="h-5 bg-gray-200 rounded w-16" />
                <div className="h-6 bg-gray-200 rounded-full w-24" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
