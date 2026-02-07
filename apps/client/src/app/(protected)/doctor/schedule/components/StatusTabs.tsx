"use client";

import { useEffect, useRef, useState } from "react";

export default function StatusTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: string; label: string }[];
  active: string;
  onChange: (k: string) => void;
}) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function update() {
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    }
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [tabs]);

  function scrollBy(dir: number) {
    const el = scrollRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.6);
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  }

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

        {/* Small screens: horizontally scrollable with arrows */}
        <div className="sm:hidden flex items-center">
          <button
            aria-hidden={!canScrollLeft}
            onClick={() => scrollBy(-1)}
            className={`p-2 mr-1 rounded-md text-gray-600 hover:bg-gray-100 transition ${
              canScrollLeft ? "visible" : "invisible"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div
            ref={scrollRef}
            className="overflow-x-auto no-scrollbar flex gap-2 py-2"
          >
            {tabs.map((t) => {
              const isActive = t.key === active;
              return (
                <button
                  key={t.key}
                  onClick={() => onChange(t.key)}
                  className={`shrink-0 px-3 py-2 rounded-md text-sm whitespace-nowrap ${
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

          <button
            aria-hidden={!canScrollRight}
            onClick={() => scrollBy(1)}
            className={`p-2 ml-1 rounded-md text-gray-600 hover:bg-gray-100 transition ${
              canScrollRight ? "visible" : "invisible"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
