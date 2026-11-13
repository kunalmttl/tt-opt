"use client";

import React, { useState } from "react";
import { Play, Trophy, CheckCircle2, AlertTriangle, Info } from "lucide-react";
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
  ga: "#d4f938", // Lime
  simulated_annealing: "#60a5fa", // Soft Blue
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
        }
      }
      points.push(pt);
    }
    return points;
  }, [benchmarkData]);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto py-2">
      {/* Intro Banner */}
      <div className="p-8 rounded-3xl border border-surface-border bg-gradient-to-b from-surface to-[#0c0e11] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-muted mb-2">
            <Info className="h-3.5 w-3.5 text-lime" />
            <span className="uppercase tracking-wider">Optimization Techniques • Benchmarking</span>
          </div>
          <h2 className="text-xl font-medium text-white tracking-tight">
            Algorithm Comparative Analysis
          </h2>
          <p className="text-xs text-muted mt-2 leading-relaxed font-sans">
            Directly benchmark the <strong>Constraint-Aware Genetic Algorithm (GA)</strong> against classical
            optimization baselines: <strong>Simulated Annealing (SA)</strong>, <strong>Greedy Heuristic</strong>,
            and <strong>Random Search</strong> under identical problem constraints and evaluation weights.
          </p>
        </div>

        {/* Parameters & Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface-raised p-4 rounded-2xl border border-surface-border">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-muted uppercase">Iterations</span>
            <input
              type="number"
              min={20}
              max={300}
              value={iterations}
              disabled={isRunning}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="w-24 px-3 py-1.5 bg-surface border border-surface-border text-white text-xs rounded-xl font-mono focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-muted uppercase">GA Pop Size</span>
            <input
              type="number"
              min={10}
              max={100}
              value={populationSize}
              disabled={isRunning}
              onChange={(e) => setPopulationSize(Number(e.target.value))}
              className="w-24 px-3 py-1.5 bg-surface border border-surface-border text-white text-xs rounded-xl font-mono focus:outline-none"
            />
          </div>

          <button
            onClick={handleRunBenchmark}
            disabled={isRunning}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-lime hover:bg-lime-hover text-black font-semibold text-xs transition-all shadow-[0_0_20px_rgba(212,249,56,0.2)] disabled:opacity-50 mt-auto"
          >
            <Play className="h-3.5 w-3.5 fill-black" />
            <span>{isRunning ? "Running..." : "Execute Benchmark"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-5 rounded-2xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      {/* Results */}
      {benchmarkData && (
        <>
          {/* Winner Callout */}
          <div className="p-7 rounded-3xl border border-lime-border bg-gradient-to-r from-[#172013] to-surface flex items-start gap-4 shadow-sm">
            <div className="p-3 rounded-2xl bg-surface border border-lime-border text-lime">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-lime">
                Course Benchmark Conclusion
              </span>
              <h3 className="text-base font-medium text-white mt-1">
                {benchmarkData.summary}
              </h3>
              <p className="text-xs text-muted mt-1.5 leading-relaxed font-sans">
                Notice how population-based recombination (crossover + mutation with constraint repair) enables
                the Genetic Algorithm to explore discrete scheduling topology without getting trapped in local
                minima, unlike single-solution heuristics.
              </p>
            </div>
          </div>

          {/* Cards for each algorithm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {benchmarkData.results.map((res: AlgorithmBenchmarkResult) => {
              const isWinner = res.algorithm_key === benchmarkData.winner_algorithm;
              const color = ALGO_COLORS[res.algorithm_key] || "#a1a1aa";
              return (
                <div
                  key={res.algorithm_key}
                  className={`p-7 rounded-3xl border bg-gradient-to-b from-surface to-[#0c0e11] flex flex-col justify-between transition-all ${
                    isWinner
                      ? "border-lime-border ring-1 ring-lime/20 shadow-[0_0_20px_rgba(212,249,56,0.1)]"
                      : "border-surface-border"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-medium text-white text-xs font-mono">{res.algorithm_name}</span>
                      </div>
                      {isWinner && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-lime-muted text-lime border border-lime-border">
                          Winner
                        </span>
                      )}
                    </div>

                    <div className="mt-6 space-y-4">
                      <div>
                        <span className="text-[10px] font-mono text-muted uppercase">Final Objective Cost</span>
                        <div className="text-3xl font-light font-mono text-white mt-1">
                          {formatNumber(res.final_cost, 1)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-surface-border">
                        <div>
                          <span className="text-[10px] font-mono text-muted uppercase">Conflicts</span>
                          <div className="text-sm font-mono text-white flex items-center gap-1.5 mt-0.5">
                            {res.hard_violations === 0 ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-lime" />
                                <span className="text-lime">0</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
                                <span className="text-rose-400">{res.hard_violations}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-muted uppercase">Runtime</span>
                          <div className="text-sm font-mono text-neutral-300 mt-0.5">
                            {formatNumber(res.execution_time_seconds, 2)}s
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-surface-border text-[11px] text-muted flex items-center justify-between font-mono">
                    <span>Soft Gaps: {res.soft_violations}</span>
                    <span className={res.converged_zero_hard ? "text-lime" : "text-rose-400"}>
                      {res.converged_zero_hard ? "Feasible" : "Infeasible"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Convergence Overlay Chart */}
          <div className="p-8 rounded-3xl border border-surface-border bg-gradient-to-b from-surface to-[#0c0e11] flex flex-col gap-6 shadow-sm">
            <div>
              <span className="text-[11px] font-mono tracking-widest uppercase text-muted">
                Convergence Trajectory
              </span>
              <h3 className="text-base font-semibold text-white tracking-tight mt-0.5">
                Multi-Algorithm Convergence Curve
              </h3>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke="#1c2129" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="iteration"
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
                    }}
                    labelStyle={{ color: "#848d9a", fontFamily: "monospace" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "14px" }} />

                  <Line
                    type="monotone"
                    dataKey="ga"
                    name="Genetic Algorithm (GA)"
                    stroke="#d4f938"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="simulated_annealing"
                    name="Simulated Annealing (SA)"
                    stroke="#60a5fa"
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
