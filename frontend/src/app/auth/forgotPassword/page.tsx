// @/app/auth/forgotPassword/page.tsx

import { ForgotPasswordForm } from "@/components/features/auth/ForgotPasswordForm";

export default function Page() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <ForgotPasswordForm />
    </div>
  );
}
