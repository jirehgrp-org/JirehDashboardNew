// @/app/dashboard/layout.tsx

import { Metadata } from "next";
import { SidebarDashboard } from "@/components/layout/dashboard/Sidebar";

export const metadata: Metadata = {
  title: "Dashboard | JirehDashboard",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen flex">
      <SidebarDashboard>{children}</SidebarDashboard>
    </div>
  );
}
