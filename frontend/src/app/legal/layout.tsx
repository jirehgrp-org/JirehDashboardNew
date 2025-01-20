// @/app/legal/layout.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legal Documentations | JirehDashboard",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      {children}
    </div>
  );
}
