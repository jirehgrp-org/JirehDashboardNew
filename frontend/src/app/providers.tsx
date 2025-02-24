// @/app/providers.tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { LanguageProvider } from "@/components/context/LanguageContext";
import { AuthProvider } from "@/components/context/AuthContext";
import { type ThemeProviderProps } from "next-themes";
import { Toaster as SonnerToaster } from 'sonner';

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
      <LanguageProvider>
        <AuthProvider>
          {children}
          <SonnerToaster 
            position="bottom-right"
            expand={false}
            richColors
            closeButton
          />
        </AuthProvider>
      </LanguageProvider>
    </NextThemesProvider>
  );
}