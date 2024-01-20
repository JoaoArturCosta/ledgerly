"use client";

// import { getColorWithOpacity } from "@/lib/utils/colors";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCustomTooltip from "./ChartCustomTooltip";
import { type IBarChartData } from "@/types";

interface DataBarChartProps {
  data: IBarChartData[];
  height: number;
  truncateLabel?: boolean;
  // maxBars?: number;
}

/**
 * IncomesBarChart component renders a bar chart visualization
 * of income data passed in via props.
 */
export function DataBarChart({
  data,
  height,
  truncateLabel = true,
}: DataBarChartProps) {
  // const maxBarSize = 50;
  // const minBarSize = 20;
  // const maxBarGap = 20;
  // const minBarGap = 10;

  // const numBars = Object.keys(data[0] ?? {}).length - 1;

  // const barSizeRange = maxBarSize - minBarSize;

  // // const barSize = Math.max(
  // //   minBarSize,
  // //   maxBarSize - (barSizeRange * (numBars - 1)) / (maxBars - 1),
  // // );

  // const barGapRange = maxBarGap - minBarGap;

  // // const barGap = Math.max(
  // //   minBarGap,
  // //   maxBarGap - (barGapRange * (numBars - 1)) / (maxBars - 1),
  // // );

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} maxBarSize={50}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: string) =>
            truncateLabel ? `${value.toString().slice(0, 5)}` : value
          }
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Tooltip
          content={<ChartCustomTooltip active payload={[]} label="" />}
          cursor={false}
        />
        {/* <Legend
          formatter={(value) => (
            <span className="flex overflow-hidden">
              <span className=" max-w-24 truncate text-ellipsis  text-xs ">
                {value}
              </span>
            </span>
          )}
        /> */}
        {/* {data.map((entry) =>
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
        )} */}
        <Bar dataKey="Total" fill="#7B39ED" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
