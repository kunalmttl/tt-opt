"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Clock, Activity, Target } from "lucide-react";
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
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {/* Generation Progress */}
      <div className="p-5 rounded-xl border border-border bg-surface flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted text-xs">
          <span>Generation</span>
          <Activity className="h-3.5 w-3.5 text-muted" />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-mono font-medium text-white">
            {generation}
            <span className="text-xs text-muted font-normal"> / {maxGenerations}</span>
          </div>
          <p className="text-[11px] text-muted mt-1">
            {convergedEarly ? "Early convergence" : isStreaming ? "Evolving population..." : "Ready"}
          </p>
        </div>
      </div>

      {/* Hard Violations (Feasibility) */}
      <div className="p-5 rounded-xl border border-border bg-surface flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted text-xs">
          <span>Hard Conflicts</span>
          {isFeasible ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
          )}
        </div>
        <div className="mt-3">
          <div className="text-2xl font-mono font-medium text-white flex items-center gap-2">
            {hardViolations}
            {isFeasible && (
              <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Feasible
              </span>
            )}
          </div>
          <p className="text-[11px] text-muted mt-1">
            {isFeasible ? "No room/faculty clash" : "Clashes to resolve"}
          </p>
        </div>
      </div>

      {/* Objective Cost */}
      <div className="p-5 rounded-xl border border-border bg-surface flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted text-xs">
          <span>Objective Cost</span>
          <Target className="h-3.5 w-3.5 text-muted" />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-mono font-medium text-white">
            {formatNumber(bestCost, 1)}
          </div>
          <p className="text-[11px] text-muted mt-1">Weighted penalty sum</p>
        </div>
      </div>

      {/* Fitness */}
      <div className="p-5 rounded-xl border border-border bg-surface flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted text-xs">
          <span>Fitness Score</span>
          <span className="text-[10px] font-mono text-muted">1/(1+Cost)</span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-mono font-medium text-white">
            {bestFitness < 0.0001 && bestFitness > 0
              ? bestFitness.toExponential(2)
              : formatNumber(bestFitness, 4)}
          </div>
          <p className="text-[11px] text-muted mt-1">Higher is better</p>
        </div>
      </div>

      {/* Soft Penalty */}
      <div className="p-5 rounded-xl border border-border bg-surface flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted text-xs">
          <span>Soft Cost</span>
          <span className="text-[10px] text-muted">Gaps & Load</span>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-mono font-medium text-white">
            {formatNumber(softPenalty, 0)}
          </div>
          <p className="text-[11px] text-muted mt-1">Schedule quality penalty</p>
        </div>
      </div>

      {/* Runtime */}
      <div className="p-5 rounded-xl border border-border bg-surface flex flex-col justify-between">
        <div className="flex items-center justify-between text-muted text-xs">
          <span>Elapsed Time</span>
          <Clock className="h-3.5 w-3.5 text-muted" />
        </div>
        <div className="mt-3">
          <div className="text-2xl font-mono font-medium text-white">
            {formatNumber(executionTime, 2)}
            <span className="text-xs text-muted font-normal">s</span>
          </div>
          <p className="text-[11px] text-muted mt-1">Execution duration</p>
        </div>
      </div>
    </div>
  );
};
