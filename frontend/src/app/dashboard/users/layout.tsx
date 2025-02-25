// @/app/dashboard/users/layout.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users | JirehDashboard",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
