// @/app/dashboard/analytics/layout.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics | JirehDashboard",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
