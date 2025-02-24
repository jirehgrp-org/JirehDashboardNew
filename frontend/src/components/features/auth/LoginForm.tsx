/* eslint-disable @typescript-eslint/no-explicit-any */
// @/components/auth/LoginForm.tsx

"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeClosed } from "lucide-react";
import { translations } from "@/translations";
import Header from "@/components/common/Header";
import { useLanguage } from "@/components/context/LanguageContext";
import type { LoginCredentials } from "@/types/shared/auth";
import { useAuth } from "@/hooks/shared/useAuth";

export function LoginForm() {
  const { login } = useAuth();
  const router = useRouter();
  const { language } = useLanguage();
  const t = translations[language].auth.login;
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
  
    try {
      await login(credentials);
      // Successful login will redirect to dashboard via middleware
      router.push("/dashboard");
    } catch (err: any) {
      setError(
        err.response?.data?.detail || 
        err.response?.data?.message || 
        "Invalid credentials. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCredentials({
      ...credentials,
      [e.target.id]: e.target.value,
    });
  };

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto mt-12 p-4">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
          {t.title}
        </h2>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md mt-4">
            {error}
          </div>
        )}
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
              id="username"
              value={credentials.username}
              onChange={handleInputChange}
              placeholder={t.usernameOrPhonePlaceholder}
              type="text"
              disabled={isLoading}
            />
          </LabelInputContainer>
          <LabelInputContainer className="mb-4">
            <Label htmlFor="password">{t.password}</Label>
            <div className="relative">
              <Input
                id="password"
                value={credentials.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-300"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeClosed className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </LabelInputContainer>

          <button
            className="bg-neutral-900 dark:bg-neutral-100 relative group/btn block w-full text-white dark:text-neutral-900 rounded-md h-10 font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? t.loggingIn : t.login}
            <BottomGradient />
          </button>

          <br />

          <div className="text-center space-y-4">
            <div>
              <a
                href="./forgotPassword"
                className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 hover:opacity-80 text-sm"
              >
                {t.forgotPassword}
              </a>
            </div>
            <div className="text-neutral-600 dark:text-neutral-400">
              <span>{t.noAccount} </span>
              <a
                href="./register"
                className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 hover:opacity-80"
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
