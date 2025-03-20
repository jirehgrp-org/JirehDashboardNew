// @/components/shared/dialogs/CategorySelectionDialog.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useLanguage } from "@/components/context/LanguageContext";
import { translations } from "@/translations";
import type { CategoryItem } from "@/types/features/inventory";
import type { InventoryItem } from "@/types/features/inventory";

interface CategorySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  category: CategoryItem | null;
  items: InventoryItem[];
  onItemsSelected: (selectedItems: InventoryItem[]) => void;
}

const CategorySelectionDialog = ({
  open,
  onOpenChange,
  category,
  items,
  onItemsSelected,
}: CategorySelectionDialogProps) => {
  const { language } = useLanguage();
  const t = translations[language].dashboard.form;
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);

  const handleItemToggle = (item: InventoryItem) => {
    const isSelected = selectedItems.some((i) => i.id === item.id);
    if (isSelected) {
      setSelectedItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      setSelectedItems([...selectedItems, item]);
    }
  };

  const handleDone = () => {
    onItemsSelected(selectedItems);
    onOpenChange(false);
  };

  if (!category) return null;

  const categoryItems = items.filter(item => item.categoryId === category.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {category.name} - {t.selectItems}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 py-4">
          {categoryItems.map((item) => {
            const isSelected = selectedItems.some((i) => i.id === item.id);
            return (
              <div
                key={item.id}
                className={`border rounded-md p-3 cursor-pointer transition-all ${
                  isSelected ? "border-primary bg-primary/10" : "hover:border-gray-400"
                }`}
                onClick={() => handleItemToggle(item)}
              >
                <div className="flex justify-between items-start">
                  <div className="text-sm font-medium">{item.name}</div>
                  {isSelected && (
                    <div className="bg-primary text-primary-foreground rounded-full p-1">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t.price}: {(item.price ?? 0).toLocaleString()}
                </div>
                {(item.quantity ?? 0) > 0 ? (
                  <div className="text-xs text-muted-foreground">
                    {t.stock}: {item.quantity}
                  </div>
                ) : (
                  <div className="text-xs text-destructive">
                    {t.outOfStock}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t.cancel}
          </Button>
          <Button onClick={handleDone}>
            {t.done} ({selectedItems.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CategorySelectionDialog;