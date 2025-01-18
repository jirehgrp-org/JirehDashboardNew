"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { LanguageProvider } from "@/components/context/LanguageContext";
import { type ThemeProviderProps } from "next-themes";

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="jireh-theme"
      {...props}
    >
      <LanguageProvider>{children}</LanguageProvider>
    </NextThemesProvider>
  );
}
