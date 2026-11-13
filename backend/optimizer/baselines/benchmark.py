from __future__ import annotations
import random
from typing import List

from backend.models.schemas import (
    DatasetInput, BenchmarkConfig, BenchmarkResponse, AlgorithmBenchmarkResult,
    BenchmarkIterationPoint, GAConfig, ConstraintReport
)
from backend.optimizer.chromosome import ProblemContext
from backend.optimizer.ga import run_ga
from backend.optimizer.baselines.random_search import run_random_search
from backend.optimizer.baselines.greedy import run_greedy
from backend.optimizer.baselines.simulated_annealing import run_simulated_annealing


def run_benchmark(dataset: DatasetInput, config: BenchmarkConfig) -> BenchmarkResponse:
    rng = random.Random(config.random_seed) if config.random_seed is not None else random.Random()
    ctx = ProblemContext.build(dataset)
    results: List[AlgorithmBenchmarkResult] = []

    ga_config = GAConfig(
        generations=config.iterations,
        population_size=config.population_size,
        random_seed=config.random_seed,
    )

    algorithms_to_run = set(config.algorithms)

    if "ga" in algorithms_to_run:
        ga_res = run_ga(dataset, ga_config)
        ga_history = [
            BenchmarkIterationPoint(
                iteration=h.generation,
                best_cost=round(h.best_cost, 2),
                best_fitness=round(h.best_fitness, 6),
                hard_violations=h.hard_violations,
                soft_penalty=round(h.soft_penalty, 2),
            )
            for h in ga_res.history
        ]
        soft_total = (
            ga_res.best_counts.faculty_gaps
            + ga_res.best_counts.student_gaps
            + ga_res.best_counts.distribution_penalty_units
        )
        constraints = ConstraintReport(
            faculty_conflicts=ga_res.best_counts.faculty_conflicts,
            student_conflicts=ga_res.best_counts.student_conflicts,
            room_conflicts=ga_res.best_counts.room_conflicts,
            capacity_violations=ga_res.best_counts.capacity_violations,
            faculty_gaps=ga_res.best_counts.faculty_gaps,
            student_gaps=ga_res.best_counts.student_gaps,
            distribution_penalties=ga_res.best_counts.distribution_penalty_units,
        )
        results.append(
            AlgorithmBenchmarkResult(
                algorithm_key="ga",
                algorithm_name="Genetic Algorithm",
                final_cost=round(ga_res.best_cost, 2),
                final_fitness=round(ga_res.best_fitness, 6),
                hard_violations=ga_res.best_counts.hard_total,
                soft_violations=soft_total,
                execution_time_seconds=round(ga_res.execution_time_seconds, 3),
                converged_zero_hard=ga_res.best_counts.hard_total == 0,
                history=ga_history,
                constraints=constraints,
            )
        )

    if "simulated_annealing" in algorithms_to_run:
        sa_seed = rng.randint(1, 100000)
        sa_rng = random.Random(sa_seed)
        sa_res, _ = run_simulated_annealing(
            ctx, ga_config, config.iterations,
            config.sa_initial_temp, config.sa_cooling_rate, sa_rng
        )
        results.append(sa_res)

    if "greedy" in algorithms_to_run:
        greedy_seed = rng.randint(1, 100000)
        greedy_rng = random.Random(greedy_seed)
        greedy_res, _ = run_greedy(ctx, ga_config, config.iterations, greedy_rng)
        results.append(greedy_res)

    if "random_search" in algorithms_to_run:
        rs_seed = rng.randint(1, 100000)
        rs_rng = random.Random(rs_seed)
        rs_res, _ = run_random_search(ctx, ga_config, config.iterations, rs_rng)
        results.append(rs_res)

    sorted_results = sorted(results, key=lambda r: (r.hard_violations, r.final_cost))
    winner = sorted_results[0] if sorted_results else None
    winner_key = winner.algorithm_key if winner else "none"

    if winner:
        summary = (
            f"{winner.algorithm_name} achieved the best optimization outcome with "
            f"{winner.hard_violations} hard violations and a final objective cost of {winner.final_cost:.2f} "
            f"in {winner.execution_time_seconds:.2f}s."
        )
    else:
        summary = "No algorithms executed."

    return BenchmarkResponse(
        results=results,
        winner_algorithm=winner_key,
        summary=summary,
    )
