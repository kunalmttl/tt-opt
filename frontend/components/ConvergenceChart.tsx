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
      <div className="p-8 rounded-3xl border border-surface-border bg-gradient-to-b from-surface to-[#0c0e11] h-72 flex items-center justify-center text-muted text-xs font-mono">
        Start the optimizer above to watch the Genetic Algorithm converge in real time.
      </div>
    );
  }

  const metricColors = {
    cost: { stroke: "#d4f938", fill: "url(#limeGradient)", name: "Objective Cost" },
    hard: { stroke: "#f43f5e", fill: "url(#roseGradient)", name: "Hard Conflicts" },
    fitness: { stroke: "#10b981", fill: "url(#emeraldGradient)", name: "Fitness Score" },
  };

  const currentMetric = metricColors[metric];

  return (
    <div className="p-8 rounded-3xl border border-surface-border bg-gradient-to-b from-surface to-[#0c0e11] flex flex-col gap-6 shadow-sm">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-muted">
            Convergence Trajectory
          </span>
          <h2 className="text-base font-semibold text-white tracking-tight mt-0.5">
            Objective Function Landscape
          </h2>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-2xl bg-surface-raised border border-surface-border text-[11px] font-mono">
          <button
            onClick={() => setMetric("cost")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              metric === "cost"
                ? "bg-surface text-lime font-medium border border-lime-border shadow-sm"
                : "text-muted hover:text-white"
            }`}
          >
            Cost
          </button>
          <button
            onClick={() => setMetric("hard")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              metric === "hard"
                ? "bg-surface text-rose-400 font-medium border border-rose-500/30 shadow-sm"
                : "text-muted hover:text-white"
            }`}
          >
            Hard Clashes
          </button>
          <button
            onClick={() => setMetric("fitness")}
            className={`px-3.5 py-1.5 rounded-xl transition-all ${
              metric === "fitness"
                ? "bg-surface text-emerald-400 font-medium border border-emerald-500/30 shadow-sm"
                : "text-muted hover:text-white"
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
              <linearGradient id="limeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d4f938" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#d4f938" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#f43f5e" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="emeraldGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid stroke="#1c2129" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="generation"
              stroke="#525d6d"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#1f242c" }}
            />
            <YAxis
              stroke="#525d6d"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: "#1f242c" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#13161a",
                borderColor: "#252b36",
                borderRadius: "14px",
                fontSize: "12px",
                color: "#f3f4f6",
                boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
              }}
              labelStyle={{ color: "#848d9a", fontFamily: "monospace" }}
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
