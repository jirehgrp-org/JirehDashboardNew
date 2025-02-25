// @/app/dashboard/profitLoss/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profit & Loss | JirehDashboard",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
