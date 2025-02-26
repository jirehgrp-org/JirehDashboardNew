// @/app/auth/registerUser/page.tsx

import { Metadata } from "next";
import { RegisterUserForm } from "@/components/features/auth/RegisterUserForm";

export const metadata: Metadata = {
  title: "Business Setup | JirehDashboard",
};

export default function RegisterUserPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <RegisterUserForm />
    </div>
  );
}