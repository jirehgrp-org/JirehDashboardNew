// @/app/auth/register/page.tsx

import { Metadata } from "next";
import { SignUp } from "@clerk/nextjs";
import Header from "@/components/common/Header";

export const metadata: Metadata = {
  title: "Sign Up | Latika Bakery",
};

export default function SignUpPage() {
  return (
    <>
      <Header />
      <div className="flex h-screen items-center justify-center">
        <SignUp 
          path="/auth/signup"
          routing="path"
          signInUrl="/auth/login"
          forceRedirectUrl="/dashboard"
        />
      </div>
    </>
  );
}