"use client"

import { useMemo } from "react"
import { Label, Pie, PieChart } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

type Interview = {
  id: number;
  institution: string;
  score: number;
  interview_date: string;
};

const chartConfig = {
  score: {
    label: "Score",
  },
  remainder: {
    label: "Remainder",
  },
} satisfies ChartConfig

export function Area({ interviews }: { interviews: Interview[] }) {
  const average = useMemo(() => {
    if (interviews.length === 0) return 0;
    const sum = interviews.reduce((acc, i) => acc + i.score, 0);
    return Math.round((sum / interviews.length) * 10) / 10;
  }, [interviews]);

  const chartData = useMemo(() => [
    { name: "Score", value: average, fill: "#e7a33e" },
    { name: "Remainder", value: 10 - average, fill: "#2a2d3a" },
  ], [average]);

  return (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square max-h-[220px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent hideLabel />}
        />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          strokeWidth={3}
          stroke="#14161f"
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="text-3xl font-bold"
                      style={{ fill: "#f3efe4", fontFamily: "var(--font-display)" }}
                    >
                      {average}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 22}
                      style={{ fill: "#98a0b3", fontFamily: "var(--font-mono)", fontSize: "0.75rem" }}
                    >
                      / 10
                    </tspan>
                  </text>
                )
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  )
}