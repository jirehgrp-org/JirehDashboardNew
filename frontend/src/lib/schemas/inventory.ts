// @/lib/schemas/inventory.ts

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
  });
};


export const BranchSchema = (language: SupportedLanguages = "en") => {
  const t = getSchemaTranslations(language);

  return BaseSchema(language).extend({
    address: z.string().min(1, t.branchSchema.addressIsRequired),
    contactNumber: z.string().min(1, t.branchSchema.contactNumberIsRequired),
  });
};

export const CategorySchema = (language: SupportedLanguages = "en") => {
  return BaseSchema(language).extend({
    description: z.string().optional(),
  });
};

export const ItemSchema = (language: SupportedLanguages = "en") => {
  const t = getSchemaTranslations(language);
  return BaseSchema(language).extend({
    price: z
      .number()
      .min(0, t.itemSchema?.pricePositive || "Price must be positive"),
    quantity: z
      .number()
      .min(0, t.itemSchema?.quantityIsRequired || "Quantity is required"),
    categoryId: z
      .string()
      .min(1, t.itemSchema?.categoryRequired || "Category is required"),
    branchId: z
      .string()
      .min(1, t.itemSchema?.branchRequired || "Branch is required"),
    unitOfMeasure: z.string().optional(),
  });
};

// Function to get the appropriate schema based on variant
export const getSchemaForVariant = (
  variant: "branch" | "category" | "item",
  language: SupportedLanguages = "en"
) => {
  switch (variant) {
    case "branch":
      return BranchSchema(language);
    case "category":
      return CategorySchema(language);
    case "item":
      return ItemSchema(language);
  }
};