"use client";

import { getColorWithOpacity } from "@/lib/utils/colors";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import ChartCustomTooltip from "./ChartCustomTooltip";

interface DataLineChartProps {
  data: {
    name: string;
    [key: string]: number | string;
  }[];
  height: number;
}

export default function DataLineChart({ data, height }: DataLineChartProps) {
  const numLines = Object.keys(data[0] ?? {}).length - 1;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: string) => value.slice(0, 3)}
          minTickGap={1}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$ ${value}`}
        />
        <Tooltip
          content={<ChartCustomTooltip active payload={[]} label="" />}
        />
        {Object.entries(data[0] ?? {}).map(
          (entry, index) =>
            entry[0] !== "name" &&
            entry[1] !== 0 && (
              <Line
                key={`${entry[0]}-${index}`}
                dataKey={entry[0]}
                type={"monotone"}
                stroke={getColorWithOpacity(index, "#7B39ED", numLines)}
                strokeWidth={2}
              />
            ),
        )}
      </LineChart>
    </ResponsiveContainer>
  );
}
