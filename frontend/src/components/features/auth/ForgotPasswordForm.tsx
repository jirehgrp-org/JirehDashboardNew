// @/components/auth/ForgotPasswordForm.tsx

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import { cn } from "@/lib/utils";
import { translations } from "@/translations";
import Header from "@/components/common/Header";
import { useLanguage } from "@/components/context/LanguageContext";

export function ForgotPasswordForm() {
  const { language } = useLanguage();
  const t = translations[language].auth.forgotPassword;
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState(""); // Add state for email
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return; // Extra validation check

    setIsLoading(true);
    // Add your email validation and API call here
    setTimeout(() => {
      setIsLoading(false);
      router.push("/auth/resetPassword"); // Only navigate after successful submission
    }, 3000);
  };

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto mt-12 p-4">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
          {t.title}
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-400">
          {t.description}
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <LabelInputContainer className="mb-4">
            <Label
              htmlFor="email"
              className="text-neutral-700 dark:text-neutral-300"
            >
              {t.email}
            </Label>
            <Input
              id="email"
              placeholder={t.emailPlaceholder}
              type="email" // Changed to email type for better validation
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
            />
          </LabelInputContainer>

          <button
            className="bg-neutral-900 dark:bg-neutral-100 relative group/btn block w-full text-white dark:text-neutral-900 rounded-md h-10 font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? t.submitting : t.resetPassword}
            <BottomGradient />
          </button>
        </form>
      </div>
    </>
  );
}

const BottomGradient = () => {
  return (
    <>
      <span className="group-hover/btn:opacity-100 block transition duration-500 opacity-0 absolute h-px w-full -bottom-px inset-x-0 bg-gradient-to-r from-transparent via-cyan-500 to-transparent" />
      <span className="group-hover/btn:opacity-100 blur-sm block transition duration-500 opacity-0 absolute h-px w-1/2 mx-auto -bottom-px inset-x-10 bg-gradient-to-r from-transparent via-indigo-500 to-transparent" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn("flex flex-col space-y-2 w-full", className)}>
      {children}
    </div>
  );
};
