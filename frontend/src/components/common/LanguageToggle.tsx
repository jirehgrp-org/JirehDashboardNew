// @/components/common/LanguageToggle.tsx

"use client";
import * as React from "react";
import { Languages } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/context/LanguageContext";

const languages = [
  { code: "am", name: "አማርኛ", flag: "🇪🇹", enabled: true },
  { code: "en", name: "English", flag: "🇺🇸", enabled: true },
] as const;

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-10 w-10">
          <Languages className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => lang.enabled && setLanguage(lang.code)}
            className={`cursor-pointer ${
              !lang.enabled && "opacity-50 cursor-not-allowed"
            }`}
          >
            <span className="mr-2">{lang.flag}</span>
            {lang.name}
            {!lang.enabled && (
              <span className="ml-2 text-xs">(Coming soon)</span>
            )}
            {language === lang.code && <span className="ml-auto">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}