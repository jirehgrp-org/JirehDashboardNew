// @/components/shared/cards/ListCard.tsx

import React, { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export interface ListItemProps {
  title: string;
  subtitle?: string;
  value: string | number;
  subvalue?: string;
  index?: number;
}

export interface ListCardProps {
  title: string;
  description?: string;
  items: ListItemProps[];
  action?: ReactNode;
  maxItems?: number;
  renderCustomItem?: (item: ListItemProps) => ReactNode;
}

export const ListCard: React.FC<ListCardProps> = ({
  title,
  description,
  items,
  action,
  maxItems = Infinity,
  renderCustomItem,
}) => {
  const displayItems = items.slice(0, maxItems);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {action && <div>{action}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayItems.map((item, index) =>
            renderCustomItem ? (
              renderCustomItem({ ...item, index })
            ) : (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.index !== undefined && (
                    <span className="text-sm font-medium">
                      {item.index + 1}.
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-xs text-muted-foreground">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {typeof item.value === "number"
                      ? item.value.toLocaleString()
                      : item.value}
                  </p>
                  {item.subvalue && (
                    <p className="text-xs text-muted-foreground">
                      {item.subvalue}
                    </p>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
};