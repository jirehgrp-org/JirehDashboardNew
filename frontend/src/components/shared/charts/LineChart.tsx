/* eslint-disable @typescript-eslint/no-explicit-any */
// @/components/shared/charts/LineChart

import React from "react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export interface LineChartProps {
  data: Array<Record<string, any>>;
  height?: number | string;
  xDataKey: string;
  yDataKey: string;
  stroke?: string;
  tooltipFormatter?: (value: number) => string;
  xAxisFormatter?: (value: string) => string;
  yAxisFormatter?: (value: number) => string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  height = 300,
  xDataKey,
  yDataKey,
  stroke = "#8884d8",
  tooltipFormatter,
  xAxisFormatter,
  yAxisFormatter,
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xDataKey} tickFormatter={xAxisFormatter} />
        <YAxis tickFormatter={yAxisFormatter} />
        <Tooltip formatter={tooltipFormatter} />
        <Line
          type="monotone"
          dataKey={yDataKey}
          stroke={stroke}
          strokeWidth={2}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;