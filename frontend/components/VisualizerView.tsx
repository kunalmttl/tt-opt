"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, GitCommit, Shuffle, Wrench, Trophy, ArrowRight } from "lucide-react";
import { DatasetInput, VisualizerStepResponse, GeneOut } from "@/lib/types";
import { fetchVisualizerStep } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

interface VisualizerViewProps {
  dataset: DatasetInput;
}

export const VisualizerView: React.FC<VisualizerViewProps> = ({ dataset }) => {
  const [activeStage, setActiveStage] = useState<"selection" | "crossover" | "mutation" | "repair">("selection");
  const [data, setData] = useState<VisualizerStepResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tournamentSize, setTournamentSize] = useState<number>(3);
  const [mutationRate, setMutationRate] = useState<number>(0.15);

  const loadStep = async () => {
    try {
      setIsLoading(true);
      const res = await fetchVisualizerStep(dataset, {
        tournament_size: tournamentSize,
        mutation_rate: mutationRate,
      });
      setData(res);
    } catch (e) {
      console.error("Failed to load visualizer step", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStep();
  }, [dataset]);

  const stages = [
    { key: "selection", label: "1. Tournament Selection", icon: Trophy },
    { key: "crossover", label: "2. Two-Point Crossover", icon: GitCommit },
    { key: "mutation", label: "3. Gene Mutation", icon: Shuffle },
    { key: "repair", label: "4. Constraint Repair", icon: Wrench },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto py-4">
      {/* Top Banner */}
      <div className="p-8 rounded-2xl border border-border bg-surface flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-mono text-muted uppercase tracking-wider">
            Viva Presentation Mode
          </span>
          <h2 className="text-xl font-medium text-white tracking-tight mt-1">
            Genetic Operator Step-by-Step Visualizer
          </h2>
          <p className="text-sm text-muted mt-2 max-w-2xl leading-relaxed">
            Walk an evaluator or professor through the exact micro-mechanics of the Genetic Algorithm:
            how parents are selected, how chromosomes exchange genetic material, how mutations introduce diversity,
            and how heuristic repair restores timetable feasibility.
          </p>
        </div>

        <button
          onClick={loadStep}
          disabled={isLoading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-neutral-900 font-medium text-xs hover:bg-neutral-100 transition-colors shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          {isLoading ? "Generating..." : "Generate New Step"}
        </button>
      </div>

      {/* Stage Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stages.map((s) => {
          const Icon = s.icon;
          const isActive = activeStage === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActiveStage(s.key as any)}
              className={`p-4 rounded-xl border text-left flex items-center gap-3 transition-all ${
                isActive
                  ? "bg-surface-raised border-neutral-400 text-white"
                  : "bg-surface border-border text-muted hover:text-neutral-200"
              }`}
            >
              <div
                className={`p-2 rounded-lg border ${
                  isActive
                    ? "bg-neutral-800 border-neutral-600 text-white"
                    : "bg-surface-raised border-border text-muted"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-medium">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stage Content */}
      {data && (
        <div className="p-8 rounded-2xl border border-border bg-surface flex flex-col gap-6">
          {/* Stage 1: Tournament Selection */}
          {activeStage === "selection" && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-base font-medium text-white">
                  Tournament Selection (k = {data.selection.candidates.length})
                </h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  A random sample of {data.selection.candidates.length} chromosomes is drawn from the population.
                  The candidate with the highest fitness (lowest objective cost) wins the tournament and is granted
                  mating privileges.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data.selection.candidates.map((cand, idx) => {
                  const isWinner = idx === data.selection.winner_index;
                  return (
                    <div
                      key={idx}
                      className={`p-5 rounded-xl border flex flex-col justify-between ${
                        isWinner
                          ? "border-emerald-500/50 bg-surface-raised ring-1 ring-emerald-500/30"
                          : "border-border bg-surface"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-mono text-muted">
                            Candidate #{idx + 1}
                          </span>
                          {isWinner && (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Selected Winner
                            </span>
                          )}
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted">Objective Cost:</span>
                            <span className="font-mono text-white font-medium">
                              {formatNumber(cand.cost, 1)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted">Fitness:</span>
                            <span className="font-mono text-neutral-300">
                              {formatNumber(cand.fitness, 4)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted">Hard Violations:</span>
                            <span
                              className={`font-mono font-medium ${
                                cand.hard_violations === 0 ? "text-emerald-400" : "text-rose-400"
                              }`}
                            >
                              {cand.hard_violations}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/60 text-[11px] text-muted font-mono">
                        Gene Count: {cand.genes.length}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stage 2: Two-Point Crossover */}
          {activeStage === "crossover" && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-base font-medium text-white">
                  Two-Point Crossover (Cut Points: Gene {data.crossover.point_1} to {data.crossover.point_2})
                </h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Two parent chromosomes exchange the middle genetic segment bounded by cut points p1 and p2.
                  This preserves building blocks of conflict-free class clusters while exploring novel arrangements.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Parents */}
                <div className="p-5 rounded-xl border border-border bg-surface-raised flex flex-col gap-4">
                  <span className="text-xs font-mono text-muted uppercase">Parents</span>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border border-border bg-surface">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-white">Parent A</span>
                        <span className="text-muted">Cost: {data.crossover.parent_a.cost}</span>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-surface">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-white">Parent B</span>
                        <span className="text-muted">Cost: {data.crossover.parent_b.cost}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Offspring */}
                <div className="p-5 rounded-xl border border-border bg-surface-raised flex flex-col gap-4">
                  <span className="text-xs font-mono text-muted uppercase">Recombined Offspring</span>
                  <div className="space-y-3">
                    <div className="p-3 rounded-lg border border-emerald-500/30 bg-surface">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-emerald-400">Child A</span>
                        <span className="text-muted">Cost: {data.crossover.child_a.cost}</span>
                      </div>
                      <p className="text-[11px] text-muted mt-1">
                        Inherited Parent B genes in [{data.crossover.point_1}:{data.crossover.point_2}], Parent A elsewhere.
                      </p>
                    </div>
                    <div className="p-3 rounded-lg border border-indigo-500/30 bg-surface">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-indigo-400">Child B</span>
                        <span className="text-muted">Cost: {data.crossover.child_b.cost}</span>
                      </div>
                      <p className="text-[11px] text-muted mt-1">
                        Inherited Parent A genes in [{data.crossover.point_1}:{data.crossover.point_2}], Parent B elsewhere.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stage 3: Mutation */}
          {activeStage === "mutation" && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-base font-medium text-white">
                  Gene Mutation ({data.mutation.mutated_gene_indices.length} Genes Mutated)
                </h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  With probability p_m, random genes undergo slot mutation (day/period alteration) or room reassignment.
                  This introduces genetic diversity and prevents population entrapment in premature convergence.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Before Mutation */}
                <div className="p-5 rounded-xl border border-border bg-surface-raised flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-muted uppercase">Before Mutation</span>
                    <span className="font-mono text-white">Cost: {data.mutation.before.cost}</span>
                  </div>
                  <div className="text-xs text-muted">
                    Hard Violations: {data.mutation.before.hard_violations}
                  </div>
                </div>

                {/* After Mutation */}
                <div className="p-5 rounded-xl border border-border bg-surface-raised flex flex-col gap-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-muted uppercase">After Mutation</span>
                    <span className="font-mono text-white">Cost: {data.mutation.after.cost}</span>
                  </div>
                  <div className="text-xs text-muted">
                    Hard Violations: {data.mutation.after.hard_violations}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-surface text-xs font-mono text-muted">
                Mutated Gene Indices: [{data.mutation.mutated_gene_indices.join(", ")}]
              </div>
            </div>
          )}

          {/* Stage 4: Constraint Repair */}
          {activeStage === "repair" && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-base font-medium text-white">
                  Constraint-Aware Repair Heuristic ({data.repair.conflicts_resolved} Conflicts Resolved)
                </h3>
                <p className="text-xs text-muted mt-1 leading-relaxed">
                  Rather than purely penalizing infeasible individuals, the repair operator performs a bounded local
                  repair pass: conflicting genes are systematically moved to vacant slots with zero clashes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-xl border border-border bg-surface flex flex-col justify-between">
                  <span className="text-xs text-muted font-mono uppercase">Pre-Repair Conflicts</span>
                  <div className="text-2xl font-mono font-medium text-rose-400 mt-2">
                    {data.repair.before.hard_violations}
                  </div>
                  <p className="text-[11px] text-muted mt-1">Room/Faculty double bookings</p>
                </div>

                <div className="p-5 rounded-xl border border-border bg-surface flex flex-col justify-between">
                  <span className="text-xs text-muted font-mono uppercase">Post-Repair Conflicts</span>
                  <div className="text-2xl font-mono font-medium text-emerald-400 mt-2">
                    {data.repair.after.hard_violations}
                  </div>
                  <p className="text-[11px] text-muted mt-1">Remaining hard clashes</p>
                </div>

                <div className="p-5 rounded-xl border border-border bg-surface flex flex-col justify-between">
                  <span className="text-xs text-muted font-mono uppercase">Repaired Gene Positions</span>
                  <div className="text-2xl font-mono font-medium text-white mt-2">
                    {data.repair.repaired_gene_indices.length}
                  </div>
                  <p className="text-[11px] text-muted mt-1">Reassigned to feasible slots</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
