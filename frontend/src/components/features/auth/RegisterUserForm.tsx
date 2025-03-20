/* eslint-disable @typescript-eslint/no-explicit-any */
// @/components/auth/RegisterForm.tsx

"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/shared/useAuth";
import { useRouter } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Eye, EyeClosed, Info } from "lucide-react";
import { translations } from "@/translations";
import { useLanguage } from "@/components/context/LanguageContext";
import { MobileWrapper } from "@/components/common/MobileWrapper";
import { MultiStepLoader } from "@/components/ui/aceternity/multi-step-loader";
import { useToast } from "@/hooks/shared/useToast";
import { LinkPreview } from "@/components/ui/aceternity/link-preview";

export function RegisterUserForm() {
  const { language } = useLanguage();
  const { register } = useAuth();
  const router = useRouter();
  const t = translations[language].auth.register;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password1: "",
    password2: "",
    fullname: "",
    phone: "",
    user_role: "owner",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const generateUsername = (fullName: string) => {
    const firstName = fullName.split(" ")[0]; // Extract the first name
    const formattedName = firstName.toLowerCase().replace(/[^a-z]/g, ""); // Keep only letters

    if (!formattedName) return "";

    const suffix = Math.floor(100 + Math.random() * 900); // Generate a three-digit number
    return `${formattedName}${suffix}`;
  };


  useEffect(() => {
    if (formData.fullname) {
      const generatedUsername = generateUsername(formData.fullname);
      setUsername(generatedUsername);
      setFormData((prev) => ({
        ...prev,
        username: generatedUsername,
      }));
    }
  }, [formData.fullname]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    if (!/\d/.test(password)) {
      // Note the removal of the extra backslash
      return "Password must contain at least one number";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate required fields for user registration
      if (
        !formData.fullname ||
        !formData.email ||
        !formData.phone ||
        !formData.password1 ||
        !formData.password2
      ) {
        setError("Please fill in all required user information");
        setIsLoading(false);
        return;
      }

      // Validate password match
      if (formData.password1 !== formData.password2) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }

      // Validate password complexity
      const passwordError = validatePassword(formData.password1);
      if (passwordError) {
        setError(passwordError);
        setIsLoading(false);
        return;
      }

      // Format phone number - ensure it has +251 prefix
      const formattedPhone = formData.phone.startsWith("+251")
        ? formData.phone
        : formData.phone.startsWith("251")
          ? `+${formData.phone}`
          : `+251${formData.phone}`;

      // Prepare registration data
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password1: formData.password1,
        password2: formData.password2,
        fullname: formData.fullname,
        phone: formattedPhone,
        role: "owner", // Explicitly set role to owner for business registration
      };

      console.log("Submitting registration data:", registrationData);

      // Register the user
      const userRegistered = await register(registrationData);

      if (userRegistered.success) {
        toast({
          title: "Account created successfully!",
          description: "Now let's set up your business profile...",
          variant: "default",
        });

        sessionStorage.setItem(
          "pendingBusinessSetup",
          JSON.stringify({
            username: formData.username,
            password: formData.password1,
            email: formData.email,
            fullname: formData.fullname,
            phone: formattedPhone,
            registered: true,
            timestamp: Date.now()
          })
        );

        setTimeout(() => {
          router.replace("/auth/registerBusiness?success=true");
        }, 2000);
      } else {
        throw new Error(userRegistered.error || "Registration failed");
      }
    } catch (err: any) {
      console.error("Registration error:", err);

      toast({
        title: "Error",
        description: err.message || "Registration failed",
        variant: "destructive",
      });

      setError(err.message || "Registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const loadingStates = [
    { text: "Creating your account..." },
    { text: "Setting up user profile..." },
    { text: "Configuring permissions..." },
    { text: "Almost done..." },
  ];

  return (
    <MobileWrapper>
      <div className="max-w-4xl mx-auto mt-12 p-4">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
          {t.welcome}
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-400">
          {t.description}
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Personal Information Section */}
          <div className="flex-1 mb-8">
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
                  id="fullname"
                  placeholder={t.namePlaceholder}
                  type="text"
                  value={formData.fullname}
                  onChange={(e) => {
                    handleInputChange(e);
                    // This will trigger the useEffect to generate username
                  }}
                  disabled={isLoading}
                  className="border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
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
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setFormData((prev) => ({
                      ...prev,
                      username: e.target.value,
                    }));
                  }}
                  className="border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
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
                value={formData.email}
                onChange={handleInputChange}
                disabled={isLoading}
                className="border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
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
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  maxLength={9}
                  minLength={9}
                  className="rounded-l-none border-l-0"
                />
              </div>
            </LabelInputContainer>
            <LabelInputContainer className="mb-4">
              <Label htmlFor="password">{t.password}</Label>
              <div className="relative">
                <Input
                  id="password1"
                  placeholder="••••••••"
                  type={showPassword ? "text" : "password"}
                  value={formData.password1}
                  onChange={(e) => {
                    handleInputChange(e);
                    // Clear error if password becomes valid
                    const error = validatePassword(e.target.value);
                    if (!error) setError("");
                  }}
                  disabled={isLoading}
                  className={cn(
                    "pr-10",
                    validatePassword(formData.password1) ? "border-red-500" : ""
                  )}
                />
                {formData.password1 && (
                  <span
                    className={cn(
                      "text-xs",
                      validatePassword(formData.password1)
                        ? "text-red-500"
                        : "text-green-500"
                    )}
                  >
                    {validatePassword(formData.password1) ||
                      "Password meets requirements"}
                  </span>
                )}
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
                  id="password2"
                  placeholder="••••••••"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.password2}
                  onChange={handleInputChange}
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
            <div className="text-gray-600 dark:text-gray-400 md:flex items-center justify-center gap-1 text-sm">
              <div className="flex md:hidden flex-col items-center space-y-2">
                <Info className="h-3 w-3 text-purple-400 dark:text-purple-500 transition-colors duration-300 animate-gradient" />
                <span>{t.terms}</span>
                <a
                  href="https://bms.jirehgrp.com/legal/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 hover:opacity-80"
                >
                  {t.termsLink}
                </a>
                <span>{t.and}</span>
                <a
                  href="https://bms.jirehgrp.com/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 hover:opacity-80"
                >
                  {t.privacyLink}
                </a>
                <span>{t.ነው}</span>
              </div>
              <div className="hidden md:flex items-center gap-1">
                <Info className="h-3 w-3 text-purple-400 dark:text-purple-500 transition-colors duration-300 animate-gradient" />
                {t.terms}{" "}
                <a
                  href="https://bms.jirehgrp.com/legal/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 hover:opacity-80"
                >
                  {t.termsLink}
                </a>{" "}
                {t.and}{" "}
                <a
                  href="https://bms.jirehgrp.com/legal/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-500 to-blue-500 dark:from-purple-400 dark:to-blue-400 hover:opacity-80"
                >
                  {t.privacyLink}
                </a>
                {t.ነው}
              </div>
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
      <MultiStepLoader
        loadingStates={loadingStates}
        loading={isLoading}
        duration={2000}
      />
    </MobileWrapper>
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
