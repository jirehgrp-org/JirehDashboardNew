// @/app/auth/login/page.tsx

import { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";
import Header from "@/components/common/Header";

export const metadata: Metadata = {
  title: "Login | Latika Bakery",
};

export default function LoginPage() {
  return (
    <>
      <Header />
      <div className="flex h-screen items-center justify-center">
        <SignIn
          path="/auth/login"
          routing="path"
          signUpUrl="/auth/signup"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </>
  );
}