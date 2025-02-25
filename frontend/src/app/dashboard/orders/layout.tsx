// @/app/dashboard/orders/layout.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders | JirehDashboard",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
