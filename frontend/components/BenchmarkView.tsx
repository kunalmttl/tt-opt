"use client";

import React, { useState } from "react";
import { Play, Trophy, CheckCircle2, AlertTriangle, Clock, Target, Info } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { DatasetInput, BenchmarkResponse, AlgorithmBenchmarkResult } from "@/lib/types";
import { runBenchmark } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

interface BenchmarkViewProps {
  dataset: DatasetInput;
}

const ALGO_COLORS: Record<string, string> = {
  ga: "#10b981", // Emerald
  simulated_annealing: "#818cf8", // Indigo
  greedy: "#f59e0b", // Amber
  random_search: "#f43f5e", // Rose
};

export const BenchmarkView: React.FC<BenchmarkViewProps> = ({ dataset }) => {
  const [iterations, setIterations] = useState<number>(100);
  const [populationSize, setPopulationSize] = useState<number>(40);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRunBenchmark = async () => {
    try {
      setIsRunning(true);
      setError(null);
      const res = await runBenchmark(dataset, {
        algorithms: ["ga", "simulated_annealing", "greedy", "random_search"],
        iterations,
        population_size: populationSize,
        random_seed: 42,
      });
      setBenchmarkData(res);
    } catch (err: any) {
      setError(err?.message || "Failed to execute benchmark");
    } finally {
      setIsRunning(false);
    }
  };

  // Prepare chart dataset by joining iteration histories
  const chartData = React.useMemo(() => {
    if (!benchmarkData || benchmarkData.results.length === 0) return [];
    const maxIters = Math.max(...benchmarkData.results.map((r) => r.history.length));
    const points: any[] = [];

    for (let i = 0; i < maxIters; i++) {
      const pt: any = { iteration: i + 1 };
      for (const res of benchmarkData.results) {
        const histPoint = res.history[i] || res.history[res.history.length - 1];
        if (histPoint) {
          pt[res.algorithm_key] = histPoint.best_cost;
          pt[`${res.algorithm_key}_hard`] = histPoint.hard_violations;
        }
      }
      points.push(pt);
    }
    return points;
  }, [benchmarkData]);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto py-4">
      {/* Introduction Card */}
      <div className="p-8 rounded-2xl border border-border bg-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-muted mb-2">
            <Info className="h-3.5 w-3.5" />
            <span>Course Evaluation Benchmark • Optimization Techniques</span>
          </div>
          <h2 className="text-xl font-medium text-white tracking-tight">
            Algorithm Comparative Analysis
          </h2>
          <p className="text-sm text-muted mt-2 leading-relaxed">
            Directly benchmark the <strong>Constraint-Aware Genetic Algorithm (GA)</strong> against classical
            optimization baselines: <strong>Simulated Annealing (SA)</strong>, <strong>Greedy Heuristic</strong>,
            and <strong>Random Search</strong> under identical problem constraints and evaluation weights.
          </p>
        </div>

        {/* Benchmark Parameters & Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface-raised p-4 rounded-xl border border-border">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-muted">Iterations:</span>
            <input
              type="number"
              min={20}
              max={300}
              value={iterations}
              disabled={isRunning}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="w-24 px-2.5 py-1.5 bg-surface border border-border text-white text-xs rounded font-mono focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-muted">GA Pop Size:</span>
            <input
              type="number"
              min={10}
              max={100}
              value={populationSize}
              disabled={isRunning}
              onChange={(e) => setPopulationSize(Number(e.target.value))}
              className="w-24 px-2.5 py-1.5 bg-surface border border-border text-white text-xs rounded font-mono focus:outline-none"
            />
          </div>

          <button
            onClick={handleRunBenchmark}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-neutral-900 font-medium text-xs hover:bg-neutral-100 transition-colors disabled:opacity-50 mt-auto shadow-sm"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            {isRunning ? "Running Benchmark..." : "Execute Benchmark"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* Benchmark Results */}
      {benchmarkData && (
        <>
          {/* Academic Winner Callout */}
          <div className="p-6 rounded-xl border border-border bg-surface flex items-start gap-4">
            <div className="p-3 rounded-xl bg-surface-raised border border-border text-emerald-400">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-muted">
                Benchmark Conclusion
              </span>
              <h3 className="text-base font-medium text-white mt-1">
                {benchmarkData.summary}
              </h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed">
                Notice how population-based recombination (crossover + mutation with constraint repair) enables
                the Genetic Algorithm to explore discrete scheduling topology without getting trapped in local
                minima, unlike single-solution heuristics.
              </p>
            </div>
          </div>

          {/* Cards for each algorithm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {benchmarkData.results.map((res: AlgorithmBenchmarkResult) => {
              const isWinner = res.algorithm_key === benchmarkData.winner_algorithm;
              const color = ALGO_COLORS[res.algorithm_key] || "#a1a1aa";
              return (
                <div
                  key={res.algorithm_key}
                  className={`p-6 rounded-xl border bg-surface flex flex-col justify-between transition-all ${
                    isWinner ? "border-emerald-500/40 ring-1 ring-emerald-500/20" : "border-border"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-medium text-white text-xs">{res.algorithm_name}</span>
                      </div>
                      {isWinner && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Best
                        </span>
                      )}
                    </div>

                    <div className="mt-5 space-y-3">
                      <div>
                        <span className="text-[11px] text-muted">Final Objective Cost</span>
                        <div className="text-xl font-mono font-medium text-white">
                          {formatNumber(res.final_cost, 1)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60">
                        <div>
                          <span className="text-[10px] text-muted">Hard Conflicts</span>
                          <div className="text-sm font-mono text-white flex items-center gap-1.5">
                            {res.hard_violations === 0 ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                                <span className="text-emerald-400">0</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-3 w-3 text-rose-400" />
                                <span className="text-rose-400">{res.hard_violations}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] text-muted">Runtime</span>
                          <div className="text-sm font-mono text-neutral-300">
                            {formatNumber(res.execution_time_seconds, 2)}s
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/60 text-[11px] text-muted flex items-center justify-between font-mono">
                    <span>Soft Gaps: {res.soft_violations}</span>
                    <span>{res.converged_zero_hard ? "Feasible" : "Infeasible"}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Convergence Overlay Chart */}
          <div className="p-8 rounded-2xl border border-border bg-surface flex flex-col gap-6">
            <div>
              <h3 className="text-sm font-medium text-white tracking-tight">
                Objective Cost Convergence Comparison
              </h3>
              <p className="text-xs text-muted mt-0.5">
                Trajectory of best solution cost over iterations across all algorithms
              </p>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="iteration"
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
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#18181b",
                      borderColor: "#27272a",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#f4f4f5",
                    }}
                    labelStyle={{ color: "#a1a1aa", fontFamily: "monospace" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />

                  <Line
                    type="monotone"
                    dataKey="ga"
                    name="Genetic Algorithm (GA)"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="simulated_annealing"
                    name="Simulated Annealing (SA)"
                    stroke="#818cf8"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="greedy"
                    name="Greedy Heuristic"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="random_search"
                    name="Random Search (Baseline)"
                    stroke="#f43f5e"
                    strokeWidth={1.5}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
