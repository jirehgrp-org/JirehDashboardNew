// @/app/auth/login/page.tsx

import { Metadata } from "next";
import { SubscriptionForm } from "@/components/features/auth/SubscriptionForm";

export const metadata: Metadata = {
  title: "Subscription | JirehDashboard",
};

export default function SubscriptionPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <SubscriptionForm />
    </div>
  );
}
