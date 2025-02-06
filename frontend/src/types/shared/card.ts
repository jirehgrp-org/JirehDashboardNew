// @/types/shared/card.ts

import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface BaseCardProps {
  className?: string;
  children?: ReactNode;
}

export interface MetricCardProps extends BaseCardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  valuePrefix?: string;
  valueSuffix?: string;
}

export interface ChartCardProps extends BaseCardProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export interface ListItemProps {
  title: string;
  subtitle?: string;
  value: string | number;
  subvalue?: string;
  index?: number;
}

export interface ListCardProps extends BaseCardProps {
  title: string;
  description?: string;
  items: ListItemProps[];
  action?: ReactNode;
  maxItems?: number;
  renderCustomItem?: (item: ListItemProps) => ReactNode;
}
