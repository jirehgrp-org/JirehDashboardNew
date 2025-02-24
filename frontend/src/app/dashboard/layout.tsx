// @/app/dashboard/layout.tsx

import { Metadata } from "next";
import { RouteGuard } from "@/components/auth/RouteGuard";
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
      <RouteGuard>
        <SidebarDashboard>{children}</SidebarDashboard>
      </RouteGuard>
    </div>
  );
}
