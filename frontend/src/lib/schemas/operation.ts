// @/lib/schemas/operation.tsx

import * as z from "zod";
import { translations } from "@/translations";

type SupportedLanguages = keyof typeof translations;

const getSchemaTranslations = (language: SupportedLanguages = "en") => {
  return translations[language].dashboard.schemas;
};

// Base schema with common fields
const BaseSchema = (language: SupportedLanguages = "en") => {
  const t = getSchemaTranslations(language);

  return z.object({
    name: z.string().min(1, t.nameIsRequired || "Name is required"),
    active: z.boolean().default(true),
    branchId: z
      .string()
      .min(1, t?.branchIsRequired || "Branch is required"),
  });
};

export const UserSchema = (language: SupportedLanguages = "en") => {
  const t = getSchemaTranslations(language);

  return BaseSchema(language).extend({
    username: z.string().min(1, t.userSchema?.usernameIsRequired || "Username is required"),
    email: z.union([
      z.string().email(t.userSchema?.emailIsRequired || "Valid email is required"),
      z.string().max(0)  // Allow empty string
    ]).optional(),  // Make the field completely optional
    phone: z.string()
      .min(9, t.userSchema?.phoneIsRequired || "Phone must be at least 9 digits")
      .max(12, t.userSchema?.phoneMaxLength || "Phone must be less than 12 digits"),
    role: z.string()
      .refine(
        val => ['manager', 'admin', 'sales', 'warehouse'].includes(val), 
        t.userSchema?.roleIsRequired || "Invalid role selected"
      ),
  });
};

export const ExpenseSchema = (language: SupportedLanguages = "en") => {
  const t = getSchemaTranslations(language);

  return BaseSchema(language).extend({
    amount: z
      .number()
      .min(
        0.01,
        t.expenseSchema?.amountPositiveIsRequired || "Amount must be positive"
      ),
    description: z.string().optional(),
    frequency: z.string()
      .refine(
        val => ['once', 'daily', 'weekly', 'monthly', 'quarterly', 'halfYearly', 'yearly'].includes(val),
        t.expenseSchema?.frequencyIsRequired || "Valid frequency is required"
      ),
  });
};

// Function to get the appropriate schema based on variant
export const getSchemaForVariant = (
  variant: "user" | "expense",
  language: SupportedLanguages = "en"
) => {
  switch (variant) {
    case "user":
      return UserSchema(language);
    case "expense":
      return ExpenseSchema(language);
  }
};