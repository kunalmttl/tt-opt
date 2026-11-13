"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
      <div className="p-8 rounded-3xl border border-border bg-surface-raised h-72 flex items-center justify-center text-muted text-xs font-mono shadow-sm">
        Start the optimizer above to watch the Genetic Algorithm converge in real time.
      </div>
    );
  }

  const metricColors = {
    cost: { stroke: "#3d4740", fill: "url(#forestGradient)", name: "Objective Cost" },
    hard: { stroke: "#ee6c65", fill: "url(#coralGradient)", name: "Hard Conflicts" },
    fitness: { stroke: "#2e7d32", fill: "url(#emeraldGradient)", name: "Fitness Score" },
  };

  const currentMetric = metricColors[metric];

  return (
    <div className="p-8 rounded-3xl border border-border bg-surface-raised flex flex-col gap-6 shadow-sm">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-muted">
            Convergence Trajectory
          </span>
          <h2 className="text-base font-semibold text-text-primary tracking-tight mt-0.5">
            Objective Function Landscape
          </h2>
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-surface border border-border text-[11px] font-mono">
          <button
            onClick={() => setMetric("cost")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              metric === "cost"
                ? "bg-forest text-white font-medium shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Cost
          </button>
          <button
            onClick={() => setMetric("hard")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              metric === "hard"
                ? "bg-coral text-white font-medium shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Hard Clashes
          </button>
          <button
            onClick={() => setMetric("fitness")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              metric === "fitness"
                ? "bg-emerald-700 text-white font-medium shadow-sm"
                : "text-text-secondary hover:text-text-primary"
            }`}
          >
            Fitness
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="forestGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3d4740" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#3d4740" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="coralGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ee6c65" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#ee6c65" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2e7d32" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#2e7d32" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#e4e7df" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="generation"
              stroke="#838d85"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#d8dcd3" }}
            />
            <YAxis
              stroke="#838d85"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#d8dcd3" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                borderColor: "#d8dcd3",
                borderRadius: "14px",
                fontSize: "12px",
                color: "#1c221e",
                boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
              }}
              labelStyle={{ color: "#6f7871", fontFamily: "monospace" }}
            />

            {metric === "cost" && (
              <Area
                type="monotone"
                dataKey="best_cost"
                name="Best Cost"
                stroke={currentMetric.stroke}
                fill={currentMetric.fill}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {metric === "hard" && (
              <Area
                type="monotone"
                dataKey="hard_violations"
                name="Hard Conflicts"
                stroke={currentMetric.stroke}
                fill={currentMetric.fill}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            )}

            {metric === "fitness" && (
              <Area
                type="monotone"
                dataKey="best_fitness"
                name="Fitness"
                stroke={currentMetric.stroke}
                fill={currentMetric.fill}
                strokeWidth={2.5}
                dot={false}
                isAnimationActive={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
