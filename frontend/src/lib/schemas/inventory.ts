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

export const LocationSchema = (language: SupportedLanguages = "en") => {
  const t = getSchemaTranslations(language);

  return BaseSchema(language).extend({
    address: z.string().min(1, t.locationSchema.addressIsRequired),
    contactNumber: z.string().min(1, t.locationSchema.contactNumberIsRequired),
  });
};

export const CategorySchema = (language: SupportedLanguages = "en") => {
  const t = getSchemaTranslations(language);

  return BaseSchema(language).extend({
    description: z.string().optional(),
    locationId: z
      .string()
      .min(1, t.categorySchema?.locationIsRequired || "Location is required"),
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
  });
};

// Function to get the appropriate schema based on variant
export const getSchemaForVariant = (
  variant: "location" | "category" | "item",
  language: SupportedLanguages = "en"
) => {
  switch (variant) {
    case "location":
      return LocationSchema(language);
    case "category":
      return CategorySchema(language);
    case "item":
      return ItemSchema(language);
  }
};
