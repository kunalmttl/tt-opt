export interface Subject {
  subject_id: string;
  name: string;
  faculty_id: string;
  batch_id: string;
  sessions_per_week: number;
  expected_students: number;
  preferred_room_type?: string | null;
}

export interface Faculty {
  faculty_id: string;
  name: string;
  department: string;
}

export interface Room {
  room_id: string;
  room_number: string;
  capacity: number;
  room_type: string;
}

export interface Batch {
  batch_id: string;
  name: string;
  student_count: number;
}

export interface DatasetInput {
  subjects: Subject[];
  faculty: Faculty[];
  rooms: Room[];
  batches: Batch[];
  days: string[];
  periods_per_day: number;
}

export interface GAConfig {
  population_size: number;
  generations: number;
  mutation_rate: number;
  crossover_rate: number;
  tournament_size: number;
  elite_count: number;
  stagnation_limit?: number | null;
  random_seed?: number | null;
  adaptive_mutation?: boolean;
  diversity_injection?: boolean;
  swap_mutation_prob?: number;
  local_search_enabled?: boolean;
  greedy_init_fraction?: number;
}

export interface GeneOut {
  subject_id: string;
  subject_name: string;
  faculty_id: string;
  faculty_name: string;
  batch_id: string;
  batch_name: string;
  room_id: string;
  room_number: string;
  day: string;
  period: number;
}

export interface GenerationStat {
  generation: number;
  best_fitness: number;
  avg_fitness: number;
  best_cost: number;
  hard_violations: number;
  soft_penalty: number;
  faculty_conflicts?: number;
  student_conflicts?: number;
  room_conflicts?: number;
  capacity_violations?: number;
}

export interface ConstraintReport {
  faculty_conflicts: number;
  student_conflicts: number;
  room_conflicts: number;
  capacity_violations: number;
  faculty_gaps: number;
  student_gaps: number;
  distribution_penalties: number;
}

export interface StreamGenerationEvent {
  type: "generation";
  generation: number;
  best_fitness: number;
  avg_fitness: number;
  best_cost: number;
  hard_violations: number;
  soft_penalty: number;
  faculty_conflicts: number;
  student_conflicts: number;
  room_conflicts: number;
  capacity_violations: number;
  converged_early?: boolean;
  timetable?: GeneOut[];
}

export interface StreamCompleteEvent {
  type: "complete";
  generations_executed: number;
  execution_time_seconds: number;
  final_cost: number;
  final_fitness: number;
  converged_early: boolean;
  constraints: ConstraintReport;
  timetable: GeneOut[];
}

export type StreamEvent = StreamGenerationEvent | StreamCompleteEvent | { type: "error"; message: string };

export interface ScenarioMeta {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  num_subjects: number;
  num_faculty: number;
  num_rooms: number;
  num_batches: number;
}

export interface ScenarioPreset {
  metadata: ScenarioMeta;
  dataset: DatasetInput;
}

export interface BenchmarkIterationPoint {
  iteration: number;
  best_cost: number;
  best_fitness: number;
  hard_violations: number;
  soft_penalty: number;
}

export interface AlgorithmBenchmarkResult {
  algorithm_key: string;
  algorithm_name: string;
  final_cost: number;
  final_fitness: number;
  hard_violations: number;
  soft_violations: number;
  execution_time_seconds: number;
  converged_zero_hard: boolean;
  history: BenchmarkIterationPoint[];
  constraints: ConstraintReport;
}

export interface BenchmarkResponse {
  results: AlgorithmBenchmarkResult[];
  winner_algorithm: string;
  summary: string;
}

export interface ChromosomeSnapshot {
  genes: GeneOut[];
  cost: number;
  fitness: number;
  hard_violations: number;
  soft_violations: number;
}

export interface SelectionVisualizer {
  candidates: ChromosomeSnapshot[];
  winner_index: number;
}

export interface CrossoverVisualizer {
  parent_a: ChromosomeSnapshot;
  parent_b: ChromosomeSnapshot;
  point_1: number;
  point_2: number;
  child_a: ChromosomeSnapshot;
  child_b: ChromosomeSnapshot;
}

export interface MutationVisualizer {
  before: ChromosomeSnapshot;
  after: ChromosomeSnapshot;
  mutated_gene_indices: number[];
}

export interface RepairVisualizer {
  before: ChromosomeSnapshot;
  after: ChromosomeSnapshot;
  repaired_gene_indices: number[];
  conflicts_resolved: number;
}

export interface VisualizerStepResponse {
  selection: SelectionVisualizer;
  crossover: CrossoverVisualizer;
  mutation: MutationVisualizer;
  repair: RepairVisualizer;
}
