// @/components/common/LanguageContext.tsx

"use client";

import { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "am";

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("jireh-language");
      return savedLanguage === "en" ||
        savedLanguage === "am" ||
        savedLanguage === "or"
        ? (savedLanguage as Language)
        : "en";
    }
    return "en";
  });

  useEffect(() => {
    localStorage.setItem("jireh-language", language);
    // Set the lang attribute on the html tag
    document.documentElement.lang = language;
  }, [language]);

  // Handle hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div lang={language}>
      <LanguageContext.Provider value={{ language, setLanguage }}>
        {children}
      </LanguageContext.Provider>
    </div>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context)
    throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};
