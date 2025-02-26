/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { useInventory } from "@/hooks/features/useInventory";
import type { InventoryFormProps } from "@/types/features/inventory";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getSchemaForVariant } from "@/lib/schemas/inventory";

const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>;

export function InventoryForm({
  variant,
  initialData,
  onSubmit,
  onCancel,
}: InventoryFormProps) {
  const { language } = useLanguage();
  const formT = translations[language].dashboard.form;
  const schema = getSchemaForVariant(variant, language);

  const { data: branches } = useInventory({
    endpoint: "branches",
  });

  const { data: categories } = useInventory({
    endpoint: "categories",
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      name: "",
      description: "",
      active: true,
      ...(variant === "branch" && {
        address: "",
        contactNumber: "",
      }),
      ...(variant === "category" && {
        description: "",
      }),
      ...(variant === "item" && {
        price: 0,
        quantity: 0,
        categoryId: "",
        branchId: "",
        unitOfMeasure: "",
      }),
    },
  });

  // Custom submit handler to ensure proper data formatting
  // When submitting the item form
  const handleSubmit = (data: any) => {
    // Format the data if needed before passing to parent onSubmit
    if (variant === "item") {
      // Ensure numeric fields are properly typed
      const formattedData = {
        ...data,
        price:
          typeof data.price === "string" ? parseFloat(data.price) : data.price,
        quantity:
          typeof data.quantity === "string"
            ? parseInt(data.quantity, 10)
            : data.quantity,
        // Make sure these fields are properly set:
        branchId: data.branchId,
        categoryId: data.categoryId,
      };
      onSubmit(formattedData);
    } else {
      onSubmit(data);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {/* Common fields for all variants */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormLabel className="w-1/4 text-right">
                  {formT.name}
                  <RequiredIndicator />
                </FormLabel>
                <FormControl className="w-3/4">
                  <Input
                    {...field}
                    placeholder={formT.namePlaceholder}
                    className="h-10"
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Branch variant fields */}
        {variant === "branch" && (
          <>
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="w-1/4 text-right">
                      {formT.address}
                      <RequiredIndicator />
                    </FormLabel>
                    <FormControl className="w-3/4">
                      <Input
                        {...field}
                        placeholder={formT.addressPlaceholder}
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
                    <FormLabel className="w-1/4 text-right">
                      {formT.contactNumber}
                      <RequiredIndicator />
                    </FormLabel>
                    <FormControl className="w-3/4">
                      <div className="flex items-center">
                        <div className="flex items-center justify-center px-3 h-10 border border-r-0 rounded-l-md border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          +251
                        </div>
                        <Input
                          {...field}
                          type="tel"
                          placeholder={formT.contactNumberPlaceholder}
                          className="h-10 rounded-l-none"
                          maxLength={9}
                          minLength={9}
                          pattern="[0-9]{9,10}"
                        />
                      </div>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Category variant fields */}
        {variant === "category" && (
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-4">
                  <FormLabel className="w-1/4 text-right">
                    {formT.description}
                  </FormLabel>
                  <FormControl className="w-3/4">
                    <Textarea
                      {...field}
                      placeholder={formT.descriptionPlaceholder}
                      className="h-20"
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Item variant fields */}
        {variant === "item" && (
          <>
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="w-1/4 text-right">
                      {formT.price}
                      <RequiredIndicator />
                    </FormLabel>
                    <FormControl className="w-3/4">
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={formT.pricePlaceholder}
                        className="h-10"
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="w-1/4 text-right">
                      {formT.quantity}
                      <RequiredIndicator />
                    </FormLabel>
                    <FormControl className="w-3/4">
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="1"
                        placeholder={formT.quantityPlaceholder}
                        className="h-10"
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value, 10))
                        }
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="w-1/4 text-right">
                      {formT.category}
                      <RequiredIndicator />
                    </FormLabel>
                    <FormControl className="w-3/4">
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-10 w-3/4">
                          <SelectValue
                            placeholder={formT.categoryPlaceholder}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {categories
                            ?.filter((category) => category.active)
                            .map((category) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="w-1/4 text-right">
                      {formT.branch}
                      <RequiredIndicator />
                    </FormLabel>
                    <FormControl className="w-3/4">
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-10 w-3/4">
                          <SelectValue placeholder={formT.branchPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          {branches
                            ?.filter((branch) => branch.active)
                            .map((branch) => (
                              <SelectItem key={branch.id} value={branch.id}>
                                {branch.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="unitOfMeasure"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="w-1/4 text-right">
                      {formT.unitOfMeasure}
                    </FormLabel>
                    <FormControl className="w-3/4">
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-10 w-3/4">
                          <SelectValue
                            placeholder={formT.unitOfMeasurePlaceholder}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pieces">{formT.pieces}</SelectItem>
                          <SelectItem value="kg">{formT.kg}</SelectItem>
                          <SelectItem value="g">{formT.g}</SelectItem>
                          <SelectItem value="L">{formT.L}</SelectItem>
                          <SelectItem value="ml">{formT.ml}</SelectItem>
                          <SelectItem value="m">{formT.m}</SelectItem>
                          <SelectItem value="box">{formT.box}</SelectItem>
                          <SelectItem value="pack">{formT.pack}</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {/* Common active field for all variants */}
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormLabel className="w-1/4 text-right">
                  {formT.active}
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

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            {formT.cancel}
          </Button>
          <Button type="submit">
            {initialData ? formT.update : formT.create}
          </Button>
        </div>
      </form>
    </Form>
  );
}
