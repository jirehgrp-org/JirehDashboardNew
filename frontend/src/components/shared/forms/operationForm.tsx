// @/components/shared/forms/operationForm.tsx

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
import type { OperationFormProps } from "@/types/features/operation";
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
import { getSchemaForVariant } from "@/lib/schemas/operation";

const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>;

export function OperationForm({
  variant,
  initialData,
  onSubmit,
  onCancel,
}: OperationFormProps) {
  const { language } = useLanguage();
  const formT = translations[language].dashboard.operation.form;

  // Fetch locations for the location select field
  const { data: locations } = useInventory({
    endpoint: "locations",
  });

  const schema = getSchemaForVariant(variant, language);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      name: "",
      active: true,
      locationId: "",
      ...(variant === "user" && {
        username: "",
        email: "",
        phone: "",
        role: "",
      }),
      ...(variant === "expense" && {
        amount: 0,
        description: "",
        frequency: "",
      }),
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

        <FormField
          control={form.control}
          name="locationId"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-4">
                <FormLabel className="w-1/4 text-right">
                  {formT.location}
                  <RequiredIndicator />
                </FormLabel>
                <FormControl className="w-3/4">
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="h-10 w-3/4">
                      <SelectValue placeholder={formT.locationPlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {locations
                        ?.filter((location) => location.active)
                        .map((location) => (
                          <SelectItem key={location.id} value={location.id}>
                            {location.name}
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

        {/* User variant fields */}
        {variant === "user" && (
          <>
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="w-1/4 text-right">
                      {formT.username}
                      <RequiredIndicator />
                    </FormLabel>
                    <FormControl className="w-3/4">
                      <Input
                        {...field}
                        placeholder={formT.usernamePlaceholder}
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="w-1/4 text-right">
                      {formT.email}
                      <RequiredIndicator />
                    </FormLabel>
                    <FormControl className="w-3/4">
                      <Input
                        {...field}
                        type="email"
                        placeholder={formT.emailPlaceholder}
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
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="w-1/4 text-right">
                      {formT.phone}
                      <RequiredIndicator />
                    </FormLabel>
                    <FormControl className="w-3/4">
                      <Input
                        {...field}
                        type="tel"
                        placeholder={formT.phonePlaceholder}
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
              name="role"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="w-1/4 text-right">
                      {formT.role}
                      <RequiredIndicator />
                    </FormLabel>
                    <FormControl className="w-3/4">
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="h-10 w-3/4">
                          <SelectValue placeholder={formT.rolePlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="manager">
                            {formT.manager}
                          </SelectItem>
                          <SelectItem value="admin">{formT.admin}</SelectItem>
                          <SelectItem value="sales">{formT.sales}</SelectItem>
                          <SelectItem value="warehouse">
                            {formT.warehouse}
                          </SelectItem>
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

        {/* Expense variant fields */}
        {variant === "expense" && (
          <>
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="w-1/4 text-right">
                      {formT.amount}
                      <RequiredIndicator />
                    </FormLabel>
                    <FormControl className="w-3/4">
                      <Input
                        {...field}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={formT.amountPlaceholder}
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
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormLabel className="w-1/4 text-right">
                      {formT.frequency}
                      <RequiredIndicator />
                    </FormLabel>
                    <FormControl className="w-3/4">
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={formT.frequencyPlaceholder}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one-time">One Time</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="yearly">Yearly</SelectItem>
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