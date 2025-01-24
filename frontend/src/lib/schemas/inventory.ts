// @/lib/schemas/inventory.ts

import * as z from "zod";
import { translations } from "@/translations";

type SupportedLanguages = keyof typeof translations;

const getSchemaTranslations = (language: SupportedLanguages = "en") => {
  return translations[language].dashboard.inventory.locations.schemas;
};

export const LocationSchema = (language: SupportedLanguages = "en") => {
  const t = getSchemaTranslations(language);

  return z.object({
    name: z.string().min(1, t.locationSchema.nameIsRequired),
    address: z.string().min(1, t.locationSchema.addressIsRequired),
    contactNumber: z.string().min(1, t.locationSchema.contactNumberIsRequired),
    active: z.boolean().default(true),
  });
};

export const CategorySchema = (language: SupportedLanguages = "en") => {
  const t = getSchemaTranslations(language);

  return z.object({
    name: z
      .string()
      .min(2, t.categorySchema?.nameIsRequired || "Name is required"),
    description: z.string().optional(),
    locationId: z
      .string()
      .min(1, t.categorySchema?.locationIsRequired || "Location is required"),
    active: z.boolean().default(true),
  });
};

export const ItemSchema = (language: SupportedLanguages = "en") => {
  const t = getSchemaTranslations(language);

  return z.object({
    name: z
      .string()
      .min(2, t.itemSchema?.nameMin || "Name must be at least 2 characters"),
    description: z.string().optional(),
    price: z
      .number()
      .min(0, t.itemSchema?.pricePositive || "Price must be positive"),
    categoryId: z
      .string()
      .min(1, t.itemSchema?.categoryRequired || "Category is required"),
    active: z.boolean().default(true),
  });
};
