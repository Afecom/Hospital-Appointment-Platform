"use client";
import React, { useRef, useState, useEffect } from "react";

interface Tab {
  label: string;
  value: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string | undefined;
  onTabClick: (tab: string) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabClick }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = containerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  useEffect(() => {
    updateScrollState();
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => updateScrollState();
    window.addEventListener("resize", updateScrollState);
    el.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("resize", updateScrollState);
      el.removeEventListener("scroll", onScroll);
    };
  }, [tabs]);

  const scrollBy = (distance: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: distance, behavior: "smooth" });
  };

  return (
    <div className="relative border-b">
      {canScrollLeft && (
        <button
          aria-label="Scroll tabs left"
          onClick={() => scrollBy(-200)}
          className="absolute left-0 top-0 h-full z-10 px-2 bg-linear-to-r from-white/80 dark:from-black/60"
        >
          ‹
        </button>
      )}

      <div
        ref={containerRef}
        className="overflow-x-auto whitespace-nowrap hide-scrollbar"
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={`inline-block px-4 py-2 text-sm font-medium ${
              activeTab === tab.value
                ? "border-b-2 border-secondary text-secondary"
                : "text-gray-500 hover:text-blue-950 hover:border-b-2 hover:border-blue-950 transition-all hover:cursor-pointer"
            }`}
            onClick={() => onTabClick(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {canScrollRight && (
        <button
          aria-label="Scroll tabs right"
          onClick={() => scrollBy(200)}
          className="absolute right-0 top-0 h-full z-10 px-2 bg-linear-to-l from-white/80 dark:from-black/60"
        >
          ›
        </button>
      )}
    </div>
  );
};

export default Tabs;
