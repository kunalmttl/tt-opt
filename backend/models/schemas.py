"""Pydantic models for request/response validation."""
from __future__ import annotations
from typing import List, Optional
from pydantic import BaseModel, Field


class Subject(BaseModel):
    subject_id: str
    name: str
    faculty_id: str
    batch_id: str
    sessions_per_week: int = Field(gt=0, le=10)
    expected_students: int = Field(gt=0)
    preferred_room_type: Optional[str] = None


class Faculty(BaseModel):
    faculty_id: str
    name: str
    department: str


class Room(BaseModel):
    room_id: str
    room_number: str
    capacity: int = Field(gt=0)
    room_type: str = "Lecture"


class Batch(BaseModel):
    batch_id: str
    name: str
    student_count: int = Field(gt=0)


class DatasetInput(BaseModel):
    subjects: List[Subject]
    faculty: List[Faculty]
    rooms: List[Room]
    batches: List[Batch]
    days: List[str] = ["Mon", "Tue", "Wed", "Thu", "Fri"]
    periods_per_day: int = Field(default=6, gt=0, le=12)


class GAConfig(BaseModel):
    population_size: int = Field(default=100, ge=10, le=1000)
    generations: int = Field(default=200, ge=1, le=5000)
    mutation_rate: float = Field(default=0.10, ge=0.0, le=1.0)
    crossover_rate: float = Field(default=0.80, ge=0.0, le=1.0)
    tournament_size: int = Field(default=3, ge=2, le=20)
    elite_count: int = Field(default=5, ge=0, le=50)
    stagnation_limit: Optional[int] = Field(default=40, ge=1)
    random_seed: Optional[int] = None

    # --- Phase 1: Premature convergence countermeasures (all off by default) ---

    # Adaptive mutation: ramp mutation rate from min to max as stagnation grows.
    adaptive_mutation: bool = False
    mutation_rate_min: float = Field(default=0.05, ge=0.0, le=1.0)
    mutation_rate_max: float = Field(default=0.40, ge=0.0, le=1.0)

    # Diversity injection: replace worst fraction of population with fresh individuals
    # when stagnation reaches diversity_trigger_gens (keeps elites untouched).
    diversity_injection: bool = False
    diversity_trigger_gens: int = Field(default=15, ge=1)
    diversity_replace_pct: float = Field(default=0.15, ge=0.01, le=0.50)

    # Swap-based mutation: probability of using pure swap mutation instead of the
    # standard multi-move mutation. 0.0 = always use standard (current behaviour).
    swap_mutation_prob: float = Field(default=0.0, ge=0.0, le=1.0)

    # Memetic local search: short hill-climbing pass on top-k individuals each gen.
    local_search_enabled: bool = False
    local_search_top_k: int = Field(default=5, ge=1, le=50)
    local_search_iterations: int = Field(default=10, ge=1, le=200)

    # Greedy constructive initialization: fraction of initial population seeded with
    # a conflict-avoiding, gap-minimizing greedy heuristic. 0.0 = all random.
    greedy_init_fraction: float = Field(default=0.0, ge=0.0, le=1.0)

    # --- Constraint weights ---
    hard_faculty_conflict: float = 1000.0
    hard_student_conflict: float = 1000.0
    hard_room_conflict: float = 1000.0
    capacity_violation: float = 500.0
    faculty_gap: float = 10.0
    student_gap: float = 10.0
    distribution_penalty: float = 5.0


class OptimizeRequest(BaseModel):
    dataset: DatasetInput
    config: GAConfig = GAConfig()


class GeneOut(BaseModel):
    subject_id: str
    subject_name: str
    faculty_id: str
    faculty_name: str
    batch_id: str
    batch_name: str
    room_id: str
    room_number: str
    day: str
    period: int


class GenerationStat(BaseModel):
    generation: int
    best_fitness: float
    avg_fitness: float
    best_cost: float
    hard_violations: int
    soft_penalty: float


class ConstraintReport(BaseModel):
    faculty_conflicts: int
    student_conflicts: int
    room_conflicts: int
    capacity_violations: int
    faculty_gaps: int
    student_gaps: int
    distribution_penalties: int = 0


