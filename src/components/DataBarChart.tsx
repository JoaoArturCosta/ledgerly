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
import { ChartErrorState, ChartLoadingState } from "./ChartErrorState";
import {
  validateChartData,
  fixFloatingPointPrecision,
  createChartDebugInfo,
  type ChartDataPoint,
} from "@/lib/utils/chartValidation";
import { getCategoryColor } from "@/lib/utils/chartColors";

// Legacy interface for backward compatibility
export interface IBarChartData {
  name: string;
  Total: number;
  [key: string]: string | number;
}

interface DataBarChartProps {
  data: ChartDataPoint[];
  height: number;

  // New intuitive API
  categoryKey?: string; // Field containing category names (e.g., "name")
  valueKey?: string; // Field containing numeric values (e.g., "Total")

  // Legacy props (deprecated but supported)
  /** @deprecated Use categoryKey instead */
  xDataKey?: string;
  /** @deprecated Use valueKey instead */
  yDataKey?: string;

  // Configuration
  orientation?: "horizontal" | "vertical";
  truncateLabel?: boolean;
  maxBarSize?: number;

  // Advanced options
  fixFloatingPoint?: boolean;
  decimalPlaces?: number;
  showDebugInfo?: boolean;
  onRetry?: () => void;
  isLoading?: boolean;

  // Styling
  margin?: {
    top?: number;
    right?: number;
    left?: number;
    bottom?: number;
  };
}

// Determine if this is a grouped bar chart with multiple data points
function isGroupedBarchart(
  data: ChartDataPoint[],
  categoryKey: string,
  valueKey: string,
): boolean {
  if (!data?.length || !data[0]) {
    return false;
  }

  const excludeKeys = new Set([categoryKey, valueKey]);
  const additionalKeys = Object.keys(data[0]).filter(
    (key) => !excludeKeys.has(key),
  );

  return additionalKeys.length > 0;
}

/**
 * DataBarChart component renders a bar chart visualization with professional
 * error handling, validation, and debugging capabilities.
 *
 * @example
 * // Simple usage
 * <DataBarChart
 *   data={chartData}
 *   categoryKey="name"
 *   valueKey="Total"
 *   height={200}
 * />
 *
 * @example
 * // Vertical orientation
 * <DataBarChart
 *   data={chartData}
 *   categoryKey="name"
 *   valueKey="Total"
 *   orientation="vertical"
 *   height={200}
 * />
 */
export function DataBarChart({
  data,
  height,
  categoryKey,
  valueKey,
  // Legacy props
  xDataKey,
  yDataKey,
  // Configuration
  orientation = "horizontal",
  truncateLabel = true,
  maxBarSize = 50,
  // Advanced options
  fixFloatingPoint = true,
  decimalPlaces = 2,
  showDebugInfo = process.env.NODE_ENV === "development",
  onRetry,
  isLoading = false,
  // Styling
  margin = {
    top: 5,
    right: 10,
    left: 0,
    bottom: 5,
  },
}: DataBarChartProps) {
  // Handle loading state
  if (isLoading) {
    return <ChartLoadingState height={height} />;
  }

  // Determine keys with backward compatibility
  const resolvedCategoryKey = categoryKey || xDataKey || "name";
  const resolvedValueKey = valueKey || yDataKey || "Total";
  const isVertical = orientation === "vertical";

  // Log deprecation warnings in development
  if (showDebugInfo && (xDataKey || yDataKey)) {
    console.warn(
      "DataBarChart: xDataKey and yDataKey are deprecated. Use categoryKey and valueKey instead.",
      { xDataKey, yDataKey, categoryKey, valueKey },
    );
  }

  // Validate data
  const validation = validateChartData(
    data,
    [resolvedCategoryKey, resolvedValueKey],
    {
      allowEmpty: false,
      minDataPoints: 1,
      maxDataPoints: 1000,
    },
  );

  // Debug info for development
  console.log("DataBarChart received:", {
    dataLength: data.length,
    firstItem: data[0],
    categoryKey: resolvedCategoryKey,
    valueKey: resolvedValueKey,
    orientation,
  });

  // Handle validation errors - temporarily disabled for debugging
  // if (!validation.isValid) {
  //   return (
  //     <ChartErrorState
  //       errors={validation.errors}
  //       warnings={validation.warnings}
  //       onRetry={onRetry}
  //       showDetails={showDebugInfo}
  //     />
  //   );
  // }

  // Process data
  let processedData = data;

  // Fix floating-point precision issues
  if (fixFloatingPoint) {
    const numericFields = Object.keys(data[0] || {}).filter(
      (key) => typeof (data[0] as any)?.[key] === "number",
    );
    processedData = fixFloatingPointPrecision(
      data,
      numericFields,
      decimalPlaces,
    );
  }

  const isGroupedBarChart = isGroupedBarchart(
    processedData,
    resolvedCategoryKey,
    resolvedValueKey,
  );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={processedData}
        maxBarSize={maxBarSize}
        layout={isVertical ? "vertical" : "horizontal"}
        margin={margin}
      >
        <Tooltip
          content={({ active, payload, label }) => (
            <ChartCustomTooltip
              active={!!active}
              payload={(payload || []) as any}
              label={label || ""}
            />
          )}
          cursor={false}
        />

        {/* Axis configuration - corrected for vertical/horizontal orientation */}
        {isVertical ? (
          // Vertical chart: categories on Y-axis (left), values on X-axis (bottom)
          <>
            <XAxis
              type="number"
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
            <YAxis
              type="category"
              dataKey={resolvedCategoryKey}
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={80}
              tickFormatter={(value) => {
                if (
                  typeof value === "string" &&
                  truncateLabel &&
                  value.length > 12
                ) {
                  return `${value.slice(0, 12)}...`;
                }
                return value;
              }}
            />
          </>
        ) : (
          // Horizontal chart: categories on X-axis (bottom), values on Y-axis (left)
          <>
            <XAxis
              dataKey={resolvedCategoryKey}
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
            <YAxis
              stroke="#888888"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
            />
          </>
        )}

        {isGroupedBarChart && <Legend />}

        {/* Bar rendering - corrected for grouped vs single bars */}
        {isGroupedBarChart ? (
          // Grouped bars: render multiple bars per category
          Object.keys(processedData[0] || {})
            .filter(
              (key) => key !== resolvedCategoryKey && key !== resolvedValueKey,
            )
            .map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={getCategoryColor(key, index)}
                name={key}
                radius={isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              />
            ))
        ) : (
          // Single bars: one bar per category
          <Bar
            dataKey={resolvedValueKey}
            fill="#6366F1"
            radius={isVertical ? [0, 4, 4, 0] : [4, 4, 0, 0]}
          >
            {/* Individual colors for each bar based on category */}
            {processedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getCategoryColor(
                  String(entry[resolvedCategoryKey]),
                  index,
                )}
              />
            ))}
          </Bar>
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}
