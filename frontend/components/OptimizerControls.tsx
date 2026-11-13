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
    <div className="p-6 rounded-xl border border-border bg-surface flex flex-col gap-6">
      {/* Top Playback Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {!isStreaming ? (
            <button
              onClick={onStart}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-neutral-900 font-medium text-xs hover:bg-neutral-100 transition-colors shadow-sm"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Start Evolution
            </button>
          ) : isPaused ? (
            <button
              onClick={onResume}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-neutral-900 font-medium text-xs hover:bg-neutral-100 transition-colors shadow-sm"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Resume
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-surface-raised border border-border text-white font-medium text-xs hover:bg-neutral-800 transition-colors"
            >
              <Pause className="h-3.5 w-3.5 fill-current" />
              Pause
            </button>
          )}

          <button
            onClick={onReset}
            disabled={!isStreaming && !isPaused}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-border text-muted hover:text-neutral-200 text-xs font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>

        {/* Speed Selector */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-muted">Speed:</span>
          <div className="flex items-center gap-1 p-0.5 rounded-md bg-surface-raised border border-border font-mono text-[11px]">
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
                  "px-2.5 py-1 rounded transition-colors",
                  speed === s.val
                    ? "bg-neutral-800 text-white font-medium"
                    : "text-muted hover:text-neutral-300"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Primary Parameters Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-border">
        {/* Population Size */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted">Population Size</span>
            <span className="font-mono text-neutral-300">{config.population_size}</span>
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
            className="w-full accent-white h-1.5 bg-neutral-800 rounded-lg cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Max Generations */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted">Generations</span>
            <span className="font-mono text-neutral-300">{config.generations}</span>
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
            className="w-full accent-white h-1.5 bg-neutral-800 rounded-lg cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Mutation Rate */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted">Mutation Rate</span>
            <span className="font-mono text-neutral-300">
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
            className="w-full accent-white h-1.5 bg-neutral-800 rounded-lg cursor-pointer disabled:opacity-40"
          />
        </div>

        {/* Crossover Rate */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <span className="text-muted">Crossover Rate</span>
            <span className="font-mono text-neutral-300">
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
            className="w-full accent-white h-1.5 bg-neutral-800 rounded-lg cursor-pointer disabled:opacity-40"
          />
        </div>
      </div>

      {/* Advanced Optimization Options Toggle */}
      <div>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-neutral-200 transition-colors"
        >
          <Sliders className="h-3 w-3" />
          <span>Advanced GA Heuristics (Stagnation & Convergence)</span>
          {showAdvanced ? (
            <ChevronUp className="h-3 w-3 ml-0.5" />
          ) : (
            <ChevronDown className="h-3 w-3 ml-0.5" />
          )}
        </button>

        {showAdvanced && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <label className="flex items-center gap-2.5 text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.adaptive_mutation || false}
                disabled={isStreaming}
                onChange={(e) =>
                  setConfig({ ...config, adaptive_mutation: e.target.checked })
                }
                className="rounded border-border bg-surface-raised text-primary focus:ring-0"
              />
              <span>Adaptive Mutation (Ramps up on stagnation)</span>
            </label>

            <label className="flex items-center gap-2.5 text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.diversity_injection || false}
                disabled={isStreaming}
                onChange={(e) =>
                  setConfig({ ...config, diversity_injection: e.target.checked })
                }
                className="rounded border-border bg-surface-raised text-primary focus:ring-0"
              />
              <span>Diversity Injection (Replaces worst chromosomes)</span>
            </label>

            <label className="flex items-center gap-2.5 text-neutral-300 cursor-pointer">
              <input
                type="checkbox"
                checked={config.local_search_enabled || false}
                disabled={isStreaming}
                onChange={(e) =>
                  setConfig({ ...config, local_search_enabled: e.target.checked })
                }
                className="rounded border-border bg-surface-raised text-primary focus:ring-0"
              />
              <span>Memetic Local Search (Hill-climbing on elites)</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};
