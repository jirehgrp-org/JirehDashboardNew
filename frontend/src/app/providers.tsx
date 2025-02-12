// @/app/providers.tsx
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
      disableTransitionOnChange={false}
      storageKey="jireh-theme"
      themes={["light", "dark", "system"]}
      value={{
        light: "light",
        dark: "dark",
        system: "system",
      }}
      {...props}
    >
      <LanguageProvider>{children}</LanguageProvider>
    </NextThemesProvider>
  );
}
