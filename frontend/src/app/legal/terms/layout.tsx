// @/app/legal/terms/layout.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | JirehDashboard",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
