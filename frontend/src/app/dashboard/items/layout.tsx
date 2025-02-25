// @/app/dashboard/items/layout.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Items | JirehDashboard",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
