// @/lib/schemas/order.ts

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
      .string()
      .email(t.orderSchema?.invalidEmail || "Invalid email")
      .optional(),

    item: z.string().min(1, t.orderSchema?.itemRequired || "Item is required"),

    quantity: z
      .number()
      .min(1, t.orderSchema?.quantityRequired || "Quantity must be at least 1"),

    status: z.enum(["pending", "completed", "cancelled"]).default("pending"),
    paymentStatus: z.enum(["pending", "paid", "cancelled"]).default("pending"),

    actions: z
      .array(
        z.object({
          type: z.enum(["mark_paid", "cancel"]),
          timestamp: z.date(),
          performedBy: z.string(),
        })
      )
      .default([]),
  });
};
