// @/app/dashboard/salesReport/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sales Report | JirehDashboard",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
