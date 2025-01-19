// @/components/auth/LoginForm.tsx

"use client";
import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { translations } from "@/translations/auth";
import AuthHeader from "@/components/common/AuthHeader";
import { useLanguage } from "@/components/context/LanguageContext";

export function LoginForm() {
  const { language } = useLanguage();
  const t = translations[language].login;
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log("Form submitted");
    }, 3000);
  };

  return (
    <>
      <AuthHeader />
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
              {t.usernameOrPhone}
            </Label>
            <Input
              id="email"
              placeholder={t.usernamePlaceholder}
              type="text"
              disabled={isLoading}
              className="border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-8">
            <Label
              htmlFor="password"
              className="text-neutral-700 dark:text-neutral-300"
            >
              {t.password}
            </Label>
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              disabled={isLoading}
              className="border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
            />
          </LabelInputContainer>

          <button
            className="bg-neutral-900 dark:bg-neutral-100 relative group/btn block w-full text-white dark:text-neutral-900 rounded-md h-10 font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? t.loggingIn : t.login}
            <BottomGradient />
          </button>

          <div className="bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent my-8 h-[1px] w-full" />

          <div className="text-center space-y-4">
            <div>
              <a
                href="./forgotPassword"
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-800 dark:hover:text-neutral-200 hover:underline text-sm"
              >
                {t.forgotPassword}
              </a>
            </div>
            <div className="text-neutral-600 dark:text-neutral-400">
              <span>{t.noAccount}</span>
              <a
                href="./register"
                className="text-neutral-800 dark:text-neutral-200 font-medium ml-1 hover:underline"
              >
                {t.register}
              </a>
            </div>
          </div>
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
