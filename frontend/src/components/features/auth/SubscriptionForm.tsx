/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/features/auth/SubscriptionForm.tsx

"use client";
import React, { useId, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";
import { useSubscription } from "@/hooks/features/useSubscription";
import { usePlans } from "@/hooks/features/usePlan";
import { Plan } from "@/types/features/plan";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "sonner";
import { Info, AlertCircle } from "lucide-react";
import { PaymentDialog } from "./PaymentDialog";
import { MobileWrapper } from "@/components/common/MobileWrapper";

export function SubscriptionForm() {
  const { language } = useLanguage();
  const t = translations[language].auth.subscription;
  const { renewSubscription, getSubscription } = useSubscription();
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { plans, isLoading, error } = usePlans();
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState<any>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const id = useId();

  const visiblePlans = plans.filter((plan) => !plan.isHidden);

  // Fetch current subscription status on load
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        setLoadingSubscription(true);
        // Use our hook's getSubscription method instead of direct fetch
        const data = await getSubscription();
        if (data.has_subscription) {
          setCurrentSubscription(data.subscription);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
        toast.error("Failed to load subscription data");
      } finally {
        setLoadingSubscription(false);
      }
    };

    fetchSubscriptionData();
  }, [getSubscription]);

  const handlePlanClick = (plan: Plan) => {
    if (!plan.isActive) {
      toast.error("This plan is currently unavailable");
      return;
    }
    setActivePlan(plan);
  };

  const getPlanPrice = (plan: Plan) => {
    if (!plan) return null;
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const shouldShowContactSupport = (plan: Plan) => {
    return (
      (plan.monthlyPrice === 0 || !plan.monthlyPrice) &&
      (plan.yearlyPrice === 0 || !plan.yearlyPrice)
    );
  };

  const handleSubscribe = (plan: Plan) => {
    if (shouldShowContactSupport(plan)) {
      window.location.href = "/contact-support";
      return;
    }
    setShowPaymentDialog(true);
  };

  const handlePaymentConfirm = async (paymentData: any) => {
    try {
      if (!activePlan) {
        toast.error("No plan selected");
        return;
      }

      // Use the renewSubscription function correctly
      const response = await renewSubscription(
        activePlan.id,
        paymentData.paymentMethod
      );

      if (response.error) {
        throw new Error(response.error);
      }

      toast.success("Subscription created successfully");
      setShowPaymentDialog(false);
      setActivePlan(null);

      // Update the current subscription state
      if (response.data) {
        setCurrentSubscription(response.data);
      }
    } catch (err) {
      toast.error("Failed to create subscription");
      console.error(err);
    }
  };

  if (isLoading || loadingSubscription) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-t-purple-500 border-r-transparent border-b-blue-500 border-l-transparent"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-400">
            Loading subscription information...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-100 dark:bg-red-900 p-6 rounded-lg text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 dark:text-red-300 mb-4" />
          <h3 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
            Error Loading Plans
          </h3>
          <p className="text-red-600 dark:text-red-200">{error}</p>
        </div>
      </div>
    );
  }

  const PlanButton = ({
    onClick,
    planId,
    id,
    children,
  }: {
    onClick: () => void;
    planId: string;
    id: string;
    children: React.ReactNode;
  }) => {
    return (
      <motion.div className="relative mt-8">
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 opacity-75 blur-sm"
          animate={{
            opacity: [0.5, 0.8, 0.5],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
        <motion.button
          layoutId={`button-${planId}-${id}`}
          onClick={onClick}
          className="relative w-full rounded-full pl-4 pr-1 py-2 text-black flex items-center justify-between bg-zinc-200 dark:bg-zinc-700 dark:text-white hover:opacity-90 transition-opacity"
        >
          {children}
        </motion.button>
      </motion.div>
    );
  };

  return (
    <MobileWrapper>
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-center mb-8 dark:text-white">
          {t.page.choose}
        </h2>

        {/* Pricing disclaimer - moved above billing toggle */}
        <div className="mb-8">
          <div className="bg-neutral-200 dark:bg-neutral-800 rounded-lg p-4 max-w-2xl mx-auto">
            <p className="text-center text-neutral-600 dark:text-neutral-400 text-sm flex items-center justify-center gap-2">
              <Info className="h-4 w-4 shrink-0" />
              {t.page.allPrices}
            </p>
            <p className="text-center text-neutral-600 dark:text-neutral-400 text-sm flex items-center justify-center gap-2">
              {t.page.getFreeTrial}
            </p>
          </div>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center items-center mb-10">
          <ToggleGroup
            type="single"
            value={isYearly ? "yearly" : "monthly"}
            onValueChange={(value) => setIsYearly(value === "yearly")}
            className="bg-neutral-200 dark:bg-neutral-700 inline-flex items-center rounded-full p-1 shadow-inner"
          >
            {/* Monthly Billing */}
            <ToggleGroupItem
              value="monthly"
              className={`rounded-full px-6 py-2 text-sm transition-colors ${
                isYearly
                  ? "bg-transparent text-neutral-600 dark:text-neutral-200"
                  : "bg-white text-black dark:bg-neutral-900 dark:text-white"
              }`}
            >
              {t.page.monthlyBilling}
            </ToggleGroupItem>

            {/* Yearly Billing */}
            <ToggleGroupItem
              value="yearly"
              className={`rounded-full px-6 py-2 text-sm transition-colors ${
                isYearly
                  ? "bg-white text-black dark:bg-neutral-900 dark:text-white"
                  : "bg-transparent text-neutral-600 dark:text-neutral-200"
              }`}
            >
              <span>{t.page.annualBilling}</span>
              {isYearly && (
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200 text-xs rounded">
                  {t.page.save16}
                </span>
              )}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Plans List */}
        <ul className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-20">
          {visiblePlans.map((plan) => (
            <motion.div
              layoutId={`card-${plan.id}-${id}`}
              key={plan.id}
              onClick={() => handlePlanClick(plan)}
              className={`p-6 bg-white dark:bg-zinc-900 rounded-xl cursor-pointer hover:bg-neutral-50 dark:hover:bg-zinc-800 border border-neutral-200 dark:border-neutral-700 relative ${
                !plan.isActive ? "opacity-60 hover:opacity-60" : ""
              }`}
            >
              {!plan.isActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 dark:bg-white/10 rounded-xl">
                  <span className="absolute top-4 right-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white animate-pulse">
                    {language === "en" ? "Coming Soon" : "በቅርብ ጊዜ"}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-start">
                <div>
                  <motion.h3
                    layoutId={`title-${plan.id}-${id}`}
                    className="text-xl font-bold text-black dark:text-white mb-2"
                  >
                    {language === "en" ? plan.name_en : plan.name_am}
                  </motion.h3>

                  <motion.div
                    layoutId={`price-${plan.id}-${id}`}
                    className="text-4xl font-bold text-black dark:text-white mb-4"
                  >
                    {shouldShowContactSupport(plan) ? (
                      <span>{t.page.contactSupport}</span>
                    ) : (
                      <>
                        {getPlanPrice(plan)?.toLocaleString()} {t.page.br}
                        <span className="text-sm font-normal text-neutral-600 dark:text-neutral-400">
                          /{isYearly ? t.page.year : t.page.month}
                        </span>
                      </>
                    )}
                  </motion.div>

                  <motion.p
                    layoutId={`description-${plan.id}-${id}`}
                    className="text-neutral-600 dark:text-neutral-400"
                  >
                    {language === "en"
                      ? plan.description_en
                      : plan.description_am}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          ))}
        </ul>

        {/* Modal */}
        <AnimatePresence>
          {activePlan && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/20 z-50"
                onClick={() => setActivePlan(null)}
              />
              <div
                className="fixed inset-0 grid place-items-center z-[60]"
                onClick={() => setActivePlan(null)}
              >
                <motion.div
                  layoutId={`card-${activePlan.id}-${id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-[500px] bg-white dark:bg-zinc-900 rounded-3xl p-8 relative"
                >
                  <motion.button
                    onClick={() => setActivePlan(null)}
                    className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-zinc-800"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M18 6L6 18" />
                      <path d="M6 6l12 12" />
                    </svg>
                  </motion.button>

                  <motion.h3
                    layoutId={`title-${activePlan.id}-${id}`}
                    className="text-2xl font-bold text-black dark:text-white mb-4"
                  >
                    {language === "en"
                      ? activePlan.name_en
                      : activePlan.name_am}
                  </motion.h3>

                  <motion.div
                    layoutId={`price-${activePlan?.id}-${id}`}
                    className="text-4xl font-bold text-black dark:text-white mb-4"
                  >
                    {shouldShowContactSupport(activePlan) ? (
                      <span>{t.page.contactSupport}</span>
                    ) : (
                      <>
                        {getPlanPrice(activePlan)?.toLocaleString()} {t.page.br}
                        <span className="text-sm font-normal text-neutral-600 dark:text-neutral-400">
                          /{isYearly ? t.page.year : t.page.month}
                        </span>
                      </>
                    )}
                  </motion.div>

                  <motion.p
                    layoutId={`description-${activePlan.id}-${id}`}
                    className="text-neutral-600 dark:text-neutral-400 mb-8"
                  >
                    {language === "en"
                      ? activePlan.description_en
                      : activePlan.description_am}
                  </motion.p>

                  <motion.div className="space-y-4">
                    <h4 className="font-semibold text-black dark:text-white">
                      {t.page.features}:
                    </h4>
                    <ul className="space-y-2 text-neutral-600 dark:text-neutral-400">
                      {(language === "en"
                        ? activePlan.features_en
                        : activePlan.features_am
                      )?.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          {feature.included ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="url(#gradient)"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-5 h-5 flex-shrink-0 hover:opacity-80"
                            >
                              <defs>
                                <linearGradient
                                  id="gradient"
                                  gradientTransform="rotate(45)"
                                >
                                  <stop offset="0%" stopColor="#8B5CF6" />
                                  <stop offset="100%" stopColor="#3B82F6" />
                                </linearGradient>
                              </defs>
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="w-5 h-5 text-red-500 flex-shrink-0"
                            >
                              <path d="M18 6L6 18" />
                              <path d="M6 6l12 12" />
                            </svg>
                          )}
                          <span
                            className={
                              feature.included
                                ? ""
                                : "text-neutral-400 dark:text-neutral-500"
                            }
                          >
                            {feature.title}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>

                  <PlanButton
                    onClick={() => handleSubscribe(activePlan)}
                    planId={activePlan.id.toString()}
                    id={id}
                  >
                    <span className="text-lg font-bold">
                      {shouldShowContactSupport(activePlan)
                        ? t.page.contactSupport
                        : t.page.subscribe}
                    </span>
                    <span className="font-bold bg-zinc-200 dark:bg-zinc-700 dark:text-white rounded-full px-4 py-2 text-s">
                      {activePlan.duration} {t.page.days}
                    </span>
                  </PlanButton>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>

        <PaymentDialog
          isOpen={showPaymentDialog}
          onClose={() => setShowPaymentDialog(false)}
          plan={activePlan}
          isYearly={isYearly}
          onConfirm={handlePaymentConfirm}
          isTrial={!activePlan}
        />
      </div>
    </MobileWrapper>
  );
}
