// @/app/dashboard/expenses/layout.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Expenses | JirehDashboard",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
