/* eslint-disable @typescript-eslint/no-explicit-any */
// @/components/shared/forms/TransactionForm

"use client";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderSchema } from "@/lib/schemas/transaction";
import { useLanguage } from "@/components/context/LanguageContext";
import { useInventory } from "@/hooks/features/useInventory";
import { translations } from "@/translations";
import type { TransactionFormProps } from "@/types/features/transaction";
import type { CategoryItem, InventoryItem } from "@/types/features/inventory";
import CategorySelectionDialog from "@/components/features/dashboard/CategorySelectionDialog";
import { Minus, Plus, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import _ from "lodash";

interface CartItem extends InventoryItem {
  orderQuantity: number;
}

const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>;

export function TransactionForm({
  initialData,
  onSubmit,
  onCancel,
  serviceType,
}: TransactionFormProps) {
  const { language } = useLanguage();
  const formT = translations[language].dashboard.form;
  const schema = OrderSchema(language);

  // Get inventory items and categories
  const { data: items } = useInventory({ endpoint: "items" });
  const { data: categories } = useInventory({ endpoint: "categories" });
  
  // Cart state
  const [cartItems, setCartItems] = React.useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<CategoryItem | null>(null);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);

  // Group items by category
  const itemsByCategory = React.useMemo(() => {
    return _.groupBy(
      items?.filter(
        (item: InventoryItem) => item.active && (item.quantity ?? 0) > 0
      ) || [],
      "categoryId"
    );
  }, [items]);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialData || {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
    },
  });

  const getFoodServiceCustomerInfo = () => {
    return {
      customerName: "Guest",
      customerPhone: "912345678",
      customerEmail: "guest@example.com",
      paymentMethod: "Cash"
    };
  };

  const handleUpdateQuantity = (itemId: string, change: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === itemId
            ? {
              ...item,
              orderQuantity: Math.min(
                Math.max(item.orderQuantity + change, 0),
                item.quantity!
              ),
            }
            : item
        )
        .filter((item) => item.orderQuantity > 0)
    );
  };

  const handleItemsSelected = (items: InventoryItem[]) => {
    const newCartItems = [...cartItems];

    items.forEach(item => {
      const existingIndex = newCartItems.findIndex(i => i.id === item.id);
      if (existingIndex >= 0) {
        return;
      }

      newCartItems.push({
        ...item,
        orderQuantity: 1
      });
    });

    setCartItems(newCartItems);
  };


  const filteredCategories = categories?.filter(
    (cat) =>
      cat.active &&
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveFromCart = (itemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (item.price || 0) * item.orderQuantity,
      0
    );
  };

  const handleFormSubmit = (formData: any) => {
    if (cartItems.length === 0) return;

    const items = cartItems.map((item) => ({
      itemId: item.id,
      quantity: item.orderQuantity,
      price: item.price || 0,
    }));

    // Use food service defaults if in food service mode
    const customerInfo = serviceType === "foodService"
      ? getFoodServiceCustomerInfo()
      : formData;

    const orderData = {
      ...customerInfo,
      items,
      total: calculateTotal(),
      orderDate: new Date().toISOString(),
    };

    // Remove empty email for retail mode
    if (serviceType === "retail" && !formData.customerEmail) {
      delete orderData.customerEmail;
    }

    onSubmit(orderData);
  };

  return (
    <div className="flex gap-6">
      {/* Left Column - Categories and Items */}
      <div className="w-1/2 space-y-4">
        <h3 className="text-lg font-medium mb-4">{formT.itemSelection}</h3>
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="space-y-4">
          <div className="font-medium">{formT.selectCategories || "Select Categories"}</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {filteredCategories?.filter(cat => cat.active).map((category) => (
              <div
                key={category.id}
                className="border rounded-md p-4 cursor-pointer hover:border-primary transition-all flex flex-col items-center justify-center text-center"
                onClick={() => {
                  setSelectedCategory(category);
                  setCategoryDialogOpen(true);
                }}
              >
                <div className="font-medium">{category.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {(itemsByCategory[category.id] || []).length} {formT.items || "items"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Column - Order Summary and Customer Info */}
      <div className="w-1/2 space-y-6">
        {/* Order Summary */}
        <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4 space-y-4 flex flex-col">
          <h3 className="text-lg font-medium">{formT.orderSummary}</h3>
          <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-neutral-500">
                    {formT.birr} {item.price} x {item.orderQuantity}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdateQuantity(item.id, -1)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <Input
                    type="number"
                    className="w-16 text-center h-9"
                    value={item.orderQuantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value)) {
                        setCartItems(prev =>
                          prev.map(i => i.id === item.id
                            ? { ...i, orderQuantity: Math.min(Math.max(value, 0), i.quantity!) }
                            : i
                          ).filter(i => i.orderQuantity > 0)
                        );
                      }
                    }}
                    min="1"
                    max={item.quantity}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdateQuantity(item.id, 1)}
                    disabled={item.orderQuantity >= (item.quantity || 0)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveFromCart(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between pt-4 border-t font-medium mt-auto">
            <span>{formT.total}:</span>
            <span>
              {formT.birr} {calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>

        {/* Customer Information */}
        {serviceType === "retail" ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleFormSubmit)}
              className="space-y-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4"
            >
              <h3 className="text-lg font-medium">{formT.customerInfo}</h3>

              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {formT.customerName}
                      <RequiredIndicator />
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={formT.customerNamePlaceholder}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {formT.customerPhone}
                      <RequiredIndicator />
                    </FormLabel>
                    <FormControl>
                      <div className="flex">
                        <div className="flex items-center justify-center px-3 h-10 border border-r-0 rounded-l-md border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400">
                          +251
                        </div>
                        <Input
                          {...field}
                          type="tel"
                          placeholder={formT.customerPhonePlaceholder}
                          className="rounded-l-none"
                          maxLength={9}
                          minLength={9}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{formT.customerEmail}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder={formT.customerEmailPlaceholder}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {formT.paymentMethod}
                      <RequiredIndicator />
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={formT.selectPaymentMethod} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Cash">{formT.cash}</SelectItem>
                        <SelectItem value="Telebirr">{formT.telebirr}</SelectItem>
                        <SelectItem value="Bank Transfer">
                          {formT.bankTransfer}
                        </SelectItem>
                        <SelectItem value="Credit">{formT.credit}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                  {formT.cancel}
                </Button>
                <Button type="submit" disabled={cartItems.length === 0}>
                  {initialData ? formT.update : formT.create}
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <div className="space-y-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg p-4">
            <h3 className="text-lg font-medium">Food Service Mode</h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              Customer information will be automatically filled.
            </p>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                {formT.cancel}
              </Button>
              <Button
                onClick={() => handleFormSubmit(getFoodServiceCustomerInfo())}
                disabled={cartItems.length === 0}
              >
                {initialData ? formT.update : formT.create}
              </Button>
            </div>
          </div>
        )}
      </div>

      <CategorySelectionDialog
        open={categoryDialogOpen}
        onOpenChange={setCategoryDialogOpen}
        category={selectedCategory}
        items={selectedCategory ? itemsByCategory[selectedCategory.id] || [] : []}
        onItemsSelected={handleItemsSelected}
      />
    </div>
  );
}

export default TransactionForm;
