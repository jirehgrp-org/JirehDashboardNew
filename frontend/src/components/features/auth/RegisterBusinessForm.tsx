/* eslint-disable @typescript-eslint/no-explicit-any */
// @/components/auth/RegisterBusinessForm.tsx

"use client";
import React, { useState } from "react";
import { useAuth } from "@/hooks/shared/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { MapPin, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { translations } from "@/translations";
import { useLanguage } from "@/components/context/LanguageContext";
import { MobileWrapper } from "@/components/common/MobileWrapper";
import { MultiStepLoader } from "@/components/ui/aceternity/multi-step-loader";
import { CitySelect } from "@/constants/shared/ethiopianCIties";
import { useToast } from "@/hooks/shared/useToast";
import { cn } from "@/lib/utils";

interface Address {
  businessName: string;
  businessPhone: string;
  street: string;
  city: string;
  country: string;
}

export function RegisterBusinessForm() {
  const { language } = useLanguage();
  const { registerBusiness, isAuthenticated, checkAuth, login } = useAuth();
  const [isAutoLoginComplete, setIsAutoLoginComplete] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = translations[language].auth.register;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const [businessDetails, setBusinessDetails] = useState<Address>({
    businessName: "",
    businessPhone: "",
    street: "",
    city: "",
    country: "Ethiopia",
  });

  React.useEffect(() => {
    const verifyAuth = async () => {
      console.log("Starting verification in business form");
      const success = searchParams.get('success');
      
      // Try to get credentials from session storage
      const pendingSetupData = sessionStorage.getItem('pendingBusinessSetup');
      
      if (success && pendingSetupData) {
        try {
          console.log("Found pending setup data, attempting auto-login");
          const setupData = JSON.parse(pendingSetupData);
          
          if (setupData.username && setupData.password && !isAuthenticated && !isAutoLoginComplete) {
            setIsLoading(true);
            try {
              const loginResult = await login({
                username: setupData.username,
                password: setupData.password
              });
              
              if (loginResult.success) {
                console.log("Auto-login successful");
                setIsAutoLoginComplete(true);
                await new Promise(resolve => setTimeout(resolve, 1000));
                await checkAuth();
              } else {
                console.error("Auto-login failed:", loginResult.error);
                toast({
                  title: "Authentication Error",
                  description: "Please return to registration and try again",
                  variant: "destructive",
                });
              }
            } catch (error) {
              console.error("Error during auto-login:", error);
            } finally {
              setIsLoading(false);
            }
          }
        } catch (error) {
          console.error("Error parsing session data:", error);
        }
      } else if (!isAuthenticated) {
        console.log("User not authenticated, redirecting to register");
        router.replace("/auth/registerUser");
      } else {
        await checkAuth();
      }
    };
    
    verifyAuth();
  }, [isAuthenticated, router, checkAuth, searchParams, login, isAutoLoginComplete, toast]);

  const handleBusinessChange = (field: keyof Address, value: string) => {
    setBusinessDetails((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Validate business fields
      if (
        !businessDetails.businessName ||
        !businessDetails.businessPhone ||
        !businessDetails.street ||
        !businessDetails.city
      ) {
        setError("Please complete all business information");
        setIsLoading(false);
        return;
      }

      // Format phone number - ensure it has +251 prefix
      const formattedBusinessPhone = businessDetails.businessPhone.startsWith(
        "+251"
      )
        ? businessDetails.businessPhone
        : businessDetails.businessPhone.startsWith("251")
        ? `+${businessDetails.businessPhone}`
        : `+251${businessDetails.businessPhone}`;

      // Prepare business data
      const businessData = {
        name: businessDetails.businessName,
        address_street: businessDetails.street,
        address_city: businessDetails.city,
        address_country: businessDetails.country,
        contact_number: formattedBusinessPhone,
        registration_number: `BMS${Date.now()}`,
      };

      // Register the business
      const response = await registerBusiness(businessData);
      
      if (response.success) {
        sessionStorage.removeItem('pendingBusinessSetup');
        
        toast({
          title: "Success!",
          description: "Your business has been set up successfully",
          variant: "default",
        });
        
        // Redirect to dashboard
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        throw new Error(response.error || "Business registration failed");
      }
    } catch (err: any) {
      console.error("Business registration error:", err);

      toast({
        title: "Error",
        description: err.message || "Business registration failed",
        variant: "destructive",
      });

      setError(err.message || "Business registration failed");
    } finally {
      setIsLoading(false);
    }
  };

  const loadingStates = [
    { text: "Setting up business profile..." },
    { text: "Creating your default branch..." },
    { text: "Preparing your subscription..." },
    { text: "Almost done..." },
  ];

  return (
    <MobileWrapper>
      <div className="max-w-4xl mx-auto mt-12 p-4">
        <h2 className="font-bold text-xl text-neutral-800 dark:text-neutral-200">
          Set Up Your Business
        </h2>
        <p className="text-neutral-600 text-sm max-w-sm mt-2 dark:text-neutral-400">
          Let&apos;s set up your business profile to get started with our
          services.
        </p>

        <form className="my-8" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Business Information Section */}
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-4 text-neutral-800 dark:text-neutral-200">
              {t.businessInfo}
            </h3>
            <LabelInputContainer className="mb-6">
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
                value={businessDetails.businessName}
                onChange={(e) =>
                  handleBusinessChange("businessName", e.target.value)
                }
                disabled={isLoading}
                className="border-neutral-200 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100"
              />
            </LabelInputContainer>
            <div className="flex items-center justify-between mb-1">
              <Label
                htmlFor="street"
                className="text-neutral-700 dark:text-neutral-300"
              >
                {t.businessAddress}
              </Label>
              <Dialog>
                <DialogTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
                  >
                    <MapPin className="h-4 w-4" />
                    <span>Pick on map</span>
                  </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Business Location</DialogTitle>
                  </DialogHeader>
                  <div className="h-24 w-full bg-neutral-100 dark:bg-neutral-800 rounded-lg flex items-center justify-center">
                    <span className="text-neutral-500 dark:text-neutral-400">
                      Sorry, Map feature is coming soon
                    </span>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <LabelInputContainer>
                <Input
                  id="street"
                  placeholder="Street Address"
                  value={businessDetails.street}
                  onChange={(e) =>
                    handleBusinessChange("street", e.target.value)
                  }
                  disabled={isLoading}
                  className="border-neutral-200 dark:border-neutral-800"
                />
              </LabelInputContainer>

              <LabelInputContainer>
                <CitySelect
                  value={businessDetails.city}
                  onChange={(value) => handleBusinessChange("city", value)}
                  disabled={isLoading}
                />
              </LabelInputContainer>

              <LabelInputContainer>
                <Input
                  id="country"
                  value="Ethiopia"
                  disabled={true}
                  className="border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800"
                />
              </LabelInputContainer>
            </div>
            <LabelInputContainer className="mb-4">
              <Label htmlFor="phone">{t.businessPhone}</Label>
              <div className="flex">
                <div className="flex items-center justify-center px-3 border border-r-0 rounded-l-md border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                  +251
                </div>
                <Input
                  id="businessPhone"
                  placeholder={t.businessPhonePlaceholder}
                  type="tel"
                  value={businessDetails.businessPhone}
                  onChange={(e) =>
                    handleBusinessChange("businessPhone", e.target.value)
                  }
                  disabled={isLoading}
                  className="rounded-l-none border-l-0"
                  maxLength={9}
                  minLength={9}
                />
              </div>
            </LabelInputContainer>
          </div>

          <button
            className="bg-neutral-900 dark:bg-neutral-100 relative group/btn block w-full text-white dark:text-neutral-900 rounded-md h-10 font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Setting up..." : "Complete Setup"}
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

export default RegisterBusinessForm;
