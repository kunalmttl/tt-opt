"use client";

import React from "react";
import { Sparkles, BarChart2, Eye, Database, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavbarProps {
  activeTab: "optimizer" | "benchmark" | "visualizer";
  setActiveTab: (tab: "optimizer" | "benchmark" | "visualizer") => void;
  onOpenEditor: () => void;
  isBackendConnected: boolean;
  selectedScenarioName: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenEditor,
  isBackendConnected,
  selectedScenarioName,
}) => {
  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur sticky top-0 z-40 px-8 py-5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Title and Academic Tag */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-primary">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-base font-medium tracking-tight text-white">
                University Timetable Optimizer
              </h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded border border-border text-muted bg-surface-raised">
                Optimization Techniques
              </span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              Constraint-Aware Genetic Algorithm • Scenario:{" "}
              <span className="text-neutral-300 font-medium">{selectedScenarioName}</span>
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-raised border border-border rounded-lg">
          <button
            onClick={() => setActiveTab("optimizer")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors",
              activeTab === "optimizer"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-muted hover:text-neutral-200"
            )}
          >
            <Activity className="h-3.5 w-3.5" />
            Live Optimizer
          </button>
          <button
            onClick={() => setActiveTab("benchmark")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors",
              activeTab === "benchmark"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-muted hover:text-neutral-200"
            )}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            Comparative Benchmark
          </button>
          <button
            onClick={() => setActiveTab("visualizer")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors",
              activeTab === "visualizer"
                ? "bg-neutral-800 text-white shadow-sm"
                : "text-muted hover:text-neutral-200"
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            Operator Visualizer
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenEditor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border border-border bg-surface hover:bg-surface-raised text-neutral-300 transition-colors"
          >
            <Database className="h-3.5 w-3.5 text-muted" />
            Data & Scenarios
          </button>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-md text-[11px] font-mono border border-border bg-surface-raised">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isBackendConnected ? "bg-emerald-500" : "bg-rose-500 animate-pulse"
              )}
            />
            <span className="text-muted">
              {isBackendConnected ? "API Connected" : "API Offline"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
