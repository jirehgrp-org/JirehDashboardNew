// @/app/dashboard/branches/layout.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Branches | JirehDashboard",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
