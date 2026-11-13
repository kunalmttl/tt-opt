"use client";

import React from "react";
import { Check, ShieldAlert, Sparkles, TrendingUp } from "lucide-react";
import { formatNumber } from "@/lib/utils";

interface LiveMetricsCardsProps {
  generation: number;
  maxGenerations: number;
  hardViolations: number;
  bestCost: number;
  bestFitness: number;
  softPenalty: number;
  executionTime: number;
  isStreaming: boolean;
  convergedEarly: boolean;
}

export const LiveMetricsCards: React.FC<LiveMetricsCardsProps> = ({
  generation,
  maxGenerations,
  hardViolations,
  bestCost,
  bestFitness,
  softPenalty,
  executionTime,
  isStreaming,
  convergedEarly,
}) => {
  const isFeasible = hardViolations === 0 && generation > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Solution Status & Hard Conflicts */}
      <div className="p-7 rounded-3xl border border-surface-border bg-gradient-to-b from-surface to-[#0c0e11] relative overflow-hidden flex flex-col justify-between group hover:border-neutral-700/60 transition-all">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-lime/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between z-10">
          <span className="text-[11px] font-mono tracking-widest uppercase text-muted">
            Constraint Feasibility
          </span>
          <div className="h-8 w-8 rounded-full bg-surface-raised border border-surface-border flex items-center justify-center">
            {isFeasible ? (
              <Check className="h-4 w-4 text-lime" />
            ) : (
              <ShieldAlert className="h-4 w-4 text-rose-400" />
            )}
          </div>
        </div>

        <div className="mt-8 z-10">
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-light tracking-tight text-white font-mono">
              {hardViolations}
            </span>
            <span className="text-xs text-muted font-mono">conflicts</span>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-mono">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider whitespace-nowrap ${
                isFeasible
                  ? "bg-lime-muted text-lime border border-lime-border"
                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
              }`}
            >
              {isFeasible ? "Feasible" : "Infeasible"}
            </span>
            <span className="text-[11px] text-muted whitespace-nowrap">
              {isFeasible ? "0 clashes" : `${hardViolations} to resolve`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Objective Cost */}
      <div className="p-7 rounded-3xl border border-surface-border bg-gradient-to-b from-surface to-[#0c0e11] relative overflow-hidden flex flex-col justify-between group hover:border-neutral-700/60 transition-all">
        <div className="flex items-center justify-between z-10">
          <span className="text-[11px] font-mono tracking-widest uppercase text-muted">
            Objective Penalty Cost
          </span>
          {/* Decorative mini lime sparkline curve inspired by screenshot */}
          <svg className="w-12 h-6" viewBox="0 0 48 24" fill="none">
            <path
              d="M2 20C12 18 20 8 32 10C38 12 42 4 46 2"
              stroke="#d4f938"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="mt-8 z-10">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-light tracking-tight text-white font-mono">
              {formatNumber(bestCost, 1)}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted font-mono">
            <span>Soft Gap Penalty:</span>
            <span className="text-neutral-200">{formatNumber(softPenalty, 0)}</span>
          </div>
        </div>
      </div>

      {/* 3. Generations Evolved */}
      <div className="p-7 rounded-3xl border border-surface-border bg-gradient-to-b from-surface to-[#0c0e11] relative overflow-hidden flex flex-col justify-between group hover:border-neutral-700/60 transition-all">
        <div className="flex items-center justify-between z-10">
          <span className="text-[11px] font-mono tracking-widest uppercase text-muted">
            Evolution Progress
          </span>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-raised border border-surface-border text-[10px] font-mono text-lime">
            <Sparkles className="h-3 w-3" />
            <span>{isStreaming ? "Live" : "Idle"}</span>
          </div>
        </div>

        <div className="mt-8 z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-light tracking-tight text-white font-mono">
              {generation}
            </span>
            <span className="text-xs text-muted font-mono">/ {maxGenerations} gens</span>
          </div>

          {/* Segmented Neon Progress Bar inspired by screenshot */}
          <div className="mt-4 w-full h-1.5 bg-[#1a1f26] rounded-full overflow-hidden flex">
            <div
              className="bg-lime h-full rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(212,249,56,0.6)]"
              style={{
                width: `${Math.min(100, (generation / Math.max(1, maxGenerations)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. Fitness & Execution Time */}
      <div className="p-7 rounded-3xl border border-surface-border bg-gradient-to-b from-surface to-[#0c0e11] relative overflow-hidden flex flex-col justify-between group hover:border-neutral-700/60 transition-all">
        <div className="flex items-center justify-between z-10">
          <span className="text-[11px] font-mono tracking-widest uppercase text-muted">
            Fitness & Speed
          </span>
          <div className="h-8 w-8 rounded-full bg-surface-raised border border-surface-border flex items-center justify-center text-muted">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-8 z-10">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-light tracking-tight text-white font-mono">
              {bestFitness < 0.0001 && bestFitness > 0
                ? bestFitness.toExponential(2)
                : formatNumber(bestFitness, 4)}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted font-mono">
            <span>Duration:</span>
            <span className="text-white">{formatNumber(executionTime, 2)}s</span>
          </div>
        </div>
      </div>
    </div>
  );
};
