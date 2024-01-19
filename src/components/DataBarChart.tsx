"use client";

import { getColorWithOpacity } from "@/lib/utils/colors";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

interface DataBarChartProps {
  data: {
    name: string;
    [key: string]: number | string;
  }[];
  height: number;
  maxBars?: number;
}

/**
 * IncomesBarChart component renders a bar chart visualization
 * of income data passed in via props.
 */
export function DataBarChart({ data, height, maxBars = 5 }: DataBarChartProps) {
  const maxBarSize = 60;
  const minBarSize = 20;
  const maxBarGap = 40;
  const minBarGap = 10;

  const numBars = Object.keys(data[0] ?? {}).length - 1;

  const barSizeRange = maxBarSize - minBarSize;

  const barSize = Math.max(
    minBarSize,
    maxBarSize - (barSizeRange * (numBars - 1)) / (maxBars - 1),
  );

  const barGapRange = maxBarGap - minBarGap;

  const barGap = Math.max(
    minBarGap,
    maxBarGap - (barGapRange * (numBars - 1)) / (maxBars - 1),
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} barSize={barSize} barGap={barGap}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Legend className="text-primary" />
        {data.map((entry) =>
          Object.keys(entry).map(
            (key, index) =>
              key !== "name" && (
                <Bar
                  key={`${key}-${index}`}
                  dataKey={key}
                  fill={getColorWithOpacity(index, "#7B39ED", numBars)}
                  radius={[4, 4, 0, 0]}
                />
              ),
          ),
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
