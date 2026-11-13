# Project Context: University Timetable Optimizer

## 1. Project Overview & Academic Objective
* **Course:** Optimization Techniques
* **Problem Domain:** University Course Timetabling Problem (UCTP) — an NP-hard discrete combinatorial optimization problem.
* **Goal:** Design, implement, and present an explainable, interactive, and visually stunning Genetic Algorithm (GA) system that solves university timetabling while demonstrably outperforming baseline heuristics.
* **Core Philosophy:** Academic rigor meets modern, premium software engineering. The system must be readily explainable in a course viva, visually clear to professors and evaluators, and backed by solid optimization theory.

---

## 2. Core Architecture & Modern Tech Stack

### 2.1 Backend (Python Optimization Engine & API)
* **Language & Runtime:** Python 3.10+
* **Web Framework:** FastAPI (asynchronous REST API + SSE / WebSocket streaming)
* **Data Validation:** Pydantic v2 (strict typed schemas for genes, constraints, requests)
* **Mathematical Operations:** NumPy (efficient matrix and chromosome operations)
* **Algorithms Implemented:**
  1. **Constraint-Aware Genetic Algorithm (GA):** Tournament selection, uniform/multi-point crossover, swap/reassignment mutation, elitism, constraint repair heuristic.
  2. **Baseline Benchmarks (for course comparison):**
     * **Random Search:** Establishes lower-bound benchmark.
     * **Greedy Heuristic:** Fast local assignment baseline.
     * **Simulated Annealing (SA):** Probabilistic metaheuristic comparison showing thermal cooling schedule vs. population-based evolution.

### 2.2 Frontend (Next.js Application)
* **Framework:** Next.js 15 (App Router, Server & Client Components)
* **Language:** TypeScript (strict mode)
* **Styling & UI:** Tailwind CSS + `shadcn/ui` (Radix UI primitives)
* **Icons:** `lucide-react`
* **Animations & Micro-interactions:** `framer-motion` (smooth state transitions, gene swapping animations)
* **Charts & Analytics:** `recharts` (real-time fitness convergence curves, hard/soft violation breakdown, comparative bar/line charts)

### 2.3 Frontend UI/UX Design System (Minimalist, Aesthetic, Spacious)
* **Visual Philosophy:** Clean, editorial minimalism with a focus on academic clarity, sophistication, and breathability.
* **Layout & Spacing:**
  * **Generous Whitespace:** Ample padding (`p-6` to `p-10`) and large component gaps (`gap-8` to `gap-12`) to prevent cognitive overload.
  * **Card Architecture:** Soft, flat borders (`border-neutral-200/80` / `border-neutral-800/80`), subtle flat backgrounds, and rounded corners (`rounded-xl` / `rounded-2xl`) without heavy drop-shadows.
  * **Readable Timetable Grid:** Spacious time-slot blocks with generous inner padding, avoiding dense, cramped Excel-like tables.
* **Color Palette:**
  * **Base Palette:** Crisp neutral monochrome (Zinc/Slate: pure whites `#FFFFFF`, deep charcoal `#09090B`, slate greys `#F4F4F5`, `#71717A`).
  * **Flat Accent Tones:** Muted, purposeful tones rather than bright/neon hues:
    * Primary Action / Optimum: Muted Indigo / Slate `#4F46E5` or `#18181B`.
    * Hard Violation / Alert: Muted Rose / Coral `#E11D48` or `#F43F5E`.
    * Soft Warning: Muted Amber `#D97706`.
    * Success / Feasible: Muted Emerald `#059669`.
  * **No Clutter:** Flat single-tone surfaces, subtle tint badges, no gratuitous gradients or busy backgrounds.
* **Typography:**
  * Clean sans-serif (Inter / Geist) with distinct font hierarchy (`tracking-tight` for headers, relaxed leading for descriptions).
  * Monospaced, tabular numbers (`font-mono`) for metrics, generation counters, and fitness values to prevent layout jitter during live streaming.

---

## 3. Key Optimization Techniques & Theoretical Formulations

### 3.1 Chromosome Representation
* **Gene:** Represents an individual class assignment:
  $$\text{Gene} = (\text{Subject ID}, \text{Faculty ID}, \text{Batch ID}, \text{Room ID}, \text{Day}, \text{Period})$$
  *(Note: Subject, Faculty, and Batch are fixed requirements from curriculum; Room, Day, and Period form the decision variables).*
* **Chromosome:** Complete candidate timetable containing $N$ genes across all required weekly sessions.
* **Population:** A set of $P$ chromosomes evolving generation by generation.

