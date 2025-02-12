import React from "react";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/shared/useResponsive";

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  className,
}) => {
  const { isMobile } = useResponsive();

  if (isMobile) {
    return (
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="h-full w-full p-2 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          <div className={cn("space-y-4", className)}>{children}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 h-full flex-col overflow-hidden">
      <div
        className={cn(
          "flex-1 overflow-x-auto overflow-y-auto relative",
          className
        )}
      >
        <div className="min-w-[768px] h-full absolute inset-0">
          <div className="w-full min-h-full p-10 rounded-tl-2xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 flex flex-col gap-4">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