class InitialMetrics(BaseModel):
    hard_violations: int
    soft_violations: int
    faculty_conflicts: int
    student_conflicts: int
    room_conflicts: int
    capacity_violations: int
    faculty_gaps: int
    student_gaps: int
    distribution_penalties: int = 0
    total_cost: float
    fitness: float


class OptimizeResponse(BaseModel):
    timetable: List[GeneOut]
    history: List[GenerationStat]
    final_cost: float
    final_fitness: float
    constraints: ConstraintReport
    generations_executed: int
    execution_time_seconds: float
    population_size: int
    converged_early: bool
    initial_metrics: Optional[InitialMetrics] = None


class StreamGenerationEvent(BaseModel):
    type: str = "generation"
    generation: int
    best_fitness: float
    avg_fitness: float
    best_cost: float
    hard_violations: int
    soft_penalty: float
    faculty_conflicts: int
    student_conflicts: int
    room_conflicts: int
    capacity_violations: int
    converged_early: bool = False
    timetable: Optional[List[GeneOut]] = None


class StreamCompleteEvent(BaseModel):
    type: str = "complete"
    generations_executed: int
    execution_time_seconds: float
    final_cost: float
    final_fitness: float
    converged_early: bool
    constraints: ConstraintReport
    timetable: List[GeneOut]


class BenchmarkConfig(BaseModel):
    algorithms: List[str] = ["ga", "simulated_annealing", "greedy", "random_search"]
    iterations: int = Field(default=150, ge=10, le=1000)
    population_size: int = Field(default=50, ge=10, le=200)
    sa_initial_temp: float = Field(default=100.0, gt=0.0)
    sa_cooling_rate: float = Field(default=0.95, gt=0.8, lt=1.0)
    random_seed: Optional[int] = 42


class BenchmarkIterationPoint(BaseModel):
    iteration: int
    best_cost: float
    best_fitness: float
    hard_violations: int
    soft_penalty: float


class AlgorithmBenchmarkResult(BaseModel):
    algorithm_key: str
    algorithm_name: str
    final_cost: float
    final_fitness: float
    hard_violations: int
    soft_violations: int
    execution_time_seconds: float
    converged_zero_hard: bool
    history: List[BenchmarkIterationPoint]
    constraints: ConstraintReport


class BenchmarkRequest(BaseModel):
    dataset: DatasetInput
    config: BenchmarkConfig = BenchmarkConfig()


class BenchmarkResponse(BaseModel):
    results: List[AlgorithmBenchmarkResult]
    winner_algorithm: str
    summary: str


class ChromosomeSnapshot(BaseModel):
    genes: List[GeneOut]
    cost: float
    fitness: float
    hard_violations: int
    soft_violations: int


class SelectionVisualizer(BaseModel):
    candidates: List[ChromosomeSnapshot]
    winner_index: int


class CrossoverVisualizer(BaseModel):
    parent_a: ChromosomeSnapshot
    parent_b: ChromosomeSnapshot
    point_1: int
    point_2: int
    child_a: ChromosomeSnapshot
    child_b: ChromosomeSnapshot


class MutationVisualizer(BaseModel):
    before: ChromosomeSnapshot
    after: ChromosomeSnapshot
    mutated_gene_indices: List[int]


class RepairVisualizer(BaseModel):
    before: ChromosomeSnapshot
    after: ChromosomeSnapshot
    repaired_gene_indices: List[int]
    conflicts_resolved: int


class VisualizerStepRequest(BaseModel):
    dataset: DatasetInput
    tournament_size: int = Field(default=3, ge=2, le=10)
    mutation_rate: float = Field(default=0.2, ge=0.01, le=1.0)
    random_seed: Optional[int] = None


class VisualizerStepResponse(BaseModel):
    selection: SelectionVisualizer
    crossover: CrossoverVisualizer
    mutation: MutationVisualizer
    repair: RepairVisualizer


class ScenarioMeta(BaseModel):
    id: str
    name: str
    description: str
    difficulty: str
    num_subjects: int
    num_faculty: int
    num_rooms: int
    num_batches: int


class ScenarioPreset(BaseModel):
    metadata: ScenarioMeta
    dataset: DatasetInput
