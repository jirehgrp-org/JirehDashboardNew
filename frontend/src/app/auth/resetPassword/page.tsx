// @/app/auth/resetPassword/page.tsx

import { Metadata } from "next";
import { ResetPasswordForm } from "@/components/features/auth/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | JirehDashboard",
};

export default function Page() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <ResetPasswordForm />
    </div>
  );
}
