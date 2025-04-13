"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";
import { SignedIn, UserButton } from "@clerk/nextjs";

interface HeaderProps {
  variant?: "auth" | "dashboard";
}

const Header: React.FC<HeaderProps> = ({ variant = "auth" }) => {
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = translations[language];
  const isSubscriptionPage = pathname === "/auth/subscription";

  const commonRightSection = (
    <div className="flex items-center space-x-2">
      <ThemeToggle />
      <LanguageToggle />
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
      {isSubscriptionPage && (
        <Link href="/auth/signup">
          <Button variant="ghost" className="gap-2">
            <MoveLeft className="h-5 w-5" />
            {t.auth.subscription.page.back}
          </Button>
        </Link>
      )}
      <div className="ml-auto">{commonRightSection}</div>
    </div>
  );
};

export default Header;
