"use client";

import React, { useState, useEffect, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { LiveMetricsCards } from "@/components/LiveMetricsCards";
import { OptimizerControls } from "@/components/OptimizerControls";
import { ConvergenceChart } from "@/components/ConvergenceChart";
import { TimetableGrid } from "@/components/TimetableGrid";
import { VisualizerView } from "@/components/VisualizerView";
import { ScenarioEditorModal } from "@/components/ScenarioEditorModal";
import {
  DatasetInput,
  GAConfig,
  GenerationStat,
  GeneOut,
  ScenarioPreset,
  StreamEvent,
} from "@/lib/types";
import { fetchScenarios, streamOptimize } from "@/lib/api";

const FALLBACK_DATASET: DatasetInput = {
  days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  periods_per_day: 8,
  batches: [
    { batch_id: "B1", name: "AIML-A", student_count: 50 },
    { batch_id: "B2", name: "AIML-B", student_count: 50 },
  ],
  faculty: [
    { faculty_id: "F01", name: "Dr. A. Sharma", department: "CSE" },
    { faculty_id: "F02", name: "Dr. B. Mehta", department: "CSE" },
    { faculty_id: "F03", name: "Dr. C. Rao", department: "AI & ML" },
    { faculty_id: "F04", name: "Dr. D. Iyer", department: "AI & ML" },
    { faculty_id: "F05", name: "Dr. E. Nair", department: "Mathematics" },
    { faculty_id: "F06", name: "Dr. F. Kapoor", department: "Mathematics" },
  ],
  rooms: [
    { room_id: "R01", room_number: "LT-1", capacity: 80, room_type: "Lecture" },
    { room_id: "R02", room_number: "LT-2", capacity: 80, room_type: "Lecture" },
    { room_id: "R03", room_number: "LB-1", capacity: 40, room_type: "Lab" },
    { room_id: "R04", room_number: "SR-1", capacity: 60, room_type: "Seminar" },
  ],
  subjects: [
    { subject_id: "S01", name: "Artificial Intelligence", faculty_id: "F01", batch_id: "B1", sessions_per_week: 2, expected_students: 50, preferred_room_type: "Lecture" },
    { subject_id: "S02", name: "Machine Learning", faculty_id: "F02", batch_id: "B2", sessions_per_week: 2, expected_students: 50, preferred_room_type: "Lecture" },
    { subject_id: "S03", name: "Deep Learning", faculty_id: "F03", batch_id: "B1", sessions_per_week: 2, expected_students: 50, preferred_room_type: "Lecture" },
    { subject_id: "S04", name: "Database Systems", faculty_id: "F04", batch_id: "B2", sessions_per_week: 2, expected_students: 50, preferred_room_type: "Lecture" },
    { subject_id: "S05", name: "Operating Systems", faculty_id: "F05", batch_id: "B1", sessions_per_week: 2, expected_students: 50, preferred_room_type: "Lecture" },
    { subject_id: "S06", name: "Computer Networks", faculty_id: "F06", batch_id: "B2", sessions_per_week: 2, expected_students: 50, preferred_room_type: "Lecture" },
    { subject_id: "S07", name: "Data Structures", faculty_id: "F01", batch_id: "B1", sessions_per_week: 2, expected_students: 50, preferred_room_type: "Lecture" },
    { subject_id: "S08", name: "Algorithms", faculty_id: "F02", batch_id: "B2", sessions_per_week: 2, expected_students: 50, preferred_room_type: "Lecture" },
  ],
};

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"optimizer" | "visualizer">("optimizer");
  const [presets, setPresets] = useState<ScenarioPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>("compact-demo");
  const [dataset, setDataset] = useState<DatasetInput | null>(FALLBACK_DATASET);
  const [isEditorOpen, setIsEditorOpen] = useState<boolean>(false);

  // GA Configuration
  const [config, setConfig] = useState<GAConfig>({
    population_size: 60,
    generations: 200,
    mutation_rate: 0.1,
    crossover_rate: 0.8,
    tournament_size: 3,
    elite_count: 4,
    stagnation_limit: 40,
    random_seed: 42,
    adaptive_mutation: false,
    diversity_injection: false,
    local_search_enabled: false,
  });

  // Streaming & Live State
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(2); // 1x, 2x, 5x, 0=Max
  const [generation, setGeneration] = useState<number>(0);
  const [hardViolations, setHardViolations] = useState<number>(0);
  const [bestCost, setBestCost] = useState<number>(0);
  const [bestFitness, setBestFitness] = useState<number>(0);
  const [softPenalty, setSoftPenalty] = useState<number>(0);
  const [executionTime, setExecutionTime] = useState<number>(0);
  const [convergedEarly, setConvergedEarly] = useState<boolean>(false);
  const [history, setHistory] = useState<GenerationStat[]>([]);
  const [timetable, setTimetable] = useState<GeneOut[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<any>(null);

  // Load Presets on Mount
  useEffect(() => {
    async function loadData() {
      try {
        const scenarioPresets = await fetchScenarios();
        setPresets(scenarioPresets);
        if (scenarioPresets.length > 0) {
          const defaultPreset =
            scenarioPresets.find((p) => p.metadata.id === "compact-demo") ||
            scenarioPresets[0];
          setSelectedPresetId(defaultPreset.metadata.id);
          setDataset(defaultPreset.dataset);
        }
      } catch (err) {
        console.warn("Backend not yet reachable, using fallback interactive demo scenario:", err);
      }
    }
    loadData();
  }, []);

  const handleSelectPreset = (presetId: string) => {
    const found = presets.find((p) => p.metadata.id === presetId);
    if (found) {
      setSelectedPresetId(presetId);
      setDataset(found.dataset);
      handleReset();
    }
  };

  const handleStartEvolution = async () => {
    if (!dataset || isStreaming) return;

    handleReset();
    setIsStreaming(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();

    timerIntervalRef.current = setInterval(() => {
      setExecutionTime((Date.now() - startTimeRef.current) / 1000);
    }, 100);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    await streamOptimize(
      dataset,
      config,
      {
        onEvent: (event: StreamEvent) => {
          if (event.type === "generation") {
            setGeneration(event.generation);
            setBestCost(event.best_cost);
            setBestFitness(event.best_fitness);
            setHardViolations(event.hard_violations);
            setSoftPenalty(event.soft_penalty);
            if (event.timetable) {
              setTimetable(event.timetable);
            }
            setHistory((prev) => [
              ...prev,
              {
                generation: event.generation,
                best_fitness: event.best_fitness,
                avg_fitness: event.avg_fitness,
                best_cost: event.best_cost,
                hard_violations: event.hard_violations,
                soft_penalty: event.soft_penalty,
              },
            ]);
          } else if (event.type === "complete") {
            setGeneration(event.generations_executed);
            setBestCost(event.final_cost);
            setBestFitness(event.final_fitness);
            setConvergedEarly(event.converged_early);
            setTimetable(event.timetable);
            setExecutionTime(event.execution_time_seconds);
            setIsStreaming(false);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          }
        },
        onError: (err) => {
          console.error("Stream error", err);
          setIsStreaming(false);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        },
        onDone: () => {
          setIsStreaming(false);
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        },
      },
      controller.signal
    );
  };

  const handlePause = () => {
    setIsPaused(true);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  const handleReset = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsStreaming(false);
    setIsPaused(false);
    setGeneration(0);
    setHardViolations(0);
    setBestCost(0);
    setBestFitness(0);
    setSoftPenalty(0);
    setExecutionTime(0);
    setConvergedEarly(false);
    setHistory([]);
    setTimetable([]);
  };

  const activePreset = presets.find((p) => p.metadata.id === selectedPresetId);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenEditor={() => setIsEditorOpen(true)}
        selectedScenarioName={activePreset?.metadata.name || "Fast Interactive Demo"}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 md:px-8 py-8 flex flex-col gap-8">
        {dataset ? (
          <>
            {activeTab === "optimizer" && (
              <div className="flex flex-col gap-8">
                {/* Real-time KPI Cards */}
                <LiveMetricsCards
                  generation={generation}
                  maxGenerations={config.generations}
                  hardViolations={hardViolations}
                  bestCost={bestCost}
                  bestFitness={bestFitness}
                  softPenalty={softPenalty}
                  executionTime={executionTime}
                  isStreaming={isStreaming}
                  convergedEarly={convergedEarly}
                />

                {/* Evolution Controls & Parameter Sliders */}
                <OptimizerControls
                  config={config}
                  setConfig={setConfig}
                  isStreaming={isStreaming}
                  isPaused={isPaused}
                  onStart={handleStartEvolution}
                  onPause={handlePause}
                  onResume={handleResume}
                  onReset={handleReset}
                  speed={speed}
                  setSpeed={setSpeed}
                />

                {/* Live Convergence Chart */}
                <ConvergenceChart history={history} />

                {/* Symmetrical Schedule Matrix Grid */}
                <TimetableGrid timetable={timetable} dataset={dataset} />
              </div>
            )}

            {activeTab === "visualizer" && <VisualizerView dataset={dataset} />}
          </>
        ) : (
          <div className="h-96 rounded-2xl border border-border bg-surface flex flex-col items-center justify-center gap-4 text-muted">
            <div className="animate-spin h-6 w-6 border-2 border-forest border-t-transparent rounded-full" />
            <span className="text-xs">Connecting to Optimization Engine...</span>
            <button
              onClick={() => setDataset(FALLBACK_DATASET)}
              className="px-4 py-2 rounded-xl bg-forest text-white text-xs font-medium shadow-sm hover:bg-forest-hover transition-all"
            >
              Load Interactive Demo Scenario
            </button>
          </div>
        )}
      </main>

      {/* Scenario Editor Drawer */}
      {dataset && (
        <ScenarioEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          dataset={dataset}
          setDataset={setDataset}
          presets={presets}
          onSelectPreset={handleSelectPreset}
          currentPresetId={selectedPresetId}
        />
      )}
    </div>
  );
}
