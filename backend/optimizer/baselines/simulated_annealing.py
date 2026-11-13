from __future__ import annotations
import math
import random
import time
from typing import List, Tuple

from backend.models.schemas import (
    GAConfig, BenchmarkIterationPoint, ConstraintReport, AlgorithmBenchmarkResult
)
from backend.optimizer.chromosome import (
    ProblemContext, Chromosome, create_random_chromosome
)
from backend.optimizer.fitness import evaluate, ConstraintCounts
from backend.optimizer.operators import swap_mutate, mutate, repair


def run_simulated_annealing(
    ctx: ProblemContext,
    config: GAConfig,
    iterations: int,
    initial_temp: float,
    cooling_rate: float,
    rng: random.Random,
) -> Tuple[AlgorithmBenchmarkResult, Chromosome]:
    start_time = time.time()
    current_chromosome: Chromosome = create_random_chromosome(ctx, rng)
    repair(current_chromosome, ctx, rng)

    current_cost, current_fitness, current_counts = evaluate(current_chromosome, ctx, config)
    best_chromosome = [g.copy() for g in current_chromosome]
    best_cost = current_cost
    best_fitness = current_fitness
    best_counts = current_counts

    temperature = max(1.0, initial_temp)
    history: List[BenchmarkIterationPoint] = []

    for i in range(1, iterations + 1):
        neighbor = [g.copy() for g in current_chromosome]
        if rng.random() < 0.5:
            swap_mutate(neighbor, ctx, mutation_rate=0.15, rng=rng)
        else:
            mutate(neighbor, ctx, mutation_rate=0.15, rng=rng)

        if rng.random() < 0.4:
            repair(neighbor, ctx, rng)

        neighbor_cost, neighbor_fitness, neighbor_counts = evaluate(neighbor, ctx, config)
        delta = neighbor_cost - current_cost

        if delta < 0:
            current_chromosome = neighbor
            current_cost = neighbor_cost
            current_fitness = neighbor_fitness
            current_counts = neighbor_counts
        else:
            acceptance_prob = math.exp(-delta / max(temperature, 1e-4))
            if rng.random() < acceptance_prob:
                current_chromosome = neighbor
                current_cost = neighbor_cost
                current_fitness = neighbor_fitness
                current_counts = neighbor_counts

        if current_cost < best_cost:
            best_cost = current_cost
            best_fitness = current_fitness
            best_counts = current_counts
            best_chromosome = [g.copy() for g in current_chromosome]

        temperature *= cooling_rate

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
        algorithm_key="simulated_annealing",
        algorithm_name="Simulated Annealing",
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
