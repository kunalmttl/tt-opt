from __future__ import annotations
import random
from typing import List, Tuple

from backend.models.schemas import (
    DatasetInput, GAConfig, VisualizerStepRequest, VisualizerStepResponse,
    ChromosomeSnapshot, SelectionVisualizer, CrossoverVisualizer,
    MutationVisualizer, RepairVisualizer
)
from backend.optimizer.chromosome import (
    ProblemContext, Chromosome, create_random_chromosome,
    chromosome_to_timetable
)
from backend.optimizer.fitness import evaluate
from backend.optimizer.operators import repair


def _to_snapshot(
    chromosome: Chromosome,
    ctx: ProblemContext,
    config: GAConfig,
) -> ChromosomeSnapshot:
    cost, fitness, counts = evaluate(chromosome, ctx, config)
    soft_total = counts.faculty_gaps + counts.student_gaps + counts.distribution_penalty_units
    timetable = chromosome_to_timetable(chromosome, ctx)
    return ChromosomeSnapshot(
        genes=timetable,
        cost=round(cost, 2),
        fitness=round(fitness, 6),
        hard_violations=counts.hard_total,
        soft_violations=soft_total,
    )


def generate_visualizer_step(request: VisualizerStepRequest) -> VisualizerStepResponse:
    rng = random.Random(request.random_seed) if request.random_seed is not None else random.Random()
    ctx = ProblemContext.build(request.dataset)
    config = GAConfig()

    pool_size = max(request.tournament_size + 2, 6)
    pool = [create_random_chromosome(ctx, rng) for _ in range(pool_size)]

    tournament_indices = rng.sample(range(pool_size), request.tournament_size)
    candidates = [pool[i] for i in tournament_indices]
    candidate_snapshots = [_to_snapshot(c, ctx, config) for c in candidates]

    winner_index = min(range(len(candidates)), key=lambda i: candidate_snapshots[i].cost)

    parent_a = pool[0]
    parent_b = pool[1]
    n_genes = len(parent_a)

    if n_genes > 3:
        p1 = rng.randint(1, n_genes - 2)
        p2 = rng.randint(p1 + 1, n_genes - 1)
    else:
        p1, p2 = 0, n_genes

    child_a = [
        parent_b[i].copy() if p1 <= i < p2 else parent_a[i].copy()
        for i in range(n_genes)
    ]
    child_b = [
        parent_a[i].copy() if p1 <= i < p2 else parent_b[i].copy()
        for i in range(n_genes)
    ]

    crossover_vis = CrossoverVisualizer(
        parent_a=_to_snapshot(parent_a, ctx, config),
        parent_b=_to_snapshot(parent_b, ctx, config),
        point_1=p1,
        point_2=p2,
        child_a=_to_snapshot(child_a, ctx, config),
        child_b=_to_snapshot(child_b, ctx, config),
    )

    before_mutation = [g.copy() for g in child_a]
    after_mutation = [g.copy() for g in child_a]
    mutated_indices: List[int] = []

    target_mutations = max(1, int(n_genes * request.mutation_rate))
    chosen_genes = rng.sample(range(n_genes), min(target_mutations, n_genes))

    for idx in chosen_genes:
        mutated_indices.append(idx)
        if rng.random() < 0.5 and len(ctx.dataset.days) > 1:
            curr_day = after_mutation[idx].day
            other_days = [d for d in ctx.dataset.days if d != curr_day]
            after_mutation[idx].day = rng.choice(other_days) if other_days else curr_day
            after_mutation[idx].period = rng.randint(1, ctx.dataset.periods_per_day)
        else:
            curr_room = after_mutation[idx].room_id
            other_rooms = [r.room_id for r in ctx.dataset.rooms if r.room_id != curr_room]
            if other_rooms:
                after_mutation[idx].room_id = rng.choice(other_rooms)

    mutation_vis = MutationVisualizer(
        before=_to_snapshot(before_mutation, ctx, config),
        after=_to_snapshot(after_mutation, ctx, config),
        mutated_gene_indices=mutated_indices,
    )

    conflict_chromosome = [g.copy() for g in pool[2]]
    before_repair_snap = _to_snapshot(conflict_chromosome, ctx, config)
    if before_repair_snap.hard_violations == 0 and n_genes >= 2:
        conflict_chromosome[0].day = conflict_chromosome[1].day
        conflict_chromosome[0].period = conflict_chromosome[1].period
        conflict_chromosome[0].room_id = conflict_chromosome[1].room_id
        before_repair_snap = _to_snapshot(conflict_chromosome, ctx, config)

    repaired_chromosome = [g.copy() for g in conflict_chromosome]
    repair(repaired_chromosome, ctx, rng)
    after_repair_snap = _to_snapshot(repaired_chromosome, ctx, config)

    repaired_indices = [
        i for i in range(n_genes)
        if conflict_chromosome[i].day != repaired_chromosome[i].day
        or conflict_chromosome[i].period != repaired_chromosome[i].period
        or conflict_chromosome[i].room_id != repaired_chromosome[i].room_id
    ]

    conflicts_resolved = max(0, before_repair_snap.hard_violations - after_repair_snap.hard_violations)

    repair_vis = RepairVisualizer(
        before=before_repair_snap,
        after=after_repair_snap,
        repaired_gene_indices=repaired_indices,
        conflicts_resolved=conflicts_resolved,
    )

    return VisualizerStepResponse(
        selection=SelectionVisualizer(candidates=candidate_snapshots, winner_index=winner_index),
        crossover=crossover_vis,
        mutation=mutation_vis,
        repair=repair_vis,
    )
