"use client";

export default function AppointmentsTableSkeleton() {
  return (
    <div className="overflow-x-auto">
      <div className="w-full">
        {/* Header */}
        <div className="border-b border-gray-200 pb-3 mb-4">
          <div className="grid grid-cols-9 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div
                key={i}
                className="h-4 bg-gray-200 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </div>
        {/* Rows */}
        {Array.from({ length: 5 }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="border-b border-gray-100 py-4 animate-pulse"
          >
            <div className="grid grid-cols-9 gap-4">
              {Array.from({ length: 9 }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className={`h-4 bg-gray-200 rounded ${
                    colIndex === 8 ? "w-32" : "w-full"
                  }`}
                ></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
