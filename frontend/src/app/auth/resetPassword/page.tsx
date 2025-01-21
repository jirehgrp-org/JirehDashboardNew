// @/app/auth/resetPassword/page.tsx

import { ResetPasswordForm } from "@/components/features/auth/ResetPasswordForm";

export default function Page() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <ResetPasswordForm />
    </div>
  );
}
