// @/components/layout/shared/Dashboard.tsx

"use client";
import React from "react";
import DashboardHeader from "@/components/common/DashboardHeader";

const Dashboard = () => {
  return (
    <div className="flex flex-1 h-full flex-col">
      <DashboardHeader variant="dashboard" />

      {/* dashboard content */}
      <div className="flex flex-1 h-full">
        <div className="p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-2 flex-1">
          <div className="flex gap-2">
            {[...Array(4)].map((_, index) => (
              <div
                key={`first-row-${index}`}
                className="h-20 w-full rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse"
              ></div>
            ))}
          </div>
          <div className="flex gap-2 flex-1">
            {[...Array(2)].map((_, index) => (
              <div
                key={`second-row-${index}`}
                className="h-full w-full rounded-lg bg-gray-100 dark:bg-neutral-800 animate-pulse"
              ></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;