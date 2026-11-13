"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { GenerationStat } from "@/lib/types";

interface ConvergenceChartProps {
  history: GenerationStat[];
}

export const ConvergenceChart: React.FC<ConvergenceChartProps> = ({ history }) => {
  const [metric, setMetric] = useState<"cost" | "hard" | "fitness">("cost");

  if (!history || history.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-border bg-surface h-72 flex items-center justify-center text-muted text-xs">
        Run the optimizer to stream live convergence data.
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-border bg-surface flex flex-col gap-4">
      {/* Header and Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-white tracking-tight">
            Convergence Trajectory
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Generation-by-generation evolution progress
          </p>
        </div>

        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-surface-raised border border-border text-[11px] font-mono">
          <button
            onClick={() => setMetric("cost")}
            className={`px-3 py-1 rounded transition-colors ${
              metric === "cost" ? "bg-neutral-800 text-white font-medium" : "text-muted hover:text-neutral-200"
            }`}
          >
            Objective Cost
          </button>
          <button
            onClick={() => setMetric("hard")}
            className={`px-3 py-1 rounded transition-colors ${
              metric === "hard" ? "bg-neutral-800 text-white font-medium" : "text-muted hover:text-neutral-200"
            }`}
          >
            Hard Conflicts
          </button>
          <button
            onClick={() => setMetric("fitness")}
            className={`px-3 py-1 rounded transition-colors ${
              metric === "fitness" ? "bg-neutral-800 text-white font-medium" : "text-muted hover:text-neutral-200"
            }`}
          >
            Fitness
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="generation"
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#27272a" }}
            />
            <YAxis
              stroke="#71717a"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#27272a" }}
              domain={metric === "fitness" ? [0, "auto"] : ["auto", "auto"]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#18181b",
                borderColor: "#27272a",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#f4f4f5",
                boxShadow: "none",
              }}
              labelStyle={{ color: "#a1a1aa", fontFamily: "monospace" }}
            />

            {metric === "cost" && (
              <Line
                type="monotone"
                dataKey="best_cost"
                name="Best Cost"
                stroke="#818cf8"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {metric === "hard" && (
              <Line
                type="monotone"
                dataKey="hard_violations"
                name="Hard Conflicts"
                stroke="#f43f5e"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {metric === "fitness" && (
              <Line
                type="monotone"
                dataKey="best_fitness"
                name="Best Fitness"
                stroke="#10b981"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
