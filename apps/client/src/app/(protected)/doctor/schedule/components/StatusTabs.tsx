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
      <div className="flex gap-2 border-b">
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
    </div>
  );
}
