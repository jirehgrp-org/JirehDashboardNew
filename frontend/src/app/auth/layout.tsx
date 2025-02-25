// @/app/auth/layout.tsx

import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Authentication | JirehDashboard",
  };
}

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
