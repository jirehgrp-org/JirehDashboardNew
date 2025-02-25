// @/app/legal/privacy/layout.tsx

import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | JirehDashboard",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
