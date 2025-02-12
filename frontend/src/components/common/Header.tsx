// @/components/common/Header.tsx
"use client";

import React from "react";
import { LanguageToggle } from "@/components/common/LanguageToggle";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { MoveLeft } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";

const Header: React.FC = () => {
  const pathname = usePathname();
  const { language } = useLanguage();
  const t = translations[language].auth.subscription;
  const isSubscriptionPage = pathname === "/auth/subscription";

  return (
    <div className="fixed top-4 w-full px-4 flex items-center justify-between z-50">
      {isSubscriptionPage && (
        <Link href="/auth/register">
          <Button variant="ghost" className="gap-2">
            <MoveLeft className="h-5 w-5" />
            {t.page.back}
          </Button>
        </Link>
      )}
      <div className="ml-auto flex items-center space-x-2">
        <ThemeToggle />
        <LanguageToggle />
      </div>
    </div>
  );
};

export default Header;