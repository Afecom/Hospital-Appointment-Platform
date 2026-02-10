"use client";

export default function StatusTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: string; label: string }[];
  active: string;
  onChange: (k: string) => void;
}) {
  return (
    <div className="mb-4">
      <div className="relative">
        <div className="hidden sm:flex gap-2 border-b">
          {tabs.map((t) => {
            const isActive = t.key === active;
            return (
              <button
                key={t.key}
                onClick={() => onChange(t.key)}
                className={`px-4 py-2 -mb-px border-b-2 ${
                  isActive
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Small screens: wrap tabs so they are all visible */}
        <div className="sm:hidden flex flex-wrap gap-2 py-2">
          {tabs.map((t) => {
            const isActive = t.key === active;
            return (
              <button
                key={t.key}
                onClick={() => onChange(t.key)}
                className={`px-3 py-2 rounded-md text-sm whitespace-nowrap ${
                  isActive
                    ? "bg-blue-50 text-blue-600 font-semibold"
                    : "text-gray-600 bg-white hover:bg-gray-50"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
