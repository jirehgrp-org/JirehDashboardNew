// @/components/features/dashboard/OrderDetailsDialog.tsx

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/context/LanguageContext";
import { useCalendar } from "@/hooks/shared/useCalendar";
import { useInventory } from "@/hooks/features/useInventory";
import { translations } from "@/translations";
import type { TransactionItem } from "@/types/features/transaction";
import type { UserRole } from "@/types/shared/auth";

interface OrderDetailsDialogProps {
  order: TransactionItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAction: (
    order: TransactionItem,
    action: "mark_paid" | "complete" | "cancel"
  ) => void;
}

const OrderDetailsDialog = ({
  order,
  open,
  onOpenChange,
  onAction,
}: OrderDetailsDialogProps) => {
  const { language } = useLanguage();
  const { toEthiopian } = useCalendar();
  const t = translations[language].dashboard.transaction.form;

  // Get inventory items for name lookup
  const { data: items } = useInventory({ endpoint: "items" });

  // Get user role from localStorage
  const userRole = (localStorage.getItem("userRole") as UserRole) || "manager";

  // Permission checks
  const canCancel = ["admin", "manager"].includes(userRole);
  const canMarkPaid = ["admin", "manager", "sales"].includes(userRole);
  const canComplete = ["admin", "manager", "warehouse"].includes(userRole);

  if (!order) return null; 

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {t.order} #{order.orderNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Customer Information */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{t.customerInformation}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-neutral-500">{t.name}:</span>
                <span className="ml-2">{order.customerName}</span>
              </div>
              <div>
                <span className="text-neutral-500">{t.phone}:</span>
                <span className="ml-2">
                  {order.customerPhone.startsWith("0")
                    ? `+251${order.customerPhone.slice(1)}`
                    : order.customerPhone.startsWith("9")
                    ? `+251${order.customerPhone}`
                    : order.customerPhone}
                </span>
              </div>
              {order.customerEmail && (
                <div className="col-span-2">
                  <span className="text-neutral-500">{t.email}:</span>
                  <span className="ml-2">{order.customerEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Items */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{t.orderItems}</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => {
                const inventoryItem = items?.find((i) => i.id === item.itemId);
                return (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{inventoryItem?.name || `Item #${item.itemId}`}</span>
                    <span>
                      {t.qty}: {item.quantity}
                    </span>
                    <span>
                      {t.price}: {item.price.toLocaleString()}
                    </span>
                    <span>
                      {t.total}: {(item.quantity * item.price).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="text-right font-semibold">
              {t.totalOrderValue}: {order.total.toLocaleString()}
            </div>
          </div>

          {/* Order Status */}
          {/* Order Status */}
          <div className="space-y-2">
            <h3 className="font-semibold text-lg">{t.statusInformation}</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-neutral-500">{t.orderStatus}:</span>
                <span className="ml-2 capitalize">
                  {t.status[order.status as keyof typeof t.status]}
                </span>
              </div>
              <div>
                <span className="text-neutral-500">{t.paymentStatus}:</span>
                <span className="ml-2 capitalize">
                  {t.status[order.paymentStatus as keyof typeof t.status]}
                </span>
              </div>
              <div>
                <span className="text-neutral-500">{t.paymentMethod}:</span>
                <span className="ml-2">
                  {
                    t.paymentMethods[
                      order.paymentMethod as keyof typeof t.paymentMethods
                    ]
                  }
                </span>
              </div>
              <div>
                <span className="text-neutral-500">{t.orderDate}:</span>
                <span className="ml-2">
                  {toEthiopian(new Date(order.orderDate))}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {order.status !== "cancelled" && (
            <div className="flex justify-end gap-2 pt-4">
              {order.paymentStatus === "pending" && canMarkPaid && (
                <Button
                  variant="outline"
                  onClick={() => onAction(order, "mark_paid")}
                >
                  {t.markAsPaid}
                </Button>
              )}

              {order.status === "pending" && canComplete && (
                <Button
                  variant="outline"
                  onClick={() => onAction(order, "complete")}
                >
                  {t.completeOrder}
                </Button>
              )}

              {canCancel && (
                <Button
                  variant="destructive"
                  onClick={() => onAction(order, "cancel")}
                >
                  {t.cancelOrder}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailsDialog;