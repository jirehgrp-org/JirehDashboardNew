// @/app/dashboard/reports/layout.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reports | JirehDashboard",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
