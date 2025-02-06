// @/components/layout/shared/Dashboard.tsx

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // Import useRouter from next/navigation

const Dashboard = () => {
  const router = useRouter(); // Initialize the router

  // Redirect to /dashboard/overview on component mount
  useEffect(() => {
    router.push("/dashboard/overview");
  }, [router]);

  // Render nothing (or a loading state if desired)
  return null;
};

export default Dashboard;