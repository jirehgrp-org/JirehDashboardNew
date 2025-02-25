// @/app/auth/forgotPassword/page.tsx

import { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/features/auth/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | JirehDashboard",
};

export default function Page() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <ForgotPasswordForm />
    </div>
  );
}
