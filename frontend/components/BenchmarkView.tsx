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
  ga: "#ee6c65", // Coral Red
  simulated_annealing: "#3d4740", // Forest Slate
  greedy: "#c9b020", // Warm Gold
  random_search: "#838d85", // Muted Gray-Green
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
      <div className="p-8 rounded-3xl border border-border bg-surface-raised flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono text-muted mb-2">
            <Info className="h-3.5 w-3.5 text-forest" />
            <span className="uppercase tracking-wider">Optimization Techniques • Benchmarking</span>
          </div>
          <h2 className="text-xl font-semibold text-text-primary tracking-tight">
            Algorithm Comparative Analysis
          </h2>
          <p className="text-xs text-text-secondary mt-2 leading-relaxed font-sans">
            Directly benchmark the <strong>Constraint-Aware Genetic Algorithm (GA)</strong> against classical
            optimization baselines: <strong>Simulated Annealing (SA)</strong>, <strong>Greedy Heuristic</strong>,
            and <strong>Random Search</strong> under identical college schedule constraints.
          </p>
        </div>

        {/* Parameters & Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 bg-surface p-4 rounded-2xl border border-border">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-mono text-muted uppercase">Iterations</span>
            <input
              type="number"
              min={20}
              max={300}
              value={iterations}
              disabled={isRunning}
              onChange={(e) => setIterations(Number(e.target.value))}
              className="w-24 px-3 py-1.5 bg-surface-raised border border-border text-text-primary text-xs rounded-xl font-mono focus:outline-none"
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
              className="w-24 px-3 py-1.5 bg-surface-raised border border-border text-text-primary text-xs rounded-xl font-mono focus:outline-none"
            />
          </div>

          <button
            onClick={handleRunBenchmark}
            disabled={isRunning}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-forest hover:bg-forest-hover text-white font-medium text-xs transition-all shadow-sm disabled:opacity-50 mt-auto"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>{isRunning ? "Running..." : "Execute Benchmark"}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-5 rounded-2xl border border-coral/30 bg-coral/10 text-coral-dark text-xs font-mono">
          {error}
        </div>
      )}

      {/* Results */}
      {benchmarkData && (
        <>
          {/* Winner Callout (Canary Yellow style from reference) */}
          <div className="p-7 rounded-3xl bg-canary border border-black/5 text-text-primary flex items-start gap-4 shadow-sm">
            <div className="p-3 rounded-2xl bg-white/70 text-text-primary shadow-xs">
              <Trophy className="h-5 w-5 text-coral" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-text-primary/70">
                Course Benchmark Conclusion
              </span>
              <h3 className="text-base font-semibold text-text-primary mt-1">
                {benchmarkData.summary}
              </h3>
              <p className="text-xs text-text-primary/80 mt-1.5 leading-relaxed font-sans">
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
                  className={`p-7 rounded-3xl border bg-surface-raised flex flex-col justify-between transition-all shadow-sm ${
                    isWinner
                      ? "ring-2 ring-forest border-forest"
                      : "border-border"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                        <span className="font-semibold text-text-primary text-xs font-mono">{res.algorithm_name}</span>
                      </div>
                      {isWinner && (
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-canary text-text-primary font-bold border border-black/10">
                          Winner
                        </span>
                      )}
                    </div>

                    <div className="mt-6 space-y-4">
                      <div>
                        <span className="text-[10px] font-mono text-muted uppercase">Final Objective Cost</span>
                        <div className="text-3xl font-light font-mono text-text-primary mt-1">
                          {formatNumber(res.final_cost, 1)}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
                        <div>
                          <span className="text-[10px] font-mono text-muted uppercase">Conflicts</span>
                          <div className="text-sm font-mono text-text-primary flex items-center gap-1.5 mt-0.5">
                            {res.hard_violations === 0 ? (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                <span className="text-emerald-700 font-semibold">0</span>
                              </>
                            ) : (
                              <>
                                <AlertTriangle className="h-3.5 w-3.5 text-coral" />
                                <span className="text-coral font-semibold">{res.hard_violations}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono text-muted uppercase">Runtime</span>
                          <div className="text-sm font-mono text-text-secondary mt-0.5">
                            {formatNumber(res.execution_time_seconds, 2)}s
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border text-[11px] text-muted flex items-center justify-between font-mono">
                    <span>Soft Gaps: {res.soft_violations}</span>
                    <span className={res.converged_zero_hard ? "text-emerald-700 font-semibold" : "text-coral font-semibold"}>
                      {res.converged_zero_hard ? "Feasible" : "Infeasible"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Convergence Overlay Chart */}
          <div className="p-8 rounded-3xl border border-border bg-surface-raised flex flex-col gap-6 shadow-sm">
            <div>
              <span className="text-[11px] font-mono tracking-widest uppercase text-muted">
                Convergence Trajectory
              </span>
              <h3 className="text-base font-semibold text-text-primary tracking-tight mt-0.5">
                Multi-Algorithm Convergence Curve
              </h3>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid stroke="#e4e7df" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="iteration"
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
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "14px" }} />

                  <Line
                    type="monotone"
                    dataKey="ga"
                    name="Genetic Algorithm (GA)"
                    stroke="#ee6c65"
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="simulated_annealing"
                    name="Simulated Annealing (SA)"
                    stroke="#3d4740"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="greedy"
                    name="Greedy Heuristic"
                    stroke="#c9b020"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="random_search"
                    name="Random Search (Baseline)"
                    stroke="#838d85"
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
