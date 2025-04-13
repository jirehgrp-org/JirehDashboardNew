// @/app/auth/registerBusiness/page.tsx

import { Metadata } from "next";
import { RegisterBusinessForm } from "@/components/features/auth/RegisterBusinessForm";

export const metadata: Metadata = {
  title: "Register Business | JirehDashboard",
};

export default function RegisterBusinessPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center px-4">
      <RegisterBusinessForm />
    </div>
  );
}
