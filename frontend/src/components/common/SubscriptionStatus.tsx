/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// components/common/SubscriptionStatus.tsx

"use client";
import React, { useState } from "react";
import { useAuth } from "@/hooks/shared/useAuth";
import { Calendar, Clock, CreditCard, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/context/LanguageContext";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { AnimatePresence, motion } from "framer-motion";
import { usePlans } from "@/hooks/features/usePlan";
import { useSubscription } from "@/hooks/features/useSubscription";
import { Plan } from "@/types/features/plan";
import { PaymentDialog } from "../features/auth/PaymentDialog";
import { toast } from "sonner";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { translations } from "@/translations";

export function SubscriptionStatus() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = translations[language].auth.subscription;
  const [showDialog, setShowDialog] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const { plans, isLoading: plansLoading } = usePlans();
  const { renewSubscription } = useSubscription();
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [isYearly, setIsYearly] = useState(false);
  
  // If no user or no subscription info, don't render anything
  if (!user || !user.subscription) return null;
  
  const subscription = user.subscription;
  const daysRemaining = subscription.days_remaining || 0;
  const isTrial = subscription.is_trial;
  const isExpired = subscription.subscription_status === 'EXPIRED';
  
  const statusColor = isExpired 
    ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    : isTrial 
      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
  
  const statusText = isExpired 
    ? (language === 'en' ? 'Expired' : 'ጊዜው ያለፈበት')
    : isTrial 
      ? (language === 'en' ? 'Trial' : 'ሙከራ')
      : (language === 'en' ? 'Active' : 'ንቁ');
  
  const progress = Math.max(0, Math.min(100, (daysRemaining / 30) * 100));

  const handlePaymentConfirm = async (paymentData: any) => {
    try {
      if (!activePlan) {
        toast.error("No plan selected");
        return;
      }
      
      // Use the renewSubscription function correctly
      const response = await renewSubscription(activePlan.id, paymentData.paymentMethod);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      toast.success("Subscription created successfully");
      setShowPaymentDialog(false);
      setActivePlan(null);
      setShowDialog(false);
      
      // Refresh the page to update subscription info
      window.location.reload();
    } catch (err) {
      toast.error("Failed to create subscription");
      console.error(err);
    }
  };

  // Filter out hidden plans
  const visiblePlans = plans.filter((plan) => !plan.isHidden);

  const getPlanPrice = (plan: Plan) => {
    if (!plan.monthlyPrice) return null;
    return isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const handlePlanClick = (plan: Plan) => {
    if (!plan.isActive) {
      toast.error("This plan is currently unavailable");
      return;
    }
    setActivePlan(plan);
    setShowPaymentDialog(true);
  };
  
  return (
    <div className="flex items-center gap-2">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Badge 
            className={`${statusColor} cursor-pointer hover:opacity-80`}
            onClick={() => setShowDialog(true)}
          >
            {statusText}
          </Badge>
        </HoverCardTrigger>
        <HoverCardContent className="w-64">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">{subscription.plan_name}</h4>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{new Date(subscription.start_date).toLocaleDateString()}</span>
              <span>{new Date(subscription.end_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-muted-foreground">
                {language === 'en' ? 'Days Remaining' : 'ቀሪ ቀናት'}
              </span>
              <span className="font-medium">
                {daysRemaining}
              </span>
            </div>
            <Progress value={progress} className="h-1" />
            <div className="text-xs text-center text-muted-foreground mt-2">
              {language === 'en' ? 'Click to manage subscription' : 'ለማስተዳደር ጠቅ ያድርጉ'}
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
      
      {(isExpired || daysRemaining <= 5) && (
        <Button 
          size="sm" 
          variant="outline" 
          className="text-xs h-7 bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800 dark:hover:bg-purple-900/50"
          onClick={() => setShowDialog(true)}
        >
          {language === 'en' ? 'Renew' : 'አድስ'}
        </Button>  
      )}
      
      {/* Subscription Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {language === 'en' ? 'Your Subscription' : 'የእርስዎ ምዝገባ'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-6">
            {/* Current Subscription Info */}
            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <div>
                  <h3 className="font-medium text-lg">{subscription.plan_name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {isTrial 
                      ? (language === 'en' ? 'Free trial period' : 'የነፃ ሙከራ ጊዜ') 
                      : (language === 'en' ? 'Active subscription' : 'ንቁ ምዝገባ')}
                  </p>
                </div>
                <Badge className={statusColor}>{statusText}</Badge>
              </div>
              
              <div>
                <div className="flex justify-between mb-1 text-sm">
                  <span className="text-muted-foreground flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {language === 'en' ? 'Days Remaining' : 'ቀሪ ቀናት'}
                  </span>
                  <span className="font-medium">
                    {daysRemaining} {language === 'en' ? 'days' : 'ቀናት'}
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-background p-3 rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">
                    {language === 'en' ? 'Start Date' : 'የመጀመሪያ ቀን'}
                  </div>
                  <div className="text-sm font-medium">
                    {new Date(subscription.start_date).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="bg-background p-3 rounded-md">
                  <div className="text-xs text-muted-foreground mb-1">
                    {language === 'en' ? 'End Date' : 'የመጨረሻ ቀን'}
                  </div>
                  <div className="text-sm font-medium">
                    {new Date(subscription.end_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              {isTrial && (
                <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-md text-sm mt-3">
                  <p className="text-blue-700 dark:text-blue-300 flex items-center">
                    <Info className="h-4 w-4 mr-2 shrink-0" />
                    {language === 'en' 
                      ? 'Your trial will expire soon. Subscribe now to continue using all features.' 
                      : 'የሙከራ ጊዜዎ በቅርብ ጊዜ ያበቃል። ሁሉንም ባህሪያት ለመጠቀም መመዝገብ ይፈልጋሉ።'}
                  </p>
                </div>
              )}
              
              {isExpired && (
                <div className="bg-red-50 dark:bg-red-900/30 p-3 rounded-md text-sm mt-3">
                  <p className="text-red-700 dark:text-red-300 flex items-center">
                    <Info className="h-4 w-4 mr-2 shrink-0" />
                    {language === 'en' 
                      ? 'Your subscription has expired. Renew now to regain access to all features.' 
                      : 'የምዝገባዎ ጊዜ አብቅቷል። ሁሉንም ባህሪያት ለመጠቀም እንደገና ይመዝገቡ።'}
                  </p>
                </div>
              )}
            </div>
            
            {/* Plan Selection Section */}
            <div>
              <h3 className="font-semibold text-lg mb-3">
                {language === 'en' ? 'Available Plans' : 'ያሉ እቅዶች'}
              </h3>
              
              {/* Billing toggle */}
              <div className="flex justify-center items-center mb-4">
                <ToggleGroup
                  type="single"
                  value={isYearly ? "yearly" : "monthly"}
                  onValueChange={(value) => setIsYearly(value === "yearly")}
                  className="bg-neutral-200 dark:bg-neutral-700 inline-flex items-center rounded-full p-1 shadow-inner"
                >
                  <ToggleGroupItem
                    value="monthly"
                    className={`rounded-full px-4 py-1 text-xs transition-colors ${
                      isYearly
                        ? "bg-transparent text-neutral-600 dark:text-neutral-200"
                        : "bg-white text-black dark:bg-neutral-900 dark:text-white"
                    }`}
                  >
                    {language === 'en' ? 'Monthly' : 'በወር'}
                  </ToggleGroupItem>

                  <ToggleGroupItem
                    value="yearly"
                    className={`rounded-full px-4 py-1 text-xs transition-colors ${
                      isYearly
                        ? "bg-white text-black dark:bg-neutral-900 dark:text-white"
                        : "bg-transparent text-neutral-600 dark:text-neutral-200"
                    }`}
                  >
                    <span>{language === 'en' ? 'Yearly' : 'በዓመት'}</span>
                    {isYearly && (
                      <span className="ml-1 px-1 py-0.5 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200 text-[10px] rounded">
                        -16%
                      </span>
                    )}
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              {/* Plans grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {visiblePlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => handlePlanClick(plan)}
                    className={`p-4 bg-background rounded-lg cursor-pointer hover:bg-muted border border-border relative ${
                      !plan.isActive ? "opacity-60 hover:opacity-60" : ""
                    }`}
                  >
                    {!plan.isActive && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10 dark:bg-white/10 rounded-lg">
                        <span className="absolute top-2 right-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                          {language === "en" ? "Coming Soon" : "በቅርብ ጊዜ"}
                        </span>
                      </div>
                    )}
                    
                    <h4 className="font-semibold mb-1">
                      {language === "en" ? plan.name_en : plan.name_am}
                    </h4>
                    
                    <div className="text-xl font-bold mb-2">
                      {getPlanPrice(plan) ? (
                        <>
                          {getPlanPrice(plan)?.toLocaleString()} {language === "en" ? "Br" : "ብር"}
                          <span className="text-xs font-normal text-muted-foreground">
                            /{language === "en" ? "month" : "ወር"}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm">
                          {language === "en" ? "Contact Support" : "ድጋፍን ያግኙ"}
                        </span>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground mb-2">
                      {language === "en"
                        ? plan.description_en
                        : plan.description_am}
                    </p>
                    
                    <Button 
                      size="sm" 
                      className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white"
                    >
                      {language === "en" ? "Subscribe" : "ይመዝገቡ"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Payment Dialog */}
      <PaymentDialog
        isOpen={showPaymentDialog}
        onClose={() => setShowPaymentDialog(false)}
        plan={activePlan}
        isYearly={isYearly}
        onConfirm={handlePaymentConfirm}
        isTrial={false}
      />
    </div>
  );
}