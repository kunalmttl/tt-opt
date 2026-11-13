"use client";

import React from "react";
import { BarChart2, Eye, Database, Activity } from "lucide-react";
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
    <header className="border-b border-border bg-surface/80 backdrop-blur-md sticky top-0 z-40 px-6 md:px-10 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-coral flex items-center justify-center text-white shadow-sm">
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="7" height="7" rx="1.5" className="fill-white/20" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" className="fill-white" />
            </svg>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-base font-semibold tracking-tight text-text-primary">
              ChronoGrid
            </span>
            <span className="text-[11px] font-mono text-muted">
              • {selectedScenarioName}
            </span>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-surface-raised border border-border rounded-2xl shadow-sm">
          <button
            onClick={() => setActiveTab("optimizer")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all",
              activeTab === "optimizer"
                ? "bg-forest text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-black/5"
            )}
          >
            <Activity className="h-3.5 w-3.5" />
            Live Optimizer
          </button>

          <button
            onClick={() => setActiveTab("benchmark")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all",
              activeTab === "benchmark"
                ? "bg-forest text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-black/5"
            )}
          >
            <BarChart2 className="h-3.5 w-3.5" />
            Benchmark Suite
          </button>

          <button
            onClick={() => setActiveTab("visualizer")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all",
              activeTab === "visualizer"
                ? "bg-forest text-white shadow-sm"
                : "text-text-secondary hover:text-text-primary hover:bg-black/5"
            )}
          >
            <Eye className="h-3.5 w-3.5" />
            Operator Visualizer
          </button>
        </div>

        {/* Right Tools */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenEditor}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium border border-border bg-surface-raised hover:bg-white text-text-secondary hover:text-text-primary transition-all shadow-sm"
          >
            <Database className="h-3.5 w-3.5 text-muted" />
            Scenario Editor
          </button>
        </div>
      </div>
    </header>
  );
};
