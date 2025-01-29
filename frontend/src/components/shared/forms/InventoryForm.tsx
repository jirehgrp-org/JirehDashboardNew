// @/components/shared/forms/InventoryForm.tsx
"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  ItemSchema,
  CategorySchema,
  LocationSchema,
} from "@/lib/schemas/inventory";
import type { InventoryFormProps } from "@/types/features/inventory";

export function InventoryForm({
  variant,
  initialData,
  onSubmit,
  onCancel,
}: InventoryFormProps) {
  const { language } = useLanguage();
  const t = translations[language].dashboard.inventory.locations.form;

  const schema =
    variant === "item"
      ? ItemSchema(language)
      : variant === "category"
      ? CategorySchema(language)
      : LocationSchema(language);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      name: "",
      address: "",
      description: "",
      contactNumber: "",
      active: true,
      ...(variant === "category" && {
        price: "",
        locationId: "",
      }),
      ...(variant === "item" && {
        price: "",
        quantity: "",
        categoryId: "",
      }),
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {variant === "location" && (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="w-1/4 text-right">{t.name}</FormLabel>
                    <FormControl className="w-3/4">
                      <Input
                        {...field}
                        placeholder={t.namePlaceholder}
                        className="h-10"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="w-1/4 text-right">
                      {t.address}
                    </FormLabel>
                    <FormControl className="w-3/4">
                      <Input
                        {...field}
                        placeholder={t.addressPlaceholder}
                        className="h-10"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactNumber"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    {/* Label */}
                    <FormLabel className="w-1/4 text-right">
                      {t.contactNumber}
                    </FormLabel>

                    {/* Input with validation */}
                    <FormControl className="w-3/4">
                      <div className="flex items-center">
                        {/* Country Code */}
                        <div className="flex items-center justify-center px-3 h-10 border border-r-0 rounded-l-md border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          +251
                        </div>

                        {/* Number Input */}
                        <Input
                          {...field}
                          type="tel"
                          placeholder={t.contactNumberPlaceholder}
                          className="h-10 rounded-l-none"
                          maxLength={10}
                          minLength={9}
                          pattern="[0-9]{9,10}"
                          title="Please enter a valid contact number with 9 to 10 digits."
                        />
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="w-1/4 text-right">
                      {t.active}
                    </FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        {variant === "category" && (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="w-1/4 text-right">{t.name}</FormLabel>
                    <FormControl className="w-3/4">
                      <Input
                        {...field}
                        placeholder={t.namePlaceholder}
                        className="h-10"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="w-1/4 text-right">
                      {t.description}
                    </FormLabel>
                    <FormControl className="w-3/4">
                      <Input
                        {...field}
                        placeholder={t.descriptionPlaceholder}
                        className="h-10"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="locationId"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="w-1/4 text-right">
                      {t.location}
                    </FormLabel>
                    <FormControl className="w-3/4">
                      <Input
                        {...field}
                        placeholder={t.locationPlaceholder}
                        className="h-10"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="w-1/4 text-right">
                      {t.active}
                    </FormLabel>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t.cancel}
          </Button>
          <Button type="submit">{initialData ? t.update : t.create}</Button>
        </div>
      </form>
    </Form>
  );
}