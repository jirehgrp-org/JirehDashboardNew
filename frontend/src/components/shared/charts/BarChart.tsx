/* eslint-disable @typescript-eslint/no-explicit-any */
// @/components/shared/charts/BarChart

import React from "react";
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface BarChartProps {
  data: Array<Record<string, any>>;
  height?: number | string;
  xDataKey: string;
  yDataKey: string;
  fill?: string;
  tooltipFormatter?: (value: number) => string;
  xAxisFormatter?: (value: string) => string;
  yAxisFormatter?: (value: number) => string;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  height = 300,
  xDataKey,
  yDataKey,
  fill = "#8884d8",
  tooltipFormatter,
  xAxisFormatter,
  yAxisFormatter,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xDataKey} tickFormatter={xAxisFormatter} />
        <YAxis tickFormatter={yAxisFormatter} />
        <Tooltip formatter={tooltipFormatter} />
        <Bar dataKey={yDataKey} fill={fill} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;
