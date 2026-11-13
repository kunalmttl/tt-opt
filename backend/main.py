"""
FastAPI backend for the University Timetable Optimizer.

Endpoints:
    GET  /api/demo-data   -> a ready-to-use sample dataset
    POST /api/optimize    -> run the real Genetic Algorithm and return the
                             optimized timetable, convergence history, and
                             constraint report
    POST /api/export/csv  -> export a given timetable as CSV
    GET  /api/health      -> health check
"""
from __future__ import annotations
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import PlainTextResponse, StreamingResponse
from pydantic import BaseModel

from backend.models.schemas import (
    OptimizeRequest, OptimizeResponse, GeneOut, GenerationStat, ConstraintReport, DatasetInput,
    InitialMetrics, BenchmarkRequest, BenchmarkResponse, VisualizerStepRequest,
    VisualizerStepResponse, ScenarioPreset,
)
from backend.data.sample_data import build_sample_dataset, get_all_presets, get_preset_by_id
from backend.optimizer.ga import run_ga, stream_ga
from backend.optimizer.chromosome import chromosome_to_timetable
from backend.optimizer.baselines.benchmark import run_benchmark
from backend.optimizer.visualizer import generate_visualizer_step
from backend.utils.export import timetable_to_csv

app = FastAPI(title="University Timetable Optimizer", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/demo-data", response_model=DatasetInput)
def demo_data():
    return build_sample_dataset()


@app.post("/api/optimize", response_model=OptimizeResponse)
def optimize(request: OptimizeRequest):
    dataset = request.dataset
    if not dataset.subjects:
        raise HTTPException(status_code=422, detail="Dataset must include at least one subject.")

    try:
        result = run_ga(dataset, request.config)
    except Exception as exc:  # pragma: no cover - defensive; GA itself is deterministic given valid input
        raise HTTPException(status_code=500, detail=f"Optimization failed: {exc}") from exc

    ctx = result.context
    timetable = chromosome_to_timetable(result.best_chromosome, ctx)

    history = [
        GenerationStat(
            generation=h.generation, best_fitness=h.best_fitness, avg_fitness=h.avg_fitness,
            best_cost=h.best_cost, hard_violations=h.hard_violations, soft_penalty=h.soft_penalty,
        )
        for h in result.history
    ]

    constraints = ConstraintReport(
        faculty_conflicts=result.best_counts.faculty_conflicts,
        student_conflicts=result.best_counts.student_conflicts,
        room_conflicts=result.best_counts.room_conflicts,
        capacity_violations=result.best_counts.capacity_violations,
        faculty_gaps=result.best_counts.faculty_gaps,
        student_gaps=result.best_counts.student_gaps,
        distribution_penalties=result.best_counts.distribution_penalty_units,
    )

    initial_metrics = None
    if result.initial_counts is not None:
        initial_soft = (
            result.initial_counts.faculty_gaps
            + result.initial_counts.student_gaps
            + result.initial_counts.distribution_penalty_units
        )
        initial_metrics = InitialMetrics(
            hard_violations=result.initial_counts.hard_total,
            soft_violations=initial_soft,
            faculty_conflicts=result.initial_counts.faculty_conflicts,
            student_conflicts=result.initial_counts.student_conflicts,
            room_conflicts=result.initial_counts.room_conflicts,
            capacity_violations=result.initial_counts.capacity_violations,
            faculty_gaps=result.initial_counts.faculty_gaps,
            student_gaps=result.initial_counts.student_gaps,
            distribution_penalties=result.initial_counts.distribution_penalty_units,
            total_cost=result.initial_cost,
            fitness=result.initial_fitness,
        )

    return OptimizeResponse(
        timetable=timetable,
        history=history,
        final_cost=result.best_cost,
        final_fitness=result.best_fitness,
        constraints=constraints,
        generations_executed=result.generations_executed,
        execution_time_seconds=result.execution_time_seconds,
        population_size=request.config.population_size,
        converged_early=result.converged_early,
        initial_metrics=initial_metrics,
    )


@app.post("/api/optimize/stream")
def optimize_stream(request: OptimizeRequest):
    dataset = request.dataset
    if not dataset.subjects:
        raise HTTPException(status_code=422, detail="Dataset must include at least one subject.")

    def event_stream():
        try:
            for event in stream_ga(dataset, request.config):
                yield f"data: {json.dumps(event)}\n\n"
        except Exception as exc:
            yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@app.post("/api/benchmark", response_model=BenchmarkResponse)
def benchmark(request: BenchmarkRequest):
    if not request.dataset.subjects:
        raise HTTPException(status_code=422, detail="Dataset must include at least one subject.")
    try:
        return run_benchmark(request.dataset, request.config)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Benchmark execution failed: {exc}") from exc


@app.post("/api/visualizer/step", response_model=VisualizerStepResponse)
def visualizer_step(request: VisualizerStepRequest):
    if not request.dataset.subjects:
        raise HTTPException(status_code=422, detail="Dataset must include at least one subject.")
    try:
        return generate_visualizer_step(request)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Visualizer step generation failed: {exc}") from exc


@app.get("/api/scenarios", response_model=List[ScenarioPreset])
def list_scenarios():
    return get_all_presets()


@app.get("/api/scenarios/{scenario_id}", response_model=ScenarioPreset)
def get_scenario(scenario_id: str):
    preset = get_preset_by_id(scenario_id)
    if preset is None:
        raise HTTPException(status_code=404, detail=f"Scenario preset '{scenario_id}' not found.")
    return preset


class ExportRequest(BaseModel):
    timetable: List[GeneOut]


@app.post("/api/export/csv", response_class=PlainTextResponse)
def export_csv(request: ExportRequest):
    return timetable_to_csv(request.timetable)
