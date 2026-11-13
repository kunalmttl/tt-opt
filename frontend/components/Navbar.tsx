"use client";

import React from "react";
import { Zap, BarChart2, Eye, Database } from "lucide-react";
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
    <header className="border-b border-surface-border bg-background/90 backdrop-blur-md sticky top-0 z-40 px-6 md:px-10 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Brand & Course Subtitle */}
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#1c2214] to-[#121612] border border-lime-border flex items-center justify-center text-lime shadow-[0_0_20px_rgba(212,249,56,0.15)]">
            <Zap className="h-5 w-5 fill-lime/20" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-tight text-white">
                OptiTable
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full border border-lime-border text-lime bg-lime-muted">
                GA Optimizer
              </span>
            </div>
            <p className="text-[11px] text-muted">
              Optimization Techniques • Scenario:{" "}
              <span className="text-neutral-300 font-medium">{selectedScenarioName}</span>
            </p>
          </div>
        </div>

        {/* View Switcher Pills */}
        <div className="flex items-center gap-1 p-1 bg-surface border border-surface-border rounded-2xl">
          <button
            onClick={() => setActiveTab("optimizer")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all",
              activeTab === "optimizer"
                ? "bg-surface-raised text-white border border-surface-border shadow-sm"
                : "text-muted hover:text-neutral-200"
            )}
          >
            <span
              className={cn(
                "h-1.5 w-1.5 rounded-full transition-colors",
                activeTab === "optimizer" ? "bg-lime" : "bg-neutral-600"
              )}
            />
            Live Optimizer
          </button>

          <button
            onClick={() => setActiveTab("benchmark")}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all",
              activeTab === "benchmark"
                ? "bg-surface-raised text-white border border-surface-border shadow-sm"
                : "text-muted hover:text-neutral-200"
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
                ? "bg-surface-raised text-white border border-surface-border shadow-sm"
                : "text-muted hover:text-neutral-200"
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
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-surface-border bg-surface hover:bg-surface-raised text-neutral-300 hover:text-white transition-all"
          >
            <Database className="h-3.5 w-3.5 text-muted" />
            Scenario Editor
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-[11px] font-mono border border-surface-border bg-surface">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isBackendConnected
                  ? "bg-lime shadow-[0_0_8px_rgba(212,249,56,0.6)]"
                  : "bg-rose-500 animate-pulse"
              )}
            />
            <span className="text-muted">
              {isBackendConnected ? "Connected" : "Offline"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
