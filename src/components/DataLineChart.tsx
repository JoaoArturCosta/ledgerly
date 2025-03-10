"use client";

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import ChartCustomTooltip from "./ChartCustomTooltip";
import { getCategoryColor } from "@/lib/utils/chartColors";

interface DataLineChartProps {
  data: {
    name: string;
    [key: string]: number | string;
  }[];
  height: number;
  noXAxis?: boolean;
  noYAxis?: boolean;
}

export default function DataLineChart({
  data,
  height,
  noXAxis,
  noYAxis,
}: DataLineChartProps) {
  if (!data || data.length === 0) {
    return <div>No data available</div>;
  }

  // Check if it's a "Total" chart (Progress chart with a single line)
  const isTotalChart =
    data[0] && Object.keys(data[0]).some((k) => k === "Total");

  // Get all keys except 'name' for lines
  const dataKeys = data[0]
    ? Object.keys(data[0]).filter((key) => key !== "name")
    : [];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 15,
          left: 0,
          bottom: 5,
        }}
      >
        <Tooltip
          content={({ active, payload, label }) => (
            <ChartCustomTooltip
              active={!!active}
              payload={payload || []}
              label={label || ""}
            />
          )}
          cursor={false}
        />
        {!noXAxis && (
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
        )}
        {!noYAxis && (
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => (noYAxis ? "" : `$${value}`)}
          />
        )}
        <Legend />

        {dataKeys.map((key, index) => {
          // Skip rendering lines with all zero values
          const hasNonZeroValues = data.some(
            (entry) => typeof entry[key] === "number" && entry[key] !== 0,
          );

          if (!hasNonZeroValues) {
            return null;
          }

          // Get the appropriate color for this category/key
          const lineColor = getCategoryColor(key, index);

          return (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              name={key}
              stroke={lineColor}
              strokeWidth={2}
              dot={{
                fill: "white", // White fill for dots
                stroke: lineColor,
                strokeWidth: 2,
                r: 4,
              }}
              activeDot={{
                fill: "white", // White fill for active dots
                stroke: lineColor,
                strokeWidth: 2,
                r: 6,
              }}
            />
          );
        })}
      </LineChart>
    </ResponsiveContainer>
  );
}
