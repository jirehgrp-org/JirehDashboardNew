// @/components/common/Header.tsx

"use client";
import React from "react";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { SignedIn, UserButton } from "@clerk/nextjs";

interface HeaderProps {
  variant?: "auth" | "dashboard";
}

const Header: React.FC<HeaderProps> = ({ variant = "auth" }) => {
  const commonRightSection = (
    <div className="flex items-center space-x-2">
      <ThemeToggle />
      <LanguageToggle />
      <SignedIn>
        <UserButton />
      </SignedIn>
    </div>
  );

  if (variant === "dashboard") {
    return (
      <div className="flex h-12 items-center justify-end bg-gray-100 dark:bg-neutral-800 px-4 md:px-6">
        <div className="flex items-center space-x-2">
          {commonRightSection}
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 w-full px-4 flex items-center justify-between z-50">
      <div className="ml-auto">{commonRightSection}</div>
    </div>
  );
};

export default Header;
