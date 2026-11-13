"use client";

import React from "react";
import { Check, ShieldAlert, Sparkles, TrendingUp, Clock } from "lucide-react";
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
      {/* 1. Hard Conflicts & Feasibility (Coral Pink style from reference) */}
      <div
        className={`p-7 rounded-3xl transition-all shadow-sm flex flex-col justify-between ${
          !isFeasible && generation > 0
            ? "bg-coral text-white"
            : isFeasible
            ? "bg-surface-raised border border-border text-text-primary"
            : "bg-coral/90 text-white"
        }`}
      >
        <div className="flex items-center justify-between">
          <span
            className={`text-[11px] font-mono tracking-widest uppercase ${
              isFeasible ? "text-muted" : "text-white/80"
            }`}
          >
            Constraint Feasibility
          </span>
          <div
            className={`h-8 w-8 rounded-full flex items-center justify-center ${
              isFeasible ? "bg-emerald-50 text-emerald-600" : "bg-white/20 text-white"
            }`}
          >
            {isFeasible ? (
              <Check className="h-4 w-4" />
            ) : (
              <ShieldAlert className="h-4 w-4" />
            )}
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-4xl font-light tracking-tight font-mono ${
                isFeasible ? "text-text-primary" : "text-white"
              }`}
            >
              {hardViolations}
            </span>
            <span
              className={`text-xs font-mono ${
                isFeasible ? "text-muted" : "text-white/80"
              }`}
            >
              conflicts
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs font-mono">
            <span
              className={`px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-semibold whitespace-nowrap ${
                isFeasible
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-white/25 text-white"
              }`}
            >
              {isFeasible ? "Feasible Optimum" : "Unresolved Clashes"}
            </span>
            <span
              className={`text-[11px] whitespace-nowrap ${
                isFeasible ? "text-muted" : "text-white/80"
              }`}
            >
              {isFeasible ? "0 double-bookings" : `${hardViolations} to resolve`}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Objective Penalty Cost (Canary Yellow style from reference) */}
      <div className="p-7 rounded-3xl bg-canary text-text-primary shadow-sm flex flex-col justify-between border border-black/[0.04]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-widest uppercase text-text-primary/70">
            Objective Penalty Cost
          </span>
          {/* Decorative mini bar graph inspired by screenshot */}
          <div className="flex items-end gap-1 h-5">
            <span className="w-1 h-2 bg-text-primary/40 rounded-full" />
            <span className="w-1 h-3.5 bg-text-primary/60 rounded-full" />
            <span className="w-1 h-5 bg-text-primary rounded-full" />
            <span className="w-1 h-3 bg-text-primary/60 rounded-full" />
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-light tracking-tight text-text-primary font-mono font-medium">
              {formatNumber(bestCost, 1)}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-text-primary/80 font-mono">
            <span>Soft Gap Cost:</span>
            <span className="font-semibold text-text-primary">{formatNumber(softPenalty, 0)}</span>
          </div>
        </div>
      </div>

      {/* 3. Generations Evolved (Deep Slate Forest style from reference) */}
      <div className="p-7 rounded-3xl bg-forest text-white shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-widest uppercase text-white/70">
            Evolution Progress
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-mono text-white">
            <Sparkles className="h-3 w-3" />
            <span>{isStreaming ? "Running" : "Idle"}</span>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-light tracking-tight text-white font-mono">
              {generation}
            </span>
            <span className="text-xs text-white/70 font-mono">/ {maxGenerations} gens</span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="mt-4 w-full h-2 bg-black/20 rounded-full overflow-hidden flex">
            <div
              className="bg-canary h-full rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, (generation / Math.max(1, maxGenerations)) * 100)}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* 4. Fitness & Execution Time (Crisp Light Surface Card) */}
      <div className="p-7 rounded-3xl bg-surface-raised border border-border text-text-primary shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono tracking-widest uppercase text-muted">
            Fitness & Speed
          </span>
          <div className="h-8 w-8 rounded-full bg-surface border border-border flex items-center justify-center text-text-secondary">
            <TrendingUp className="h-4 w-4" />
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-light tracking-tight text-text-primary font-mono">
              {bestFitness < 0.0001 && bestFitness > 0
                ? bestFitness.toExponential(2)
                : formatNumber(bestFitness, 4)}
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted font-mono">
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Runtime:
            </span>
            <span className="font-semibold text-text-primary font-mono">
              {formatNumber(executionTime, 2)}s
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