### 3.2 Constraint Formulation
* **Hard Constraints (Must be zero for feasibility):**
  1. **Faculty Conflict:** No faculty member is scheduled in more than one room at the same time:
     $$\forall f, d, p: \sum \text{Session}(f, d, p) \le 1$$
  2. **Room Conflict:** No room is occupied by more than one class at the same time:
     $$\forall r, d, p: \sum \text{Session}(r, d, p) \le 1$$
  3. **Batch Conflict:** No student batch is scheduled for multiple lectures simultaneously:
     $$\forall b, d, p: \sum \text{Session}(b, d, p) \le 1$$
  4. **Room Capacity:** Room capacity must accommodate the batch size:
     $$\text{Capacity}(r) \ge \text{BatchSize}(b)$$

* **Soft Constraints (Optimization Objectives to Minimize):**
  1. **Student Idle Gaps:** Penalize disjoint schedules (e.g., periods 1 and 4 without 2 and 3).
  2. **Faculty Overload / Dispersion:** Limit excessive consecutive lectures or uneven distribution across days.
  3. **Day Load Balance:** Distribute lectures evenly throughout Monday–Friday.

### 3.3 Fitness Function
$$\text{Fitness}(C) = \frac{1}{1 + W_{\text{hard}} \cdot \text{Cost}_{\text{hard}}(C) + W_{\text{soft}} \cdot \text{Cost}_{\text{soft}}(C)}$$
Where $W_{\text{hard}} \gg W_{\text{soft}}$ to guarantee that feasible solutions strictly dominate infeasible ones.

### 3.4 Genetic Operators
1. **Selection:** Elitist Tournament Selection (preserves top $k$ elites directly; runs $k$-way tournaments for mating pool).
2. **Crossover:** Day-level and Uniform Crossover to preserve coherent daily schedules while exchanging assignments.
3. **Mutation:** 
   * **Swap Mutation:** Swaps time slots between two random compatible genes.
   * **Reassignment Mutation:** Assigns a conflicted gene to a vacant slot.
4. **Repair Heuristic:** Greedy conflict-reduction pass on violated genes to accelerate convergence.

---

## 4. Key Features & Deliverables

### 4.1 Real-Time Streaming Optimizer Studio
* Server-Sent Events (SSE) or WebSockets pushing generation-by-generation progress:
  * Current generation, Best Fitness, Average Fitness, Hard Violations, Soft Violations.
* **Interactive Controls:** Play, Pause, Resume, Single-Step Evolution, and Speed Throttle (1x, 2x, 5x, Max).

### 4.2 Interactive Genetic Operator Visualizer (Viva & Presentation Mode)
* Designed specifically for course evaluation and presentations:
  * Visual side-by-side view of Parent A and Parent B chromosomes.
  * Animated crossover operation showing genetic material exchange.
  * Highlighted mutation event displaying slot reassignment.
  * Before-and-after constraint violation indicator demonstrating the repair heuristic.

### 4.3 Comparative Optimization Benchmark Suite
* Side-by-side run and evaluation of:
  * **Genetic Algorithm (GA)**
  * **Simulated Annealing (SA)**
  * **Greedy Heuristic / Random Search**
* Comparative analytics: Convergence speed, iterations to zero hard violations, total runtime, and final solution quality.

### 4.4 In-App Visual Scenario Editor
* Web-based UI to inspect and modify:
  * **Courses & Subjects:** Credits, weekly sessions.
  * **Faculty:** Available working days, assigned subjects.
  * **Batches:** Student headcount, required courses.
  * **Rooms:** Type (Lab/Lecture hall), seat capacity.
* Save, load, and test different problem complexity levels in real time.

### 4.5 Interactive Timetable Matrix
* High-density, color-coded weekly schedule view (Monday–Friday, Periods 1–6).
* Filter views instantly by:
  * Student Batch
  * Faculty Member
  * Room Location
* Export options: Download CSV, JSON, or printable schedule view.

---

## 5. Development & Migration Roadmap

| Phase | Milestone | Description |
|---|---|---|
| **Phase 1** | **Backend Streamlining & Benchmarks** | Refactor FastAPI backend, implement SSE/WebSocket streaming endpoint, add Simulated Annealing and Greedy baseline algorithms for comparative benchmarking. |
| **Phase 2** | **Next.js 15 Frontend Setup** | Initialize Next.js 15 (App Router), configure Tailwind CSS, Lucide, Framer Motion, and setup shadcn/ui theme. |
| **Phase 3** | **Live Optimizer & Schedule Viewer** | Build the real-time GA runner dashboard with live Recharts fitness curve, play/pause controls, and filterable timetable grid. |
| **Phase 4** | **Genetic Operator Visualizer & Viva Explainer** | Build the step-by-step visual animation for Selection, Crossover, and Mutation to demonstrate GA mechanics clearly in presentations. |
| **Phase 5** | **Visual Scenario Editor & Benchmarks** | Implement the in-app editor for rooms/faculty/courses and the multi-algorithm comparison view. |
| **Phase 6** | **Polish & Documentation** | Final styling, responsive UI polish, and course project presentation notes.
