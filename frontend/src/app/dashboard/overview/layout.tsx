// @/app/dashboard/overview/layout.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Overview | JirehDashboard",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
