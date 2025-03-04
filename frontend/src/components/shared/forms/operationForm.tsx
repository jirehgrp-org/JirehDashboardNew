/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// @/components/shared/forms/operationForm.tsx

"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";
import { useInventory } from "@/hooks/features/useInventory";
import { useAuth } from "@/hooks/shared/useAuth"; 
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
  const formT = translations[language].dashboard.form;
  const schema = getSchemaForVariant(variant, language);
  const { user } = useAuth(); // Get current user info
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch branches for the branch select field
  const { data: branches } = useInventory({
    endpoint: "branches",
  });

  const isAdmin = user?.role === "admin" || user?.role === "owner";

  const customResolver = (values: any, context: any, options: any) => {
    const processedValues = { ...values };
    
    if (processedValues.email === "") {
      processedValues.email = undefined;
    }
    
    const resolver = zodResolver(schema);
    return resolver(processedValues, context, options);
  };

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      name: "",
      active: true,
      branchId: "",
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

  const generateUsername = (fullName: string) => {
    const firstName = fullName.split(" ")[0]; // Extract the first name
    const formattedName = firstName.toLowerCase().replace(/[^a-z]/g, ""); // Keep only letters
  
    if (!formattedName) return "";
  
    const suffix = Math.floor(100 + Math.random() * 900); // Generate a three-digit number
    return `${formattedName}${suffix}`;
  };
  

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    
    try {
      if (data.email === "") {
        data.email = null;
      }
      
      if (variant === "user" && data.phone) {
        data.phone = data.phone.startsWith("+251")
          ? data.phone
          : data.phone.startsWith("251")
          ? `+${data.phone}`
          : `+251${data.phone.replace(/^0+/, "")}`;
      }
  
      setTimeout(() => {
        onSubmit(data);
        setIsSubmitting(false);
      }, 2000);
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);
    }
  };

  // Define loading states for the multistep loader
  const loadingStates = variant === "user" 
    ? [
        { text: "Creating user account..." },
        { text: "Setting up permissions..." },
        { text: "Configuring branch settings..." },
        { text: "Finalizing user creation..." },
      ]
    : [
        { text: "Processing expense data..." },
        { text: "Calculating totals..." },
        { text: "Finalizing expense record..." },
      ];

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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
                      onChange={(e) => {
                        field.onChange(e);
                        if (variant === "user" && !initialData) {
                          const generatedUsername = generateUsername(
                            e.target.value
                          );
                          form.setValue("username", generatedUsername);
                        }
                      }}
                      disabled={isSubmitting}
                    />
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
                          className="h-10 bg-neutral-100 dark:bg-neutral-800"
                          readOnly={!initialData}
                          disabled={isSubmitting}
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
                        {/* No required indicator */}
                      </FormLabel>
                      <FormControl className="w-3/4">
                        <Input
                          {...field}
                          type="email"
                          placeholder={formT.emailPlaceholder}
                          className="h-10"
                          disabled={isSubmitting}
                          // Clear any validation errors when empty
                          onChange={(e) => {
                            field.onChange(e);
                            // Clear validation errors if field is empty
                            if (e.target.value === "") {
                              form.clearErrors("email");
                            }
                          }}
                        />
                      </FormControl>
                    </div>
                    {/* Explicitly clear error message for email */}
                    {/* <FormMessage /> */}
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
                        <div className="flex items-center">
                          <div className="flex items-center justify-center px-3 h-10 border border-r-0 rounded-l-md border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                            +251
                          </div>
                          <Input
                            {...field}
                            type="tel"
                            placeholder={formT.phonePlaceholder}
                            className="h-10 rounded-l-none"
                            maxLength={9}
                            minLength={9}
                            pattern="[0-9]{9,10}"
                            value={field.value?.replace(/^\+251/, "")}
                            disabled={isSubmitting}
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
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="h-10 w-3/4">
                            <SelectValue placeholder={formT.rolePlaceholder} />
                          </SelectTrigger>
                          <SelectContent>
                            {/* Allow admin role for everyone */}
                            <SelectItem value="admin">{formT.admin}</SelectItem>
                            {/* Don't show manager and owner roles at all */}
                            {/* <SelectItem value="manager">{formT.manager}</SelectItem> */}
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
                          disabled={isSubmitting}
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
                        {formT.description}
                      </FormLabel>
                      <FormControl className="w-3/4">
                        <Textarea
                          {...field}
                          placeholder={formT.descriptionPlaceholder}
                          className="h-20"
                          disabled={isSubmitting}
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
                          disabled={isSubmitting}
                        >
                          <SelectTrigger className="h-10 w-3/4">
                            <SelectValue
                              placeholder={formT.frequencyPlaceholder}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="once">{formT.oneTime}</SelectItem>
                            <SelectItem value="daily">{formT.daily}</SelectItem>
                            <SelectItem value="weekly">{formT.weekly}</SelectItem>
                            <SelectItem value="monthly">
                              {formT.monthly}
                            </SelectItem>
                            <SelectItem value="quarterly">
                              {formT.quarterly}
                            </SelectItem>
                            <SelectItem value="halfYearly">
                              {formT.halfYearly}
                            </SelectItem>
                            <SelectItem value="yearly">{formT.yearly}</SelectItem>
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
              disabled={isSubmitting}
            >
              {formT.cancel}
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting 
                ? variant === "user" 
                  ? formT.creatingUser || "Creating..." 
                  : formT.creating || "Creating..."
                : initialData ? formT.update : formT.create}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}