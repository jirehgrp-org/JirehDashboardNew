// @/lib/schemas/operation.ts

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
    username: z.string().min(1, t.userSchema.usernameIsRequired),
    email: z.string().min(1, t.userSchema.emailIsRequired),
    phone: z.string().min(1, t.userSchema.phoneIsRequired),
    role: z.string().min(1, t.userSchema.roleIsRequired),
  });
};

export const ExpenseSchema = (language: SupportedLanguages = "en") => {
  const t = getSchemaTranslations(language);

  return BaseSchema(language).extend({
    amount: z
      .number()
      .min(
        0,
        t.expenseSchema?.amountPositiveIsRequired || "Amount must be positive"
      ),
    description: z.string().optional(),
    frequency: z.string().min(1, t.expenseSchema?.frequencyIsRequired),
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
