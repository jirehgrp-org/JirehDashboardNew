// @/components/common/ResponsiveWrapper.tsx

import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  className,
}) => {
  return (
    <div className="flex flex-1 h-full flex-col overflow-hidden">
      <div
        className={cn(
          "flex-1",
          "overflow-x-scroll",
          "overflow-y-hidden",
          "relative",
          className
        )}
      >
        <div className="min-w-[768px] h-full absolute inset-0">
          <div className="w-full h-full p-2 md:p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
