"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
  Cell,
} from "recharts";
import ChartCustomTooltip from "./ChartCustomTooltip";
import { type IBarChartData } from "@/types";
import { getCategoryColor } from "@/lib/utils/chartColors";

interface DataBarChartProps {
  data: IBarChartData[];
  height: number;
  truncateLabel?: boolean;
  orientation?: "horizontal" | "vertical";
  xDataKey?: string;
  yDataKey?: string;
}

// Determine if this is a grouped bar chart with multiple data points
function isGroupedBarchart(data: IBarChartData[]): boolean {
  if (!data?.length || !data[0]) {
    return false;
  }

  const isGrouped =
    Object.keys(data[0]).filter((key) => key !== "name" && key !== "Total")
      .length > 0;

  return isGrouped;
}

/**
 * DataBarChart component renders a bar chart visualization
 * with different colors for each category.
 */
export function DataBarChart({
  data,
  height,
  truncateLabel = true,
  orientation = "horizontal",
  xDataKey = "name",
  yDataKey = "Total",
}: DataBarChartProps) {
  const isVertical = orientation === "vertical";
  const isGroupedBarChart = isGroupedBarchart(data);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        maxBarSize={50}
        layout={isVertical ? "vertical" : "horizontal"}
        margin={{
          top: 5,
          right: 10,
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
              truncateLabel={truncateLabel}
              activeItem={isVertical ? "y" : "x"}
            />
          )}
          cursor={false}
        />
        {!isVertical ? (
          <XAxis
            dataKey={xDataKey}
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              if (
                typeof value === "string" &&
                truncateLabel &&
                value.length > 20
              ) {
                return `${value.slice(0, 20)}...`;
              }
              return value;
            }}
          />
        ) : (
          <XAxis
            type="number"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
        )}
        {!isVertical ? (
          <YAxis
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
        ) : (
          <YAxis
            dataKey={xDataKey}
            type="category"
            stroke="#888888"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => {
              if (
                typeof value === "string" &&
                truncateLabel &&
                value.length > 20
              ) {
                return `${value.slice(0, 20)}...`;
              }
              return value;
            }}
          />
        )}
        {isGroupedBarChart && <Legend />}

        {isGroupedBarChart && data[0] ? (
          Object.keys(data[0])
            .filter((key) => key !== "name" && key !== "Total")
            .map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={getCategoryColor(key, index)}
                name={key}
                radius={
                  orientation === "horizontal" ? [4, 4, 0, 0] : [0, 4, 4, 0]
                }
              />
            ))
        ) : (
          <Bar
            dataKey={yDataKey}
            fill="#7B39ED"
            radius={orientation === "horizontal" ? [4, 4, 0, 0] : [0, 4, 4, 0]}
          >
            {/* Individually color each bar based on its category name */}
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getCategoryColor(entry.name, index)}
              />
            ))}
          </Bar>
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
