"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, GitCommit, Shuffle, Wrench, Trophy } from "lucide-react";
import { DatasetInput, VisualizerStepResponse } from "@/lib/types";
import { fetchVisualizerStep } from "@/lib/api";
import { formatNumber } from "@/lib/utils";

interface VisualizerViewProps {
  dataset: DatasetInput;
}

export const VisualizerView: React.FC<VisualizerViewProps> = ({ dataset }) => {
  const [activeStage, setActiveStage] = useState<"selection" | "crossover" | "mutation" | "repair">("selection");
  const [data, setData] = useState<VisualizerStepResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tournamentSize] = useState<number>(3);
  const [mutationRate] = useState<number>(0.15);

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
    <div className="flex flex-col gap-8 max-w-7xl mx-auto py-2">
      {/* Top Banner */}
      <div className="p-8 rounded-3xl border border-border bg-surface-raised flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div>
          <span className="text-[10px] font-mono text-coral font-bold uppercase tracking-widest">
            Viva Presentation Explainer
          </span>
          <h2 className="text-xl font-semibold text-text-primary tracking-tight mt-1">
            Genetic Operator Step-by-Step Visualizer
          </h2>
          <p className="text-xs text-text-secondary mt-2 max-w-2xl leading-relaxed font-sans">
            Walk an evaluator or professor through the exact micro-mechanics of the Genetic Algorithm:
            how parents are selected, how chromosomes exchange genetic material, how mutations introduce diversity,
            and how heuristic repair restores timetable feasibility.
          </p>
        </div>

        <button
          onClick={loadStep}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-forest hover:bg-forest-hover text-white font-medium text-xs transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>{isLoading ? "Simulating..." : "Generate New Step"}</span>
        </button>
      </div>

      {/* Stage Selector Pills */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stages.map((s) => {
          const Icon = s.icon;
          const isActive = activeStage === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActiveStage(s.key as any)}
              className={`p-5 rounded-2xl border text-left flex items-center gap-3.5 transition-all shadow-sm ${
                isActive
                  ? "bg-forest text-white border-forest"
                  : "bg-surface-raised border-border text-text-secondary hover:text-text-primary"
              }`}
            >
              <div
                className={`p-2.5 rounded-xl border ${
                  isActive
                    ? "bg-white/10 border-white/20 text-white"
                    : "bg-surface border-border text-text-secondary"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-semibold font-mono">{s.label}</span>
            </button>
          );
        })}
      </div>

      {/* Stage Content */}
      {data && (
        <div className="p-8 rounded-3xl border border-border bg-surface-raised flex flex-col gap-6 shadow-sm">
          {/* Stage 1: Tournament Selection */}
          {activeStage === "selection" && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <span className="text-[10px] font-mono text-coral font-bold uppercase tracking-widest">
                  Selection Mechanics
                </span>
                <h3 className="text-base font-semibold text-text-primary mt-1">
                  Tournament Selection (Pool k = {data.selection.candidates.length})
                </h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed font-sans">
                  A random tournament pool of {data.selection.candidates.length} chromosomes is sampled from the population.
                  The candidate with the highest fitness (lowest objective cost) wins and is selected into the mating pool.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {data.selection.candidates.map((cand, idx) => {
                  const isWinner = idx === data.selection.winner_index;
                  return (
                    <div
                      key={idx}
                      className={`p-6 rounded-2xl border flex flex-col justify-between transition-all ${
                        isWinner
                          ? "border-forest bg-canary/20 ring-2 ring-forest"
                          : "border-border bg-surface"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-mono text-muted">
                            Candidate #{idx + 1}
                          </span>
                          {isWinner && (
                            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-canary text-text-primary font-bold border border-black/10">
                              Selected Winner
                            </span>
                          )}
                        </div>

                        <div className="space-y-3 font-mono">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted">Objective Cost:</span>
                            <span className="text-text-primary font-bold">
                              {formatNumber(cand.cost, 1)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted">Fitness:</span>
                            <span className="text-text-secondary">
                              {formatNumber(cand.fitness, 4)}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-muted">Hard Violations:</span>
                            <span
                              className={`font-semibold ${
                                cand.hard_violations === 0 ? "text-emerald-700" : "text-coral"
                              }`}
                            >
                              {cand.hard_violations}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-border text-[11px] text-muted font-mono">
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
                <span className="text-[10px] font-mono text-coral font-bold uppercase tracking-widest">
                  Genetic Recombination
                </span>
                <h3 className="text-base font-semibold text-text-primary mt-1">
                  Two-Point Crossover (Cut Points: Gene {data.crossover.point_1} to {data.crossover.point_2})
                </h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed font-sans">
                  Parent chromosomes exchange the intermediate genetic segment bounded by cut points p1 and p2.
                  This preserves building blocks of conflict-free class clusters while exploring novel arrangements.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Parents */}
                <div className="p-6 rounded-2xl border border-border bg-surface flex flex-col gap-4">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Parents</span>
                  <div className="space-y-3 font-mono">
                    <div className="p-4 rounded-xl border border-border bg-surface-raised flex justify-between text-xs">
                      <span className="text-text-primary font-semibold">Parent A</span>
                      <span className="text-muted">Cost: {data.crossover.parent_a.cost}</span>
                    </div>
                    <div className="p-4 rounded-xl border border-border bg-surface-raised flex justify-between text-xs">
                      <span className="text-text-primary font-semibold">Parent B</span>
                      <span className="text-muted">Cost: {data.crossover.parent_b.cost}</span>
                    </div>
                  </div>
                </div>

                {/* Offspring */}
                <div className="p-6 rounded-2xl border border-border bg-surface flex flex-col gap-4">
                  <span className="text-[10px] font-mono text-muted uppercase tracking-wider">Offspring</span>
                  <div className="space-y-3 font-mono">
                    <div className="p-4 rounded-xl border border-coral/40 bg-coral/5 flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-coral font-bold">Child A</span>
                        <span className="text-muted">Cost: {data.crossover.child_a.cost}</span>
                      </div>
                      <p className="text-[10px] text-text-secondary font-sans mt-0.5">
                        Inherited Parent B genes in [{data.crossover.point_1}:{data.crossover.point_2}], Parent A elsewhere.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl border border-forest/40 bg-forest/5 flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-forest font-bold">Child B</span>
                        <span className="text-muted">Cost: {data.crossover.child_b.cost}</span>
                      </div>
                      <p className="text-[10px] text-text-secondary font-sans mt-0.5">
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
                <span className="text-[10px] font-mono text-coral font-bold uppercase tracking-widest">
                  Diversity Injection
                </span>
                <h3 className="text-base font-semibold text-text-primary mt-1">
                  Gene Mutation ({data.mutation.mutated_gene_indices.length} Genes Mutated)
                </h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed font-sans">
                  With probability p_m, random genes undergo slot mutation (day/period alteration) or room reassignment.
                  This introduces genetic diversity and prevents population entrapment in premature convergence.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl border border-border bg-surface flex flex-col gap-3 font-mono">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted uppercase text-[10px]">Before Mutation</span>
                    <span className="text-text-primary font-bold">Cost: {data.mutation.before.cost}</span>
                  </div>
                  <div className="text-xs text-muted">
                    Hard Violations: {data.mutation.before.hard_violations}
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-coral/40 bg-coral/5 flex flex-col gap-3 font-mono">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-coral font-bold uppercase text-[10px]">After Mutation</span>
                    <span className="text-text-primary font-bold">Cost: {data.mutation.after.cost}</span>
                  </div>
                  <div className="text-xs text-muted">
                    Hard Violations: {data.mutation.after.hard_violations}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl border border-border bg-surface text-xs font-mono text-text-secondary">
                Mutated Gene Positions: [{data.mutation.mutated_gene_indices.join(", ")}]
              </div>
            </div>
          )}

          {/* Stage 4: Constraint Repair */}
          {activeStage === "repair" && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-border pb-4">
                <span className="text-[10px] font-mono text-coral font-bold uppercase tracking-widest">
                  Heuristic Repair Pass
                </span>
                <h3 className="text-base font-semibold text-text-primary mt-1">
                  Constraint-Aware Repair ({data.repair.conflicts_resolved} Conflicts Resolved)
                </h3>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed font-sans">
                  Rather than purely penalizing infeasible individuals, the repair operator performs a bounded local
                  repair pass: conflicting genes are systematically moved to vacant slots with zero clashes.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-6 rounded-2xl border border-border bg-surface flex flex-col justify-between">
                  <span className="text-[10px] text-muted font-mono uppercase">Pre-Repair Conflicts</span>
                  <div className="text-3xl font-light font-mono text-coral mt-2">
                    {data.repair.before.hard_violations}
                  </div>
                  <p className="text-[10px] text-muted mt-2 font-mono">Room/Faculty double bookings</p>
                </div>

                <div className="p-6 rounded-2xl border border-forest bg-forest/5 flex flex-col justify-between">
                  <span className="text-[10px] text-forest font-mono uppercase font-bold">Post-Repair Conflicts</span>
                  <div className="text-3xl font-light font-mono text-emerald-700 mt-2">
                    {data.repair.after.hard_violations}
                  </div>
                  <p className="text-[10px] text-muted mt-2 font-mono">Clashes resolved to zero</p>
                </div>

                <div className="p-6 rounded-2xl border border-border bg-surface flex flex-col justify-between">
                  <span className="text-[10px] text-muted font-mono uppercase">Repaired Gene Positions</span>
                  <div className="text-3xl font-light font-mono text-text-primary mt-2">
                    {data.repair.repaired_gene_indices.length}
                  </div>
                  <p className="text-[10px] text-muted mt-2 font-mono">Reassigned to vacant slots</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
