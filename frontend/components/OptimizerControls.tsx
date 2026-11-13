"use client";

import React, { useState } from "react";
import { Play, Pause, RotateCcw, Sliders, ChevronDown, ChevronUp } from "lucide-react";
import { GAConfig } from "@/lib/types";
import { cn } from "@/lib/utils";

interface OptimizerControlsProps {
  config: GAConfig;
  setConfig: React.Dispatch<React.SetStateAction<GAConfig>>;
  isStreaming: boolean;
  isPaused: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  speed: number;
  setSpeed: (speed: number) => void;
}

export const OptimizerControls: React.FC<OptimizerControlsProps> = ({
  config,
  setConfig,
  isStreaming,
  isPaused,
  onStart,
  onPause,
  onResume,
  onReset,
  speed,
  setSpeed,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="p-8 rounded-3xl border border-surface-border bg-gradient-to-b from-surface to-[#0c0e11] flex flex-col gap-8 shadow-sm">
      {/* Top Playback Actions */}
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-3.5">
          {!isStreaming ? (
            <button
              onClick={onStart}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-lime hover:bg-lime-hover text-black font-semibold text-xs transition-all shadow-[0_0_20px_rgba(212,249,56,0.25)] hover:shadow-[0_0_25px_rgba(212,249,56,0.4)]"
            >
              <Play className="h-3.5 w-3.5 fill-black" />
              <span>Start GA Evolution</span>
            </button>
          ) : isPaused ? (
            <button
              onClick={onResume}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-lime hover:bg-lime-hover text-black font-semibold text-xs transition-all shadow-[0_0_20px_rgba(212,249,56,0.25)]"
            >
              <Play className="h-3.5 w-3.5 fill-black" />
              <span>Resume Evolution</span>
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-surface-raised border border-surface-border text-white font-medium text-xs hover:bg-[#1f242c] transition-all"
            >
              <Pause className="h-3.5 w-3.5 fill-white" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={onReset}
            disabled={!isStreaming && !isPaused}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-surface-border text-muted hover:text-white hover:bg-surface-raised text-xs font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Speed Multiplier Pills */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted font-mono uppercase tracking-wider">Speed:</span>
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-surface-raised border border-surface-border font-mono text-[11px]">
            {[
              { label: "1x", val: 1 },
              { label: "2x", val: 2 },
              { label: "5x", val: 5 },
              { label: "Max", val: 0 },
            ].map((s) => (
              <button
                key={s.label}
                onClick={() => setSpeed(s.val)}
                className={cn(
                  "px-3 py-1.5 rounded-xl transition-all",
                  speed === s.val
                    ? "bg-surface text-lime font-medium border border-lime-border shadow-sm"
                    : "text-muted hover:text-neutral-200"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Optimization Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-surface-border">
        {/* Population Size */}
        <div className="p-4 rounded-2xl bg-surface-raised/40 border border-surface-border flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted font-mono uppercase tracking-wider text-[10px]">
              Population Size
            </span>
            <span className="font-mono text-white font-medium text-xs px-2 py-0.5 rounded bg-surface border border-surface-border">
              {config.population_size}
            </span>
          </div>
          <input
            type="range"
            min={20}
            max={200}
            step={10}
            disabled={isStreaming}
            value={config.population_size}
            onChange={(e) =>
              setConfig({ ...config, population_size: Number(e.target.value) })
            }
            className="w-full h-1.5 cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Max Generations */}
        <div className="p-4 rounded-2xl bg-surface-raised/40 border border-surface-border flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted font-mono uppercase tracking-wider text-[10px]">
              Generations
            </span>
            <span className="font-mono text-white font-medium text-xs px-2 py-0.5 rounded bg-surface border border-surface-border">
              {config.generations}
            </span>
          </div>
          <input
            type="range"
            min={50}
            max={1000}
            step={50}
            disabled={isStreaming}
            value={config.generations}
            onChange={(e) =>
              setConfig({ ...config, generations: Number(e.target.value) })
            }
            className="w-full h-1.5 cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Mutation Rate */}
        <div className="p-4 rounded-2xl bg-surface-raised/40 border border-surface-border flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted font-mono uppercase tracking-wider text-[10px]">
              Mutation Rate
            </span>
            <span className="font-mono text-lime font-medium text-xs px-2 py-0.5 rounded bg-surface border border-lime-border">
              {(config.mutation_rate * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min={0.01}
            max={0.5}
            step={0.01}
            disabled={isStreaming}
            value={config.mutation_rate}
            onChange={(e) =>
              setConfig({ ...config, mutation_rate: Number(e.target.value) })
            }
            className="w-full h-1.5 cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Crossover Rate */}
        <div className="p-4 rounded-2xl bg-surface-raised/40 border border-surface-border flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted font-mono uppercase tracking-wider text-[10px]">
              Crossover Rate
            </span>
            <span className="font-mono text-white font-medium text-xs px-2 py-0.5 rounded bg-surface border border-surface-border">
              {(config.crossover_rate * 100).toFixed(0)}%
            </span>
          </div>
          <input
            type="range"
            min={0.5}
            max={1.0}
            step={0.05}
            disabled={isStreaming}
            value={config.crossover_rate}
            onChange={(e) =>
              setConfig({ ...config, crossover_rate: Number(e.target.value) })
            }
            className="w-full h-1.5 cursor-pointer disabled:opacity-40"
          />
        </div>
      </div>

      {/* Advanced GA Options */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-2 text-xs font-mono text-muted hover:text-white transition-colors"
        >
          <Sliders className="h-3.5 w-3.5 text-lime" />
          <span>Advanced Heuristics (Stagnation & Local Search)</span>
          {showAdvanced ? (
            <ChevronUp className="h-3.5 w-3.5 ml-1" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 ml-1" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-5 pt-5 border-t border-surface-border grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-raised border border-surface-border text-neutral-300 cursor-pointer hover:border-neutral-700 transition-all">
              <input
                type="checkbox"
                checked={config.adaptive_mutation || false}
                disabled={isStreaming}
                onChange={(e) =>
                  setConfig({ ...config, adaptive_mutation: e.target.checked })
                }
                className="w-4 h-4 rounded accent-lime bg-surface border-surface-border"
              />
              <span className="text-xs">Adaptive Mutation (Ramps on stagnation)</span>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-raised border border-surface-border text-neutral-300 cursor-pointer hover:border-neutral-700 transition-all">
              <input
                type="checkbox"
                checked={config.diversity_injection || false}
                disabled={isStreaming}
                onChange={(e) =>
                  setConfig({ ...config, diversity_injection: e.target.checked })
                }
                className="w-4 h-4 rounded accent-lime bg-surface border-surface-border"
              />
              <span className="text-xs">Diversity Injection (Replaces worst)</span>
            </label>

            <label className="flex items-center gap-3 p-3.5 rounded-2xl bg-surface-raised border border-surface-border text-neutral-300 cursor-pointer hover:border-neutral-700 transition-all">
              <input
                type="checkbox"
                checked={config.local_search_enabled || false}
                disabled={isStreaming}
                onChange={(e) =>
                  setConfig({ ...config, local_search_enabled: e.target.checked })
                }
                className="w-4 h-4 rounded accent-lime bg-surface border-surface-border"
              />
              <span className="text-xs">Memetic Local Search (Hill-climbing)</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
