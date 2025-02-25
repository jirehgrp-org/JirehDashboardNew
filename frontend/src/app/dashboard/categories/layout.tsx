// @/app/dashboard/categories/layout.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Categories | JirehDashboard",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
