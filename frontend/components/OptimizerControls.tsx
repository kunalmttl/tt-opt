"use client";

import React from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
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
  return (
    <div className="p-8 rounded-3xl border border-border bg-surface-raised flex flex-col gap-6 shadow-sm">
      {/* Top Playback Actions */}
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-3">
          {!isStreaming ? (
            <button
              onClick={onStart}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-forest hover:bg-forest-hover text-white font-medium text-xs transition-all shadow-sm"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>Start GA Evolution</span>
            </button>
          ) : isPaused ? (
            <button
              onClick={onResume}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-forest hover:bg-forest-hover text-white font-medium text-xs transition-all shadow-sm"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>Resume Evolution</span>
            </button>
          ) : (
            <button
              onClick={onPause}
              className="flex items-center gap-2.5 px-6 py-3 rounded-2xl bg-canary text-text-primary font-medium text-xs hover:bg-canary-hover transition-all shadow-sm border border-black/5"
            >
              <Pause className="h-3.5 w-3.5 fill-text-primary" />
              <span>Pause</span>
            </button>
          )}

          <button
            onClick={onReset}
            disabled={!isStreaming && !isPaused}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-border text-text-secondary hover:text-text-primary hover:bg-surface text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Speed Multiplier Pills */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted font-mono uppercase tracking-wider">Speed:</span>
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-surface border border-border font-mono text-[11px]">
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
                    ? "bg-forest text-white font-medium shadow-sm"
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Optimization Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-border">
        {/* Population Size */}
        <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted font-mono uppercase tracking-wider text-[10px]">
              Population Size
            </span>
            <span className="font-mono text-text-primary font-medium text-xs px-2 py-0.5 rounded bg-surface-raised border border-border">
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
        <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted font-mono uppercase tracking-wider text-[10px]">
              Generations
            </span>
            <span className="font-mono text-text-primary font-medium text-xs px-2 py-0.5 rounded bg-surface-raised border border-border">
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
        <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted font-mono uppercase tracking-wider text-[10px]">
              Mutation Rate
            </span>
            <span className="font-mono text-coral font-semibold text-xs px-2 py-0.5 rounded bg-coral/10 border border-coral/30">
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
        <div className="p-4 rounded-2xl bg-surface border border-border flex flex-col gap-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted font-mono uppercase tracking-wider text-[10px]">
              Crossover Rate
            </span>
            <span className="font-mono text-text-primary font-medium text-xs px-2 py-0.5 rounded bg-surface-raised border border-border">
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
    </div>
  );
};
