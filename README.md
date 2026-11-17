# Timetable Optimizer

[![Live Vercel App](https://img.shields.io/badge/Vercel-Live%20Deployment-black?style=for-the-badge&logo=vercel)](https://frontend-azure-kappa-xbtipqbzto.vercel.app)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Next.js 14](https://img.shields.io/badge/Next.js-14%20App%20Router-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Python 3.10](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org)

> **Live Production URL:** [https://frontend-azure-kappa-xbtipqbzto.vercel.app](https://frontend-azure-kappa-xbtipqbzto.vercel.app)  
> **Course:** Optimization Techniques  
> **Domain:** Metaheuristic Evolutionary Optimization / Operations Research (NP-Hard Timetabling)

---

## Table of Contents
1. [Project Overview & Motivation](#1-project-overview--motivation)
2. [Academic College Schedule Architecture](#2-academic-college-schedule-architecture)
3. [Mathematical Formulation](#3-mathematical-formulation)
   - [Gene & Chromosome Encoding](#gene--chromosome-encoding)
   - [Hard Constraints (Feasibility)](#hard-constraints-feasibility)
   - [Soft Constraints (Quality & Ergonomics)](#soft-constraints-quality--ergonomics)
   - [Objective Function & Fitness Formulation](#objective-function--fitness-formulation)
4. [The Genetic Algorithm Engine](#4-the-genetic-algorithm-engine)
   - [Evolutionary Flowchart](#evolutionary-flowchart)
   - [Algorithmic Operators Explained](#algorithmic-operators-explained)
5. [End-to-End Operator Visualizer (Educational Suite)](#5-end-to-end-operator-visualizer-educational-suite)
6. [Complete UI Walkthrough & Parameter Sensitivity](#6-complete-ui-walkthrough--parameter-sensitivity)
   - [Metric Cards Breakdown](#metric-cards-breakdown)
   - [Parameter Tuning & Sensitivity Analysis](#parameter-tuning--sensitivity-analysis)
7. [System Architecture & Tech Stack](#7-system-architecture--tech-stack)
8. [Local Installation & Quickstart](#8-local-installation--quickstart)
9. [Deployment Guide](#9-deployment-guide)
10. [Test Suite & Verification](#10-test-suite--verification)

---

## 1. Project Overview & Motivation

University Course Timetabling is a canonical **NP-hard discrete combinatorial optimization problem**. The objective is to assign every required academic teaching session—defined as a tuple of `(Subject, Faculty, Batch)` that must meet $N$ times per week—to an exact spatio-temporal slot:

$$\text{Slot} = (\text{Day}, \text{Period}, \text{Room})$$

As the number of courses, student cohorts, rooms, and professors scales, the combinatorial search space explodes exponentially ($O(D^N \times P^N \times R^N)$), rendering brute-force search mathematically intractable. Deterministic integer linear programming (ILP) approaches also face prohibitive runtime under dense constraint coupling.

**Timetable Optimizer** solves this challenge through a **Constraint-Aware Genetic Algorithm (GA)** implemented from first principles in Python, coupled with a high-performance **FastAPI** backend and an editorial, minimalist **Next.js 14** web application. It features real-time Server-Sent Events (SSE) streaming, interactive parameter sliders, early stagnation convergence detection, and an educational 6-stage operator visualizer.

---

## 2. Academic College Schedule Architecture

The system models a realistic university operating schedule:
* **Operating Hours:** **8:00 AM – 5:00 PM** across Monday through Friday (5 days).
* **Teaching Periods:** 8 active teaching periods per day (each 60 minutes).
* **Universal Lunch Break:** Fixed at **1:00 PM – 2:00 PM** daily for all students and faculty.
* **Period Mapping:**
  * **Morning Block:**
    * Period 1: `08:00 AM – 09:00 AM`
    * Period 2: `09:00 AM – 10:00 AM`
    * Period 3: `10:00 AM – 11:00 AM`
    * Period 4: `11:00 AM – 12:00 PM`
    * Period 5: `12:00 PM – 01:00 PM`
  * **Lunch Break:** `01:00 PM – 02:00 PM` (Universal Pause — no teaching sessions scheduled)
  * **Afternoon Block:**
    * Period 6: `02:00 PM – 03:00 PM`
    * Period 7: `03:00 PM – 04:00 PM`
    * Period 8: `04:00 PM – 05:00 PM`

> **Note on Consecutive Idle Gaps:** Teaching periods are numbered $1 \dots 5$ and $6 \dots 8$. Consecutive classes spanning across lunch ($5 \to 6$) have a numerical difference of $6 - 5 = 1$, mathematically preventing the idle gap penalty from penalizing the mandatory 1-hour lunch break.

---

## 3. Mathematical Formulation

### Gene & Chromosome Encoding

* **Gene ($g$):** Represents an atomic, single 1-hour lecture or lab session:
  $$g = \big(\text{Subject } S, \text{Faculty } F, \text{Batch } B, \text{Room } R, \text{Day } D, \text{Period } P\big)$$
  * $S, F, B$ are **fixed curriculum invariants** (who teaches what to whom).
  * $R \in \mathcal{R}, D \in \{\text{Mon, Tue, Wed, Thu, Fri}\}, P \in \{1 \dots 8\}$ are **decision variables** optimized by the GA.
* **Chromosome ($C$):** A candidate weekly timetable represented as a linear array of $L$ genes:
  $$C = [g_1, g_2, \dots, g_L], \quad \text{where } L = \sum_{i=1}^{|\mathcal{S}|} \text{sessions\_per\_week}(S_i)$$

---

### Hard Constraints (Feasibility)

Hard constraints dictate whether a timetable is physically possible. Any non-zero count marks the schedule as **Infeasible**.

1. **Faculty Conflict ($V_{\text{faculty}}$):** A professor cannot teach multiple classes at the same time:
   $$\forall g_a, g_b \in C \ (a \neq b): \quad (F_a = F_b \land D_a = D_b \land P_a = P_b) \implies \text{Conflict}$$
2. **Student Batch Conflict ($V_{\text{batch}}$):** A student cohort cannot attend two classes simultaneously:
   $$\forall g_a, g_b \in C \ (a \neq b): \quad (B_a = B_b \land D_a = D_b \land P_a = P_b) \implies \text{Conflict}$$
3. **Room Conflict ($V_{\text{room}}$):** A physical room cannot host multiple sessions at the same time:
   $$\forall g_a, g_b \in C \ (a \neq b): \quad (R_a = R_b \land D_a = D_b \land P_a = P_b) \implies \text{Conflict}$$
4. **Room Capacity Violation ($V_{\text{capacity}}$):** A room must have sufficient seating for the assigned batch:
   $$\forall g \in C: \quad \text{Capacity}(R_g) < \text{StudentCount}(B_g) \implies \text{Violation}$$

$$\text{Hard Total } (H) = V_{\text{faculty}} + V_{\text{batch}} + V_{\text{room}} + V_{\text{capacity}}$$

---

### Soft Constraints (Quality & Ergonomics)

Soft constraints evaluate the pedagogical quality, schedule compactness, and student/faculty welfare.

1. **Faculty Idle Gaps ($G_{\text{faculty}}$):** Unproductive idle periods between a professor's first and last lecture on any day:
   $$G = \max\big(0, (\max P - \min P + 1) - |P_{\text{occupied}}|\big)$$
2. **Student Idle Gaps ($G_{\text{batch}}$):** Window hours where students are left waiting on campus between classes.
3. **Session Distribution Penalty ($D_{\text{penalty}}$):** Multiple sessions of the same subject crammed into a single day instead of being spread across the week.

---

### Objective Function & Fitness Formulation

The total objective cost function $f(C)$ penalizes hard violations with a severe weight $W_{\text{hard}} = 1000$:

$$f(C) = 1000 \cdot H + w_f \cdot G_{\text{faculty}} + w_b \cdot G_{\text{batch}} + w_d \cdot D_{\text{penalty}}$$

The **Fitness Function** $F(C)$ maps the cost onto a normalized $[0, 1]$ scale for maximization:

$$F(C) = \frac{1}{1 + f(C)}$$

* When $f(C) \to \infty$ (severe clashes), $F(C) \to 0.0$.
* When $f(C) = 0.0$ (perfect schedule, 0 hard clashes, 0 soft gaps), $F(C) = \mathbf{1.0000}$.

---

## 4. The Genetic Algorithm Engine

### Evolutionary Flowchart

```
┌────────────────────────────────────────────────────────┐
│              Raw University Input Dataset              │
│       (Subjects, Faculty, Batches, Rooms, Hours)       │
└───────────────────────────┬────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│           Initial Population Generation (N=60)         │
│          Random Allocation + Greedy Initialization     │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               │
┌───────────────────────────────┐           │
│  Objective Cost & Fitness Eval│           │
│   Cost = 1000*Hard + Soft     │           │
│   Fitness = 1 / (1 + Cost)    │           │
└───────────────┬───────────────┘           │
                │                           │
                ▼                           │
┌───────────────────────────────┐           │
│   Tournament Selection (k=3)  │           │
│   Pick best of k candidates   │           │
└───────────────┬───────────────┘           │
                │                           │
                ▼                           │
┌───────────────────────────────┐           │
│   Two-Point Crossover (80%)   │           │
│   Swap middle segment [p1:p2] │           │
└───────────────┬───────────────┘           │
                │                           │
                ▼                           │
┌───────────────────────────────┐           │
│     Gene Mutation (10%)       │           │
│     Perturb Day / Period / Rm │           │
└───────────────┬───────────────┘           │
                │                           │
                ▼                           │
┌───────────────────────────────┐           │
│   Heuristic Conflict Repair   │           │
│   Local pass to vacant slots  │           │
└───────────────┬───────────────┘           │
                │                           │
                ▼                           │
┌───────────────────────────────┐           │
│   Elitism (Top 4 Preserved)   │           │
└───────────────┬───────────────┘           │
                │                           │
                ▼                           │
┌───────────────────────────────┐           │
│    Check Stagnation (40 gens) │           │
│    or Max Generations Reached │           │
└───────┬───────────────────────┘           │
        │ No                                │
        └───────────────────────────────────┘
        │ Yes (Converged Early or Complete)
        ▼
┌────────────────────────────────────────────────────────┐
│      Decoded Feasible 8 AM - 5 PM Timetable Grid       │
└────────────────────────────────────────────────────────┘
```

### Algorithmic Operators Explained

1. **Tournament Selection ($k = 3$):**  
   Randomly draws $k$ candidate chromosomes from the population. The candidate with the highest fitness wins and advances to the mating pool. This provides adjustable selection pressure without premature convergence.
2. **Two-Point Crossover ($p_c = 0.8$):**  
   Selects two cut-points $p_1, p_2 \in [0, L]$. Offspring inherit the middle genetic slice $[p_1 : p_2]$ from one parent and outer segments from the other, recombining conflict-free day/room blocks.
3. **Stochastic Mutation ($p_m = 0.1$):**  
   Iterates through genes; with probability $p_m$, mutates the day, period, or room to explore new scheduling avenues.
4. **Heuristic Constraint Repair:**  
   Unlike traditional genetic algorithms that purely penalize infeasible chromosomes, this optimizer executes an active local repair pass: genes with detected faculty or room clashes are moved to unoccupied valid slots.
5. **Elitism ($E = 4$):**  
   Guarantees that the top 4 performing chromosomes survive into the next generation without modification, preventing fitness regression.
6. **Early Stagnation Termination:**  
   If zero hard violations are achieved and the objective cost remains flat for 40 consecutive generations, the engine stops early.

---

## 5. End-to-End Operator Visualizer (Educational Suite)

The application includes an **Operator Visualizer** tab designed for academic presentations and vivas. It breaks down the GA into **6 distinct stages**:

1. **1. Data to Chromosome Encoding:**  
   Shows how raw curriculum inputs (e.g. 3 sessions/week of Data Structures with Dr. A. Sharma) are converted into gene tuples $g = (S, F, B, R, D, P)$.
2. **2. Tournament Selection:**  
   Renders the candidate tournament pool ($k=3$), their costs, fitness scores, and highlights the tournament winner.
3. **3. Two-Point Crossover:**  
   Displays Parent A and Parent B alongside Child A and Child B, highlighting the genetic segment swapped between cut points $p_1$ and $p_2$.
4. **4. Gene Mutation:**  
   Compares the chromosome before and after mutation, listing the exact mutated gene indices in coral highlights.
5. **5. Constraint Repair:**  
   Demonstrates how the heuristic repair pass detects overlaps and resolves hard clashes down to zero.
6. **6. Final Generated Timetable:**  
   Renders the decoded feasible chromosome directly into the symmetric 8:00 AM – 5:00 PM college timetable grid.

---

## 6. Complete UI Walkthrough & Parameter Sensitivity

### Metric Cards Breakdown

* **Constraint Feasibility (`0 conflicts` • `FEASIBLE OPTIMUM`):**  
  Displays the total number of hard clashes. Zero conflicts indicates a 100% physically valid schedule.
* **Objective Penalty Cost (`0.0` • `Soft Gap Cost: 0`):**  
  Shows the total penalty score ($1000 \cdot H + \text{Soft}$). When both hard clashes and idle waiting gaps are zero, cost reaches `0.0`.
* **Evolution Progress (`54 / 200 gens` • `Idle`):**  
  Displays the current generation. Stops early (e.g. at gen 54 instead of 200) due to the 40-generation stagnation limit after finding a perfect timetable at gen 14.
* **Fitness & Speed (`1.0000` • `Runtime: 0.78s`):**  
  Displays normalized fitness ($F = \frac{1}{1 + \text{Cost}}$) and the backend execution time.

---

### Parameter Tuning & Sensitivity Analysis

| Parameter | Default | Lower Value Effect | Higher Value Effect |
| :--- | :---: | :--- | :--- |
| **Population Size** | `60` | Runs faster per generation; lower diversity; risk of getting trapped in local minima in crowded schedules. | Higher genetic diversity; explores wider space; slightly higher CPU time per generation. |
| **Generations** | `200` | Faster total run; may terminate before resolving bottlenecks in congested scenarios. | Gives difficult scenarios more time to converge; bypassed early if perfect score is reached. |
| **Mutation Rate** | `10%` | Population becomes rigid; cannot break out of shared parental clashes. | High values ($>35\%$) act like random search, destroying good building blocks and destabilizing convergence. |
| **Crossover Rate** | `80%` | Offspring are mostly clones; slow discovery of novel schedule structures. | Promotes rapid recombination of conflict-free day/room blocks from fit parents. |
| **Speed Multiplier** | `2x` | Adds a streaming delay so the eye can watch the timetable evolve period by period. | `Max` runs at hardware speed (under 1 second). |

---

## 7. System Architecture & Tech Stack

```
├── backend/                       # Python 3.10 + FastAPI
│   ├── data/sample_data.py        # University presets (8 AM - 5 PM + 1-2 PM Lunch)
│   ├── models/schemas.py          # Strict Pydantic v2 schemas
│   ├── optimizer/
│   │   ├── chromosome.py          # Gene tuple & chromosome data structures
│   │   ├── constraints.py         # Hard & soft constraint detectors
│   │   ├── fitness.py             # Cost function & fitness formulation
│   │   ├── ga.py                  # Core GA loop & SSE generator
│   │   ├── operators.py           # Selection, crossover, mutation, repair
│   │   └── visualizer.py          # Step-by-step visualizer snapshot generator
│   └── main.py                    # FastAPI entrypoint & SSE endpoints
│
├── frontend/                      # Next.js 14 App Router + TypeScript
│   ├── app/
│   │   ├── layout.tsx             # Root layout & app metadata
│   │   ├── page.tsx               # Main dashboard & state orchestrator
│   │   └── globals.css            # Tailwind styling & color system
│   ├── components/
│   │   ├── Navbar.tsx             # Header with scenario indicator & tab switcher
│   │   ├── LiveMetricsCards.tsx   # Color-blocked KPI cards (Coral, Canary, Forest)
│   │   ├── OptimizerControls.tsx  # Playback buttons, speed, & GA sliders
│   │   ├── ConvergenceChart.tsx   # Live Recharts objective cost area chart
│   │   ├── TimetableGrid.tsx      # Symmetrical 8 AM - 5 PM weekly matrix
│   │   ├── VisualizerView.tsx     # 6-stage end-to-end operator visualizer
│   │   └── ScenarioEditorModal.tsx# In-app curriculum, faculty, & room editor
│   ├── lib/api.ts                 # Fetch client & SSE stream reader
│   └── lib/types.ts               # TypeScript interfaces matching Pydantic schemas
```

---

## 8. Local Installation & Quickstart

### Prerequisites
* **Python 3.10+**
* **Node.js 18+** & `npm`
* **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/kunalmttl/tt-opt.git
cd tt-opt
```

### 2. Backend Setup
```powershell
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1    # On Linux/macOS: source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start FastAPI backend
uvicorn backend.main:app --reload --port 8000
```
*Backend API docs will be available at:* `http://localhost:8000/docs`

### 3. Frontend Setup
In a new terminal:
```powershell
cd frontend
npm install
npm run dev
```
*Open your browser at:* `http://localhost:3000`

---

## 9. Deployment Guide

### Deploying the Frontend on Vercel
1. Install Vercel CLI and authenticate:
   ```bash
   npm install -g vercel
   vercel login
   ```
2. Deploy the `frontend/` directory:
   ```bash
   cd frontend
   vercel --prod
   ```
3. Set the environment variable in Vercel:
   `NEXT_PUBLIC_API_URL` = `https://your-backend-service.onrender.com`

### Deploying the Backend on Render / Railway
* The repository includes a `Procfile`:
  ```
  web: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
  ```
* Connect the repository to [Render](https://render.com) as a **Web Service**, set the environment to **Python 3**, and deploy.

---

## 10. Test Suite & Verification

The backend includes a comprehensive pytest test suite covering constraint validation, genetic operators, fitness metrics, and API endpoints:

```powershell
# Run all 29 tests
.\.venv\Scripts\python -m pytest -v
```

```
tests/test_constraints.py .....          [ 17%]
tests/test_enhanced_features.py ......   [ 37%]
tests/test_fitness.py ...                [ 48%]
tests/test_genetic_algorithm.py ........ [100%]
======================= 29 passed in 25.29s =======================
```

---

## License
MIT License. Created for the **Optimization Techniques** course curriculum.
