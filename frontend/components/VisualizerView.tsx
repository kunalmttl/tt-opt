"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  RefreshCw,
  GitCommit,
  Shuffle,
  Wrench,
  Trophy,
  Database,
  CalendarCheck,
  CheckCircle2,
  Layers,
  ArrowRight,
} from "lucide-react";
import { DatasetInput, VisualizerStepResponse, GeneOut } from "@/lib/types";
import { fetchVisualizerStep } from "@/lib/api";
import { formatNumber } from "@/lib/utils";
import { TimetableGrid } from "@/components/TimetableGrid";

interface VisualizerViewProps {
  dataset: DatasetInput;
}

type VisualizerStage =
  | "encoding"
  | "selection"
  | "crossover"
  | "mutation"
  | "repair"
  | "final_schedule";

export const VisualizerView: React.FC<VisualizerViewProps> = ({ dataset }) => {
  const [activeStage, setActiveStage] = useState<VisualizerStage>("encoding");
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

  const stages: { key: VisualizerStage; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: "encoding", label: "1. Data to Encoding", icon: Database },
    { key: "selection", label: "2. Tournament Selection", icon: Trophy },
    { key: "crossover", label: "3. Two-Point Crossover", icon: GitCommit },
    { key: "mutation", label: "4. Gene Mutation", icon: Shuffle },
    { key: "repair", label: "5. Constraint Repair", icon: Wrench },
    { key: "final_schedule", label: "6. Final Timetable", icon: CalendarCheck },
  ];

  // Total session requirements calculated from input data
  const totalRequiredSessions = useMemo(() => {
    return dataset.subjects.reduce((sum, s) => sum + s.sessions_per_week, 0);
  }, [dataset]);

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto py-2">
      {/* Top Banner */}
      <div className="p-8 rounded-3xl border border-border bg-surface-raised flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div>
          <span className="text-[10px] font-mono text-coral font-bold uppercase tracking-widest">
            End-to-End Pipeline
          </span>
          <h2 className="text-xl font-semibold text-text-primary tracking-tight mt-1">
            Genetic Algorithm Operator Visualizer
          </h2>
          <p className="text-xs text-text-secondary mt-2 max-w-2xl leading-relaxed font-sans">
            Follow the complete mechanical lifecycle of the Genetic Algorithm: starting from raw curriculum data,
            encoding into chromosome genes, applying selection, crossover, and mutation, executing constraint repair,
            and decoding into the final conflict-free college timetable.
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

      {/* 6 Stage Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {stages.map((s) => {
          const Icon = s.icon;
          const isActive = activeStage === s.key;
          return (
            <button
              key={s.key}
              onClick={() => setActiveStage(s.key)}
              className={`p-4 rounded-2xl border text-left flex flex-col justify-between gap-2.5 transition-all shadow-sm ${
                isActive
                  ? "bg-forest text-white border-forest ring-1 ring-forest"
                  : "bg-surface-raised border-border text-text-secondary hover:text-text-primary hover:border-text-secondary/40"
              }`}
            >
              <div
                className={`p-2 w-fit rounded-xl border ${
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
      <div className="p-8 rounded-3xl border border-border bg-surface-raised flex flex-col gap-6 shadow-sm">
        {/* Stage 1: Data to Chromosome Encoding */}
        {activeStage === "encoding" && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-border pb-4">
              <span className="text-[10px] font-mono text-coral font-bold uppercase tracking-widest">
                Step 1: Problem Modeling & Chromosome Representation
              </span>
              <h3 className="text-base font-semibold text-text-primary mt-1">
                From Raw Curriculum Data to Gene Array
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed font-sans">
                Each weekly class session requirement is instantiated as a discrete <strong>Gene</strong>:{" "}
                <code className="bg-surface px-1.5 py-0.5 rounded font-mono text-text-primary text-[11px]">
                  g = (Subject, Faculty, Batch, Room, Day, Period)
                </code>
                . A candidate timetable (Chromosome) is an ordered vector of all {totalRequiredSessions} lecture genes.
              </p>
            </div>

            {/* Input Data Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-5 rounded-2xl border border-border bg-surface flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted uppercase">Curriculum Subjects</span>
                <span className="text-2xl font-light font-mono text-text-primary">
                  {dataset.subjects.length}
                </span>
                <span className="text-[10px] text-muted font-mono">{totalRequiredSessions} weekly periods</span>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-surface flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted uppercase">Teaching Faculty</span>
                <span className="text-2xl font-light font-mono text-text-primary">
                  {dataset.faculty.length}
                </span>
                <span className="text-[10px] text-muted font-mono">Unique professors</span>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-surface flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted uppercase">Student Batches</span>
                <span className="text-2xl font-light font-mono text-text-primary">
                  {dataset.batches.length}
                </span>
                <span className="text-[10px] text-muted font-mono">Parallel cohorts</span>
              </div>

              <div className="p-5 rounded-2xl border border-border bg-surface flex flex-col gap-1">
                <span className="text-[10px] font-mono text-muted uppercase">Available Rooms</span>
                <span className="text-2xl font-light font-mono text-text-primary">
                  {dataset.rooms.length}
                </span>
                <span className="text-[10px] text-muted font-mono">Lecture & Lab venues</span>
              </div>
            </div>

            {/* Gene Structure Diagram */}
            <div className="p-6 rounded-2xl border border-border bg-surface flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-semibold text-text-primary uppercase tracking-wide">
                  Gene Tuple Schema: g = (S, F, B, R, D, P)
                </span>
                <span className="text-[11px] font-mono text-muted">
                  8 AM – 5 PM • Fixed Lunch: Period 1–2 PM
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-6 gap-3 font-mono text-xs">
                <div className="p-3.5 rounded-xl border border-border bg-surface-raised flex flex-col gap-1">
                  <span className="text-[10px] text-muted uppercase">Fixed Subject (S)</span>
                  <span className="text-text-primary font-bold">Subject ID</span>
                  <span className="text-[9px] text-muted font-sans">e.g. Data Structures</span>
                </div>
                <div className="p-3.5 rounded-xl border border-border bg-surface-raised flex flex-col gap-1">
                  <span className="text-[10px] text-muted uppercase">Fixed Faculty (F)</span>
                  <span className="text-text-primary font-bold">Faculty ID</span>
                  <span className="text-[9px] text-muted font-sans">e.g. Dr. A. Sharma</span>
                </div>
                <div className="p-3.5 rounded-xl border border-border bg-surface-raised flex flex-col gap-1">
                  <span className="text-[10px] text-muted uppercase">Fixed Batch (B)</span>
                  <span className="text-text-primary font-bold">Batch ID</span>
                  <span className="text-[9px] text-muted font-sans">e.g. AIML-A</span>
                </div>
                <div className="p-3.5 rounded-xl border border-coral/30 bg-coral/5 flex flex-col gap-1">
                  <span className="text-[10px] text-coral uppercase font-bold">Variable Room (R)</span>
                  <span className="text-text-primary font-bold">Room ID</span>
                  <span className="text-[9px] text-muted font-sans">Optimized by GA</span>
                </div>
                <div className="p-3.5 rounded-xl border border-forest/30 bg-forest/5 flex flex-col gap-1">
                  <span className="text-[10px] text-forest uppercase font-bold">Variable Day (D)</span>
                  <span className="text-text-primary font-bold">Mon – Fri</span>
                  <span className="text-[9px] text-muted font-sans">Optimized by GA</span>
                </div>
                <div className="p-3.5 rounded-xl border border-forest/30 bg-forest/5 flex flex-col gap-1">
                  <span className="text-[10px] text-forest uppercase font-bold">Variable Period (P)</span>
                  <span className="text-text-primary font-bold">Period 1 – 8</span>
                  <span className="text-[9px] text-muted font-sans">Optimized by GA</span>
                </div>
              </div>
            </div>

            {/* Initial Chromosome Sample */}
            {data && data.selection.candidates.length > 0 && (
              <div className="p-6 rounded-2xl border border-border bg-surface flex flex-col gap-3">
                <span className="text-xs font-mono font-semibold text-text-primary">
                  Initial Randomly Initialized Chromosome Sample (First 6 Genes)
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {data.selection.candidates[0].genes.slice(0, 6).map((gene, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-border bg-surface-raised text-xs font-mono flex flex-col gap-1"
                    >
                      <div className="flex justify-between items-center text-text-primary font-semibold">
                        <span>{gene.subject_name}</span>
                        <span className="text-[10px] text-muted font-normal">Gene #{idx + 1}</span>
                      </div>
                      <div className="text-[11px] text-text-secondary">
                        {gene.faculty_name} • {gene.batch_id}
                      </div>
                      <div className="flex justify-between text-[10px] text-muted pt-1 border-t border-border">
                        <span>Venue: {gene.room_number}</span>
                        <span>
                          {gene.day} (Period {gene.period})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stage 2: Tournament Selection */}
        {activeStage === "selection" && data && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-border pb-4">
              <span className="text-[10px] font-mono text-coral font-bold uppercase tracking-widest">
                Step 2: Selection Mechanics
              </span>
              <h3 className="text-base font-semibold text-text-primary mt-1">
                Tournament Selection (Pool k = {data.selection.candidates.length})
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed font-sans">
                A random tournament pool of {data.selection.candidates.length} chromosomes is sampled from the population.
                The candidate with the highest fitness (lowest objective cost) wins the tournament and is selected into the mating pool.
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
                        <span className="text-xs font-mono text-muted">Candidate #{idx + 1}</span>
                        {isWinner && (
                          <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-canary text-text-primary font-bold border border-black/10">
                            Tournament Winner
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

        {/* Stage 3: Two-Point Crossover */}
        {activeStage === "crossover" && data && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-border pb-4">
              <span className="text-[10px] font-mono text-coral font-bold uppercase tracking-widest">
                Step 3: Genetic Recombination
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

        {/* Stage 4: Mutation */}
        {activeStage === "mutation" && data && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-border pb-4">
              <span className="text-[10px] font-mono text-coral font-bold uppercase tracking-widest">
                Step 4: Diversity Injection
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

        {/* Stage 5: Constraint Repair */}
        {activeStage === "repair" && data && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-border pb-4">
              <span className="text-[10px] font-mono text-coral font-bold uppercase tracking-widest">
                Step 5: Heuristic Repair Pass
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

        {/* Stage 6: Final Decoded Timetable Matrix */}
        {activeStage === "final_schedule" && data && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-border pb-4">
              <span className="text-[10px] font-mono text-coral font-bold uppercase tracking-widest">
                Step 6: Feasible Timetable Schedule
              </span>
              <h3 className="text-base font-semibold text-text-primary mt-1">
                Decoded College Timetable (Zero Hard Conflicts)
              </h3>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed font-sans">
                The chromosome has been repaired and verified against all hard constraints. The gene array is
                mapped into the weekly 8:00 AM – 5:00 PM college matrix with a dedicated 1:00 – 2:00 PM lunch break.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs font-mono text-text-secondary">
              <span className="flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Hard Violations: {data.repair.after.hard_violations}
              </span>
              <span className="bg-surface px-3 py-1 rounded-xl border border-border text-muted">
                Total Classes: {data.repair.after.genes.length}
              </span>
              <span className="bg-surface px-3 py-1 rounded-xl border border-border text-muted">
                Final Cost: {formatNumber(data.repair.after.cost, 1)}
              </span>
            </div>

            {/* Embedded Timetable Grid */}
            <TimetableGrid timetable={data.repair.after.genes} dataset={dataset} />
          </div>
        )}
      </div>
    </div>
  );
};
