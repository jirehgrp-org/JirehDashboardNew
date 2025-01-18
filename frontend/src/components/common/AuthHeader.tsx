"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import { LanguageToggle } from "@/components/common/LanguageToggle";

const AuthHeader: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed top-4 right-4 flex items-center space-x-2 z-50">
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="rounded-md p-2 hover:bg-accent"
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>
      <LanguageToggle />
    </div>
  );
};

export default AuthHeader;
