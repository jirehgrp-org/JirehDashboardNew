import React from "react";
import { cn } from "@/lib/utils";
import { useResponsive } from "@/hooks/shared/useResponsive";
import Header from "./Header";

interface MobileWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export const MobileWrapper: React.FC<MobileWrapperProps> = ({
  children,
  className,
}) => {
  const { isMobile } = useResponsive();

  if (!isMobile) {
    return (
      <>
        <Header />
        {children}
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <div className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-neutral-900">
        <Header />
      </div>
      <div className="absolute top-16 left-0 right-0 overflow-y-auto pb-8 flex justify-center">
        <div
          className={cn(
            "w-full max-w-sm mx-auto", // Centered horizontally, adjustable width
            "px-2", // Slightly tighter padding
            "transition-all duration-200 ease-in-out",
            "scale-[0.95]",
            "origin-top",
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
