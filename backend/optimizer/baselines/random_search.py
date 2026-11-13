from __future__ import annotations
import random
import time
from typing import List, Tuple

from backend.models.schemas import (
    GAConfig, BenchmarkIterationPoint, ConstraintReport, AlgorithmBenchmarkResult
)
from backend.optimizer.chromosome import ProblemContext, Chromosome, create_random_chromosome
from backend.optimizer.fitness import evaluate, ConstraintCounts


def run_random_search(
    ctx: ProblemContext,
    config: GAConfig,
    iterations: int,
    rng: random.Random,
) -> Tuple[AlgorithmBenchmarkResult, Chromosome]:
    start_time = time.time()
    best_chromosome: Chromosome = create_random_chromosome(ctx, rng)
    best_cost, best_fitness, best_counts = evaluate(best_chromosome, ctx, config)
    history: List[BenchmarkIterationPoint] = []

    for i in range(1, iterations + 1):
        candidate = create_random_chromosome(ctx, rng)
        cost, fitness, counts = evaluate(candidate, ctx, config)
        if cost < best_cost:
            best_cost = cost
            best_fitness = fitness
            best_counts = counts
            best_chromosome = candidate

        soft_penalty = best_cost - (
            config.hard_faculty_conflict * best_counts.faculty_conflicts
            + config.hard_student_conflict * best_counts.student_conflicts
            + config.hard_room_conflict * best_counts.room_conflicts
            + config.capacity_violation * best_counts.capacity_violations
        )

        history.append(
            BenchmarkIterationPoint(
                iteration=i,
                best_cost=round(best_cost, 2),
                best_fitness=round(best_fitness, 6),
                hard_violations=best_counts.hard_total,
                soft_penalty=round(soft_penalty, 2),
            )
        )

    execution_time = time.time() - start_time
    constraints = ConstraintReport(
        faculty_conflicts=best_counts.faculty_conflicts,
        student_conflicts=best_counts.student_conflicts,
        room_conflicts=best_counts.room_conflicts,
        capacity_violations=best_counts.capacity_violations,
        faculty_gaps=best_counts.faculty_gaps,
        student_gaps=best_counts.student_gaps,
        distribution_penalties=best_counts.distribution_penalty_units,
    )

    soft_total = (
        best_counts.faculty_gaps
        + best_counts.student_gaps
        + best_counts.distribution_penalty_units
    )

    result = AlgorithmBenchmarkResult(
        algorithm_key="random_search",
        algorithm_name="Random Search",
        final_cost=round(best_cost, 2),
        final_fitness=round(best_fitness, 6),
        hard_violations=best_counts.hard_total,
        soft_violations=soft_total,
        execution_time_seconds=round(execution_time, 3),
        converged_zero_hard=best_counts.hard_total == 0,
        history=history,
        constraints=constraints,
    )
    return result, best_chromosome
