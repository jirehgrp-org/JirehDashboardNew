// @/lib/schemas/transaction.ts

import * as z from "zod";
import { translations } from "@/translations";

type SupportedLanguages = keyof typeof translations;

const getSchemaTranslations = (language: SupportedLanguages = "en") => {
  return translations[language].dashboard.schemas;
};

export const OrderSchema = (language: SupportedLanguages = "en") => {
  const t = getSchemaTranslations(language);

  return z.object({
    customerName: z
      .string()
      .min(
        1,
        t.orderSchema?.customerNameRequired || "Customer name is required"
      ),

    customerPhone: z
      .string()
      .min(
        1,
        t.orderSchema?.customerPhoneRequired || "Customer phone is required"
      ),

    customerEmail: z
      .union([z.string().email(), z.string().length(0)])
      .optional()
      .transform((e) => (e === "" ? undefined : e)),

    paymentMethod: z.enum(["Cash", "Telebirr", "Bank Transfer", "Credit"], {
      required_error: t.orderSchema.paymentMethodRequired || "Payment method is required",
    }),
  });
  
};
