// @/components/features/auth/PaymentDialog.tsx

import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { usePlans } from "@/hooks/features/usePlan";
import { PaymentDialogProps, PaymentData } from "@/types/features/plan";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";

export function PaymentDialog({
  isOpen,
  onClose,
  plan,
  isYearly,
  onConfirm,
  isTrial = false,
}: PaymentDialogProps) {
  const { language } = useLanguage();
  const t = translations[language].auth.subscription;
  const [paymentMethod, setPaymentMethod] = useState("");
  const [reference, setReference] = useState("");
  const { getPlan } = usePlans();

  const currentPlan = plan?.id ? getPlan(plan.id) : null;
  const subtotal = currentPlan
    ? isYearly
      ? currentPlan.yearlyPrice || 0
      : currentPlan.monthlyPrice || 0
    : 0;
  const tot = subtotal * 0.15;
  const total = subtotal + tot;

  const handleConfirm = () => {
    if (isTrial) {
      onConfirm({} as PaymentData);
    } else {
      onConfirm({
        paymentMethod,
        reference,
        total,
        isYearly,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose} modal>
      <DialogContent className="max-w-md p-6 z-[100]">
        <DialogTitle asChild>
          <VisuallyHidden>
            {isTrial ? t.trialDialog.startTrial : t.paymentDialog.complete}
          </VisuallyHidden>
        </DialogTitle>

        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold">
            {isTrial ? (
              t.trialDialog.startTrial
            ) : (
              <>
                {t.paymentDialog.completeYour}{" "}
                {isYearly ? t.paymentDialog.annual : t.paymentDialog.monthly}{" "}
                {t.paymentDialog.subscription}
              </>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700"
          />
        </div>

        {isTrial ? (
          <div className="space-y-6">
            <p className="text-sm text-neutral-700 dark:text-white">
              {t.trialDialog.description}
            </p>

            <div className="space-y-4 bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
              <h3 className="font-medium">{t.trialDialog.includes}:</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {t.trialDialog.fullAccess}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {t.trialDialog.noCost}
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  {t.trialDialog.cancel}
                </li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-neutral-600 mb-6">
              {t.paymentDialog.chooseYourPreferred}
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-3">
                  {t.paymentDialog.priceBreakdown}
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-600">
                      {t.paymentDialog.subtotal} (
                      {isYearly
                        ? t.paymentDialog.annual
                        : t.paymentDialog.monthly}
                      )
                    </span>
                    <span>
                      {subtotal?.toLocaleString()} {t.paymentDialog.br}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600">
                      {t.paymentDialog.tot} (15%){" "}
                    </span>
                    <span>
                      {tot.toLocaleString()} {t.paymentDialog.br}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>{t.paymentDialog.total}</span>
                    <span>
                      {total.toLocaleString()} {t.paymentDialog.br}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>{t.paymentDialog.referenceNumber}</Label>
                <Input
                  placeholder={t.paymentDialog.referenceNumberPlaceholder}
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <Label>{t.paymentDialog.selectPaymentMethod}</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="telebirr" id="telebirr" />
                    <Label htmlFor="telebirr">{t.paymentDialog.teleBirr}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cbe" id="cbe" />
                    <Label htmlFor="cbe">{t.paymentDialog.cbe}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="awash" id="awash" />
                    <Label htmlFor="awash">{t.paymentDialog.awashBank}</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </>
        )}

        <Button
          className="w-full bg-zinc-300 dark:bg-zinc-700 text-black dark:text-white mt-6"
          onClick={handleConfirm}
          disabled={!isTrial && (!paymentMethod || !reference)}
        >
          {isTrial ? t.trialDialog.start : t.paymentDialog.confirmPayment}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
