// @/components/auth/RegisterForm.tsx

"use client";
import React, { useState, useEffect } from "react";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { cn } from "@/libs/utils";
import { Eye, EyeClosed, Info } from "lucide-react";
import { translations } from "@/translations";
import { LinkPreview } from "@/components/ui/Aceternity/link-preview";
import Header from "@/components/common/Header";
import { useLanguage } from "@/components/context/LanguageContext";

export function RegisterForm() {
  const { language } = useLanguage();
  const t = translations.auth[language].register;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateUsername = (fullName: string) => {
    const formattedName = fullName
      .toLowerCase()
      .replace(/[^a-z\s]/g, "")
      .trim()
      .split(/\s+/)
      .filter((part) => part.length > 0);

    if (formattedName.length >= 2) {
      return `${formattedName[0]}.${formattedName[formattedName.length - 1]}`;
    } else if (formattedName.length === 1) {
      return formattedName[0];
    }
    return "";
  };

  useEffect(() => {
    const generatedUsername = generateUsername(name);
    setUsername(generatedUsername);
  }, [name]);

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
      <Header />
      <div className="max-w-4xl mx-auto mt-12 p-4">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
          {t.welcome}
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-400">
          {t.description}
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row">
            {/* Personal Information Section */}
            <div className="flex-1 md:pr-8">
              <h3 className="font-semibold text-lg mb-4 text-neutral-800 dark:text-neutral-200">
                {t.personalInfo}
              </h3>
              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                <LabelInputContainer>
                  <Label
                    htmlFor="name"
                    className="text-neutral-700 dark:text-neutral-300"
                  >
                    {t.name}
                  </Label>
                  <Input
                    id="name"
                    placeholder={t.namePlaceholder}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                  />
                </LabelInputContainer>
                <LabelInputContainer>
                  <Label
                    htmlFor="username"
                    className="text-neutral-700 dark:text-neutral-300"
                  >
                    {t.username}
                  </Label>
                  <Input
                    id="username"
                    placeholder={t.usernamePlaceholder}
                    type="text"
                    value={username}
                    readOnly
                    className="bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 dark:text-neutral-300"
                    disabled={isLoading}
                  />
                </LabelInputContainer>
              </div>
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
                  type="email"
                  disabled={isLoading}
                  className="border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                />
              </LabelInputContainer>
              <LabelInputContainer className="mb-4">
                <Label htmlFor="phone">{t.phone}</Label>
                <div className="flex">
                  <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    +251
                  </div>
                  <Input
                    id="phone"
                    placeholder={t.phonePlaceholder}
                    type="tel"
                    disabled={isLoading}
                    className="rounded-l-none border-l-0"
                  />
                </div>
              </LabelInputContainer>
              <LabelInputContainer className="mb-4">
                <Label htmlFor="password">{t.password}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"}
                    disabled={isLoading}
                    className="pr-10"
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

              <LabelInputContainer className="mb-8">
                <Label htmlFor="cpassword">{t.confirmPassword}</Label>
                <div className="relative">
                  <Input
                    id="cpassword"
                    placeholder="••••••••"
                    type={showConfirmPassword ? "text" : "password"}
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-600 dark:text-neutral-400 dark:hover:text-neutral-300"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? (
                      <EyeClosed className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </LabelInputContainer>
            </div>

            {/* Vertical Separator */}
            <div className="hidden md:block w-px my-8">
              <div className="bg-gradient-to-b from-transparent via-neutral-200 dark:via-neutral-800 to-transparent h-full w-px" />
            </div>

            {/* Business Information Section */}
            <div className="flex-1 md:pl-8 mt-8 md:mt-0">
              <h3 className="font-semibold text-lg mb-4 text-neutral-800 dark:text-neutral-200">
                {t.businessInfo}
              </h3>
              <LabelInputContainer className="mb-4">
                <Label
                  htmlFor="businessName"
                  className="text-neutral-700 dark:text-neutral-300"
                >
                  {t.businessName}
                </Label>
                <Input
                  id="businessName"
                  placeholder={t.businessNamePlaceholder}
                  type="text"
                  disabled={isLoading}
                  className="border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
                />
              </LabelInputContainer>
              <LabelInputContainer className="mb-4">
                <Label
                  htmlFor="businessType"
                  className="text-neutral-700 dark:text-neutral-300"
                >
                  {t.businessType}
                </Label>
                <Select disabled defaultValue="retail">
                  <SelectTrigger className="bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 dark:text-neutral-300">
                    <SelectValue
                      placeholder={t.businessTypePlaceholder.retail}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail">
                      {t.businessTypePlaceholder.retail}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </LabelInputContainer>
              <LabelInputContainer className="mb-4">
                <Label htmlFor="businessAddress">{t.businessAddress}</Label>
                <Input
                  id="businessAddress"
                  placeholder={t.businessAddressPlaceholder}
                  type="text"
                  disabled={isLoading}
                />
              </LabelInputContainer>
              <LabelInputContainer className="mb-4">
                <Label htmlFor="phone">{t.businessPhone}</Label>
                <div className="flex">
                  <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                    +251
                  </div>
                  <Input
                    id="phone"
                    placeholder={t.businessPhonePlaceholder}
                    type="tel"
                    disabled={isLoading}
                    className="rounded-l-none border-l-0"
                  />
                </div>
              </LabelInputContainer>
            </div>
          </div>

          <button
            className="bg-neutral-900 dark:bg-neutral-100 relative group/btn block w-full text-white dark:text-neutral-900 rounded-md h-10 font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? t.registering : t.register}
            <BottomGradient />
          </button>
          <br />

          <div className="text-center text-sm">
            <div className="text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1 text-sm">
              <Info className="h-3 w-3 text-purple-400 dark:text-purple-500 transition-colors duration-300 animate-gradient" />
              {t.terms}{" "}
              <LinkPreview
                url="https://rbms.jirehgrp.com/legal/terms"
                className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 hover:opacity-80"
              >
                {t.termsLink}
              </LinkPreview>{" "}
              {t.and}{" "}
              <LinkPreview
                url="https://rbms.jirehgrp.com/legal/privacy"
                className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 hover:opacity-80"
              >
                {t.privacyLink}
              </LinkPreview>
              {t.ነው}
            </div>
          </div>

          <div className="bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent my-8 h-[1px] w-full" />
          <div className="text-center text-neutral-800 dark:text-neutral-200">
            <span>{t.haveAccount} </span>
            <a
              href="./login"
              className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 hover:opacity-80"
            >
              {t.login}
            </a>
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

export default LinkPreview;
