"use client";
import React from "react";

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
  return (
    <div className="flex border-b">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={`px-4 py-2 text-sm font-medium ${
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
  );
};

export default Tabs;
