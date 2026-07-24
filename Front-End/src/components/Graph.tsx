"use client"

import { useMemo } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
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
    color: "#c08a2e",
  },
} satisfies ChartConfig

export function Graph({ interviews }: { interviews: Interview[] }) {
  const chartData = useMemo(() =>
    [...interviews].reverse().map((i) => ({
      institution: i.institution,
      score: i.score,
    })),
    [interviews]
  );

  return (
    <ChartContainer config={chartConfig} className="min-h-[190px] w-full">
      <BarChart accessibilityLayer data={chartData} barSize={40}>
        <CartesianGrid vertical={false} stroke="#e9e4d4" />
        <XAxis
          dataKey="institution"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tick={{ fill: "#756f5e", fontFamily: "var(--font-mono)", fontSize: 11 }}
        />
        <YAxis domain={[0, 10]} hide />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="score" fill="var(--color-score)" radius={2} />
      </BarChart>
    </ChartContainer>
  )
}