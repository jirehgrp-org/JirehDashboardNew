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
    locationName: z.string().min(1, t.locationSchema.nameIsRequired),
    address: z.string().min(1, t.locationSchema.addressIsRequired),
    contactNumber: z.string().min(1, t.locationSchema.contactNumberIsRequired),
    active: z.boolean().default(true),
  });
};

export const CategorySchema = (language: SupportedLanguages = "en") => {
  const t = getSchemaTranslations(language);

  return z.object({
    categoryName: z
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
    itemName: z.string().min(2, t.itemSchema?.nameIsRequired || "Name is required"),
    price: z
      .number()
      .min(0, t.itemSchema?.pricePositive || "Price must be positive"),
    quantity: z
      .number()
      .min(0, t.itemSchema?.quantityIsRequired || "Quantity is required"),
    categoryId: z
      .string()
      .min(1, t.itemSchema?.categoryRequired || "Category is required"),
    active: z.boolean().default(true),
  });
};
