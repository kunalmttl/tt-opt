import json
import random
from fastapi.testclient import TestClient

from backend.main import app
from backend.models.schemas import (
    DatasetInput, GAConfig, BenchmarkConfig, BenchmarkRequest, VisualizerStepRequest
)
from backend.data.sample_data import build_compact_dataset, get_all_presets, get_preset_by_id
from backend.optimizer.ga import stream_ga
from backend.optimizer.chromosome import ProblemContext
from backend.optimizer.baselines.random_search import run_random_search
from backend.optimizer.baselines.greedy import run_greedy
from backend.optimizer.baselines.simulated_annealing import run_simulated_annealing


client = TestClient(app)


def test_stream_ga_generator():
    dataset = build_compact_dataset()
    config = GAConfig(generations=4, population_size=10, random_seed=42)
    events = list(stream_ga(dataset, config, emit_timetable_interval=2))

    assert len(events) >= 5
    gen_events = [e for e in events if e["type"] == "generation"]
    complete_events = [e for e in events if e["type"] == "complete"]

    assert len(gen_events) == 4
    assert len(complete_events) == 1
    assert complete_events[0]["generations_executed"] == 4
    assert "timetable" in complete_events[0]
    assert len(complete_events[0]["timetable"]) > 0


def test_api_optimize_stream_sse():
    dataset = build_compact_dataset()
    payload = {
        "dataset": dataset.model_dump(),
        "config": {"generations": 3, "population_size": 10, "random_seed": 42},
    }
    with client.stream("POST", "/api/optimize/stream", json=payload) as response:
        assert response.status_code == 200
        assert "text/event-stream" in response.headers["content-type"]
        lines = [line for line in response.iter_lines() if line.startswith("data: ")]
        assert len(lines) >= 4
        first_event = json.loads(lines[0][6:])
        assert first_event["type"] == "generation"
        last_event = json.loads(lines[-1][6:])
        assert last_event["type"] == "complete"


def test_benchmark_endpoint():
    dataset = build_compact_dataset()
    payload = {
        "dataset": dataset.model_dump(),
        "config": {
            "algorithms": ["ga", "greedy", "simulated_annealing", "random_search"],
            "iterations": 10,
            "population_size": 10,
            "random_seed": 42,
        },
    }
    response = client.post("/api/benchmark", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert len(data["results"]) == 4
    assert data["winner_algorithm"] in ["ga", "greedy", "simulated_annealing", "random_search"]
    assert len(data["summary"]) > 0


def test_visualizer_step_endpoint():
    dataset = build_compact_dataset()
    payload = {
        "dataset": dataset.model_dump(),
        "tournament_size": 2,
        "mutation_rate": 0.2,
        "random_seed": 42,
    }
    response = client.post("/api/visualizer/step", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "selection" in data
    assert "crossover" in data
    assert "mutation" in data
    assert "repair" in data
    assert len(data["selection"]["candidates"]) == 2
    assert data["crossover"]["point_1"] <= data["crossover"]["point_2"]


def test_scenario_presets_endpoints():
    response = client.get("/api/scenarios")
    assert response.status_code == 200
    presets = response.json()
    assert len(presets) >= 3

    compact_res = client.get("/api/scenarios/compact-demo")
    assert compact_res.status_code == 200
    assert compact_res.json()["metadata"]["id"] == "compact-demo"

    not_found = client.get("/api/scenarios/nonexistent-preset")
    assert not_found.status_code == 404


def test_baselines_direct():
    dataset = build_compact_dataset()
    ctx = ProblemContext.build(dataset)
    config = GAConfig()
    rng = random.Random(42)

    rs_res, rs_chrom = run_random_search(ctx, config, iterations=5, rng=rng)
    assert rs_res.algorithm_key == "random_search"
    assert len(rs_res.history) == 5

    greedy_res, gr_chrom = run_greedy(ctx, config, iterations=5, rng=rng)
    assert greedy_res.algorithm_key == "greedy"
    assert len(greedy_res.history) == 5

    sa_res, sa_chrom = run_simulated_annealing(ctx, config, iterations=5, initial_temp=50.0, cooling_rate=0.9, rng=rng)
    assert sa_res.algorithm_key == "simulated_annealing"
    assert len(sa_res.history) == 5
