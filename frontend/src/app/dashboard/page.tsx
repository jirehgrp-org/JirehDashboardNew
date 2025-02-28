// @/components/layout/shared/Dashboard.tsx

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter(); // Initialize the router

  useEffect(() => {
    router.push("/dashboard/overview");
  }, [router]);

  return null;
};

export default Dashboard;