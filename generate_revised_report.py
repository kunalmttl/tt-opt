import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def build_revised_document():
    doc = docx.Document()

    # Page Margins: Standard 1.0 inch all around
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)

    # STRICT COLOR & FONT ENFORCEMENT: ONLY BLACK & TIMES NEW ROMAN
    COLOR_BLACK = RGBColor(0, 0, 0)
    FONT_NAME = "Times New Roman"

    normal_style = doc.styles['Normal']
    normal_style.font.name = FONT_NAME
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = COLOR_BLACK
    normal_style.paragraph_format.line_spacing = 1.3
    normal_style.paragraph_format.space_after = Pt(6)

    def set_cell_margins(cell, top=100, bottom=100, left=140, right=140):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(
            f'<w:tcMar {nsdecls("w")}>'
            f'<w:top w:w="{top}" w:type="dxa"/>'
            f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
            f'<w:left w:w="{left}" w:type="dxa"/>'
            f'<w:right w:w="{right}" w:type="dxa"/>'
            f'</w:tcMar>'
        )
        tcPr.append(tcMar)

    def set_cell_borders(cell, top="single", bottom="single", left="none", right="none", sz="8", color="000000"):
        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>'
            f'<w:top w:val="{top}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:left w:val="{left}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:bottom w:val="{bottom}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'<w:right w:val="{right}" w:sz="{sz}" w:space="0" w:color="{color}"/>'
            f'</w:tcBorders>'
        )
        tcPr.append(borders)

    def add_p(text="", align=WD_ALIGN_PARAGRAPH.LEFT, space_before=0, space_after=6, bold=False, italic=False, size=12):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.3
        if text:
            r = p.add_run(text)
            r.font.name = FONT_NAME
            r.font.size = Pt(size)
            r.font.color.rgb = COLOR_BLACK
            r.bold = bold
            r.italic = italic
        return p

    def add_h1(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(20)
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = FONT_NAME
        r.font.size = Pt(16)
        r.font.bold = True
        r.font.color.rgb = COLOR_BLACK
        return p

    def add_h2(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = FONT_NAME
        r.font.size = Pt(13.5)
        r.font.bold = True
        r.font.color.rgb = COLOR_BLACK
        return p

    def add_h3(text):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = FONT_NAME
        r.font.size = Pt(12)
        r.font.bold = True
        r.font.color.rgb = COLOR_BLACK
        return p

    def add_image_with_caption(img_path, caption_text, width=Inches(5.8)):
        if os.path.exists(img_path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(12)
            p_img.paragraph_format.space_after = Pt(4)
            p_img.paragraph_format.keep_with_next = True
            run_img = p_img.add_run()
            run_img.add_picture(img_path, width=width)

            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_before = Pt(2)
            p_cap.paragraph_format.space_after = Pt(14)
            r_cap = p_cap.add_run(caption_text)
            r_cap.font.name = FONT_NAME
            r_cap.font.size = Pt(10)
            r_cap.font.italic = True
            r_cap.font.color.rgb = COLOR_BLACK
        else:
            print(f"Warning: Image not found: {img_path}")

    # =========================================================================
    # FRONT COVER / IDENTIFICATION HEADER
    # =========================================================================
    add_p("PUNJAB ENGINEERING COLLEGE, CHANDIGARH", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=16, space_after=4, bold=True, size=14)
    add_p("(Deemed to be University) • Sector 12, Chandigarh", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12, italic=True, size=11)
    add_p("DEPARTMENT OF ELECTRICAL ENGINEERING", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=20, bold=True, size=12)

    add_p("―" * 34, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=20)

    add_p("TIMETABLE OPTIMIZER", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=10, space_after=6, bold=True, size=24)
    add_p("REVISED TECHNICAL CHAPTERS REPORT (ADDENDUM)\nRigorous Mathematical Modeling, First-Principles Implementation & Visual Verification",
          align=WD_ALIGN_PARAGRAPH.CENTER, space_after=24, italic=True, size=12.5)

    add_p("Course: Optimization Techniques in Electrical Engineering", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=6, bold=True, size=12)
    add_p("Submitted to: Dr. Sandeep Kaur", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=6, size=11.5)
    add_p("Submitted by: Kunal Mittal (SID: 23104066) & Asmit Malhotra (SID: 23104036)", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=24, bold=True, size=11.5)

    add_p("Notice: This targeted document contains the revised and expanded Chapters 2, 3, and 4. It provides the complete mathematical formulations, bitwise data structures, and live localhost interface screenshots to allow any reader to understand every mechanism and replicate the project completely from scratch.",
          align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_before=12, space_after=24, italic=True, size=10.5)

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 2: RIGOROUS MATHEMATICAL MODELING
    # =========================================================================
    add_h1("Chapter 2: Problem Modeling & Rigorous Mathematical Formulation")
    
    add_p(
        "To enable a layman or engineer to reconstruct this optimization system from scratch, we establish the full formal "
        "mathematical model of the University Course Timetabling Problem. Timetabling is modeled as a constrained discrete "
        "combinatorial optimization problem over finite discrete sets."
    )

    add_h2("2.1 Formal Sets and Domain Definitions")
    add_p("Let the academic institution's scheduling environment be defined by the following fundamental finite sets:")
    
    add_p("1. Set of Subjects / Courses: S = {S₁, S₂, ..., S|S|}, where each subject Sᵢ has a required weekly lecture frequency nᵢ ∈ ℕ, an expected student enrollment strength, and an optional room type preference.")
    add_p("2. Set of Faculty / Instructors: F = {F₁, F₂, ..., F|F|}, where Fⱼ denotes an individual professor or teaching assistant.")
    add_p("3. Set of Student Cohorts / Batches: B = {B₁, B₂, ..., B|B|}, where Bₖ represents a unique group of students who attend common lectures together, with batch headcount Size(Bₖ) ∈ ℕ.")
    add_p("4. Set of Classrooms and Laboratories: R = {R₁, R₂, ..., R|R|}, where each venue Rₘ has a designated seating capacity Cap(Rₘ) ∈ ℕ and room classification Type(Rₘ) ∈ {Lecture, Lab, Seminar}.")
    add_p("5. Set of Academic Weekdays: D = {Mon, Tue, Wed, Thu, Fri}, with cardinality |D| = 5.")
    add_p("6. Set of Daily Teaching Periods: P = {1, 2, 3, 4, 5, 6, 7, 8}, representing the eight 60-minute instructional periods from 8:00 AM to 5:00 PM.")
    add_p("7. Universal Lunch Period: Fixed between Period 5 (ending at 1:00 PM) and Period 6 (beginning at 2:00 PM).")

    add_h2("2.2 Unfolding Required Sessions and Gene Space Representation")
    add_p(
        "The total number of 1-hour instructional events that must be scheduled across the week is the sum of weekly frequencies "
        "of all curriculum courses. We denote this integer as the Chromosome Length L:"
    )

    add_p("L = ∑ (i = 1 to |S|) nᵢ", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True)

    add_p(
        "For example, in a curriculum requiring 30 subjects with an average of 2 sessions per week, L = 60 required sessions. "
        "Each session k ∈ {1, 2, ..., L} represents a discrete atomic class that must be assigned a venue and time slot."
    )
    add_p(
        "A Gene gₖ is formally defined as an ordered 6-tuple:\n"
        "   gₖ = (sₖ, fₖ, bₖ, rₖ, dₖ, pₖ)\n"
        "where:\n"
        "• sₖ ∈ S, fₖ ∈ F, bₖ ∈ B are invariant curriculum parameters (fixed inputs that cannot be altered).\n"
        "• rₖ ∈ R, dₖ ∈ D, pₖ ∈ P are optimization decision variables assigned by the Genetic Algorithm."
    )
    add_p(
        "A Chromosome C is an ordered vector of all L genes:\n"
        "   C = [g₁, g₂, ..., gₗ] ∈ Ω\n"
        "The complete combinatorial search space Ω has cardinality:\n"
        "   |Ω| = (|R| × |D| × |P|)^L = (|R| × 5 × 8)^L = (40 · |R|)^L candidate solutions."
    )

    add_h2("2.3 Mathematical Indicator Formulation for Hard Constraints")
    add_p(
        "Let 𝕀(·) be the indicator function returning 1 if the enclosed predicate is true, and 0 otherwise. "
        "A feasible timetable must strictly evaluate all four hard constraints to zero:"
    )

    add_p(
        "1. Faculty Non-Collision Constraint:\n"
        "No professor F can be scheduled to teach two distinct classes at the exact same day and period:\n"
        "   V_faculty(C) = ∑ (1 ≤ j < k ≤ L) 𝕀(fⱼ = fₖ) · 𝕀(dⱼ = dₖ) · 𝕀(pⱼ = pₖ)"
    )

    add_p(
        "2. Student Batch Non-Collision Constraint:\n"
        "No student cohort B can be scheduled to attend two simultaneous classes:\n"
        "   V_batch(C) = ∑ (1 ≤ j < k ≤ L) 𝕀(bⱼ = bₖ) · 𝕀(dⱼ = dₖ) · 𝕀(pⱼ = pₖ)"
    )

    add_p(
        "3. Room Non-Collision Constraint:\n"
        "No physical room R can host more than one instructional session simultaneously:\n"
        "   V_room(C) = ∑ (1 ≤ j < k ≤ L) 𝕀(rⱼ = rₖ) · 𝕀(dⱼ = dₖ) · 𝕀(pⱼ = pₖ)"
    )

    add_p(
        "4. Room Seating Capacity Sufficiency Constraint:\n"
        "Every assigned classroom must possess sufficient seating capacity to seat the attending student batch:\n"
        "   V_capacity(C) = ∑ (k = 1 to L) 𝕀(Cap(rₖ) < Size(bₖ))"
    )

    add_p(
        "Total Hard Constraint Violations H(C) is the unweighted sum of all physical clashes:\n"
        "   H(C) = V_faculty(C) + V_batch(C) + V_room(C) + V_capacity(C)",
        align=WD_ALIGN_PARAGRAPH.CENTER, bold=True
    )

    add_h2("2.4 Mathematical Formulation for Soft Constraints")
    add_p(
        "Soft constraints quantify academic comfort and pedagogical quality. While violating a soft constraint does not render "
        "the timetable physically impossible, minimizing them produces a highly desirable, compact, and fair schedule:"
    )

    add_p(
        "1. Faculty Daily Waiting Gaps:\n"
        "For any professor F on day D, let P(F, D) = {pₖ | fₖ = F, dₖ = D} be the set of periods they teach. If |P(F, D)| ≥ 2, "
        "the daily waiting gap is the number of empty periods between their earliest and latest lectures:\n"
        "   Gap(F, D) = (max P(F, D) - min P(F, D) + 1) - |P(F, D)|\n"
        "Total Faculty Waiting Gaps: G_faculty(C) = ∑ (F ∈ F) ∑ (D ∈ D) Gap(F, D)"
    )

    add_p(
        "2. Student Batch Daily Waiting Gaps:\n"
        "Similarly, for student batch B on day D, with period set P(B, D) = {pₖ | bₖ = B, dₖ = D}:\n"
        "   Gap(B, D) = (max P(B, D) - min P(B, D) + 1) - |P(B, D)|\n"
        "Total Student Waiting Gaps: G_batch(C) = ∑ (B ∈ B) ∑ (D ∈ D) Gap(B, D)"
    )

    add_p(
        "3. Subject Session Day-Clustering Penalty:\n"
        "To prevent cramming multiple lectures of the same course into a single day, let N(S, D) = ∑ (k = 1 to L) 𝕀(sₖ = S ∧ dₖ = D). "
        "If a course appears more than once on day D, excess occurrences are penalized:\n"
        "   D_clustering(C) = ∑ (S ∈ S) ∑ (D ∈ D) max(0, N(S, D) - 1)"
    )

    add_h2("2.5 The Objective Penalty Cost and Reciprocal Fitness Formulations")
    add_p(
        "We combine hard and soft constraints into a single scalar Objective Penalty Function using a weighted sum approach. "
        "To ensure that physical feasibility strictly dominates human preference, hard violations are assigned a severe penalty "
        "weight of W_hard = 1000, while soft weights are set to w_f = 10, w_b = 5, and w_d = 15:"
    )

    add_p(
        "Total Cost(C) = 1000 · H(C) + 10 · G_faculty(C) + 5 · G_batch(C) + 15 · D_clustering(C)",
        align=WD_ALIGN_PARAGRAPH.CENTER, bold=True
    )

    add_p(
        "Because Genetic Algorithms operate by maximizing fitness rather than minimizing cost, the cost is transformed into "
        "a normalized fitness score Fitness(C) ∈ (0, 1] through the reciprocal mapping:"
    )

    add_p(
        "Fitness(C) = 1.0 / (1.0 + Total Cost(C))",
        align=WD_ALIGN_PARAGRAPH.CENTER, bold=True
    )

    add_p(
        "Mathematical Properties of Fitness(C):\n"
        "• Strict Monotonicity: For any two timetables C₁ and C₂, Cost(C₁) < Cost(C₂) ⇔ Fitness(C₁) > Fitness(C₂).\n"
        "• Bounded Range: As Cost → ∞, Fitness → 0. As Cost → 0, Fitness → 1.0.\n"
        "• Global Optimality: Fitness(C) = 1.0000 if and only if H(C) = 0 and all soft waiting gaps are zero."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 3: FIRST-PRINCIPLES ALGORITHMIC IMPLEMENTATION
    # =========================================================================
    add_h1("Chapter 3: The Genetic Algorithm Methodology (First-Principles Implementation)")
    
    add_p(
        "This chapter provides the complete, gap-free algorithmic implementation of our Constraint-Aware Genetic Algorithm. "
        "Every data structure, selection mechanism, recombination step, mutation rule, and local repair routine is described "
        "with concrete code representations so that any programmer can re-implement the entire optimizer."
    )

    add_h2("3.1 In-Memory Data Structures and Gene Memory Layout")
    add_p(
        "In Python, each atomic class session is instantiated as an instance of the Gene class. The complete timetable "
        "is stored as a flat Python list of Gene objects:"
    )
    add_p(
        "class Gene:\n"
        "    subject_id: str   # e.g., 'S01' (Data Structures)\n"
        "    faculty_id: str   # e.g., 'F01' (Dr. A. Sharma)\n"
        "    batch_id:   str   # e.g., 'B1'  (AIML-A)\n"
        "    room_id:    str   # e.g., 'R01' (LT-1)\n"
        "    day:        str   # e.g., 'Mon'\n"
        "    period:     int   # e.g., 2 (09:00 AM - 10:00 AM)\n\n"
        "Chromosome = List[Gene]   # Length L = 60 genes"
    )

    add_h2("3.2 Step 1: Population Initialization")
    add_p(
        "The optimizer maintains a population of N candidate chromosomes (default N = 60). Population initialization uses a "
        "hybrid approach: 80% random initialization and 20% greedy initialization.\n"
        "• In random initialization, for every required session, the room is selected from suitable rooms whose capacity exceeds "
        "the batch student count, and a random day ∈ {Mon..Fri} and period ∈ {1..8} are assigned.\n"
        "• In greedy initialization, sessions belonging to the same student batch are placed into adjacent periods to minimize "
        "initial idle waiting gaps."
    )

    add_h2("3.3 Step 2: O(L) Hash-Map Constraint Evaluation")
    add_p(
        "A naive pairwise comparison of every gene against every other gene requires O(L²) time complexity, which slows down "
        "optimization significantly when evaluating 60 chromosomes over 200 generations (2.4 million evaluations). "
        "Instead, we implemented an optimal O(L) hash-map grouping algorithm:\n"
        "1. Initialize hash tables: slots_faculty = defaultdict(int), slots_room = defaultdict(int), slots_batch = defaultdict(int).\n"
        "2. For each gene g in chromosome: key = (entity_id, g.day, g.period); slots[key] += 1.\n"
        "3. For each count in slots.values(): if count > 1, conflicts += (count - 1).\n"
        "This evaluates the complete set of hard constraints in a single linear pass over the chromosome."
    )

    add_h2("3.4 Step 3: Tournament Selection (k = 3)")
    add_p(
        "To select parent chromosomes for reproduction, Tournament Selection with pool size k = 3 is utilized:\n"
        "1. Randomly draw 3 distinct candidate indices {i₁, i₂, i₃} from the population pool {0, 1, ..., N-1}.\n"
        "2. Retrieve their corresponding fitness scores {Fitness(C_i1), Fitness(C_i2), Fitness(C_i3)}.\n"
        "3. The winner with the highest fitness is selected into the mating pool:\n"
        "   Parent = copy(C_winner), where winner = argmax Fitness(C_ij)."
    )

    add_h2("3.5 Step 4: Two-Point Crossover Recombination")
    add_p(
        "Two winning parents (Parent A and Parent B) are paired. With crossover probability p_c = 0.80, genetic material is exchanged:\n"
        "1. Sample two sorted cut points: p₁, p₂ ∈ {0, 1, ..., L-1} such that p₁ < p₂.\n"
        "2. Child A inherits Parent A's genes from [0 to p₁] and [p₂ to L-1], and inherits Parent B's room/day/period assignments in [p₁ to p₂].\n"
        "3. Child B inherits Parent B's outer segments and Parent A's middle segment.\n"
        "Because gene order is strictly aligned with required syllabus sessions, crossover never duplicates or drops a required course."
    )

    add_h2("3.6 Step 5: Stochastic Mutation & Diversity Injection")
    add_p(
        "To escape local minima, every gene in each offspring undergoes independent stochastic mutation with rate p_m = 0.10:\n"
        "For each gene i ∈ {0, 1, ..., L-1}, roll random probability r ∈ [0, 1]. If r < p_m, execute one of three mutation moves:\n"
        "• Move 'slot': Reassign day = random(Mon..Fri), period = random(1..8).\n"
        "• Move 'room': Reassign room_id = random(R).\n"
        "• Move 'swap': Select another random gene j, and swap (day, period, room) between gene i and gene j."
    )

    add_h2("3.7 Step 6: Constraint-Aware Heuristic Local Repair (The Secret Weapon)")
    add_p(
        "Standard GAs often fail because random crossover and mutation introduce new clashes. Our optimizer incorporates an active "
        "local repair heuristic:\n"
        "1. Identify all genes involved in a hard conflict (double-booked professor, room, or batch, or undersized room capacity).\n"
        "2. For each conflicted gene, scan the 40 time slots (5 days × 8 periods) and available rooms to find an unoccupied slot where "
        "the professor, batch, and room are completely free, and room capacity is sufficient.\n"
        "3. Immediately reassign the conflicting gene to that clash-free slot.\n"
        "This active repair guarantees that hard conflicts collapse to zero in early generations."
    )

    add_h2("3.8 Step 7 & 8: Elitism, Stagnation Detection & Early Termination")
    add_p(
        "• Elitism: The top E = 4 fittest chromosomes from the current generation are directly copied into the next generation without mutation.\n"
        "• Early Stagnation Stop: A counter stagnant_generations tracks consecutive generations without cost improvement. "
        "If hard violations H(C) = 0 and stagnant_generations ≥ 40, the algorithm concludes that the schedule is mathematically optimal "
        "and terminates immediately (e.g. at Generation 54 instead of 200), saving computation."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 4: SYSTEM ARCHITECTURE & INTERFACE WITH SCREENSHOTS
    # =========================================================================
    add_h1("Chapter 4: System Architecture, User Interface & Verified Localhost Screenshots")
    
    add_h2("4.1 Full-Stack Software Architecture")
    add_p(
        "The application is built on a clean, production-grade decoupled full-stack architecture:\n"
        "• Backend Engine: Python 3.10 with FastAPI. Hosts chromosome models, constraint engines, the evolutionary loop, and Server-Sent Events (SSE) streaming.\n"
        "• Frontend Dashboard: Next.js 14 App Router with TypeScript and Tailwind CSS. Implements a responsive, color-blocked matrix layout.\n"
        "• Real-Time Communication: Server-Sent Events push live generation statistics (cost, conflicts, timetable snapshots) directly from Python to React without client polling."
    )

    add_h2("4.2 Comprehensive Visual Evidence & Screen Analysis (Verified from Localhost)")
    add_p(
        "To verify that the system operates correctly, all interface screenshots were captured live from the running local application "
        "at http://localhost:3000 using Puppeteer with headless Microsoft Edge."
    )

    add_h3("4.2.1 Institutional Scenario Presets & In-App Scenario Editor")
    add_p(
        "Figure 4.1 captures the Scenario Editor drawer. The system provides three pre-configured university scenarios: Fast Interactive Demo "
        "(8 subjects, 6 faculty, 4 rooms), Standard Engineering College (30 subjects, 20 faculty, 10 rooms), and High-Congestion Stress Test "
        "(18 dense subjects competing for 4 rooms). Users can switch scenarios or dynamically edit curriculum sessions, teacher assignments, "
        "and room capacities directly in the UI."
    )

    add_image_with_caption(
        os.path.join(os.getcwd(), "report_images", "01_scenario_editor_drawer.png"),
        "Figure 4.1: Scenario Editor drawer showing university preset selection, curriculum metadata, and room configuration."
    )

    add_h3("4.2.2 Initial State Before Optimization (Unconverged)")
    add_p(
        "Figure 4.2 displays the application interface in its initial state before running evolution. The four metric cards display "
        "initial placeholder values, the GA parameter sliders are configured to default values (Population: 60, Generations: 200, "
        "Mutation Rate: 10%, Crossover Rate: 80%), and the system is ready to launch the evolutionary search."
    )

    add_image_with_caption(
        os.path.join(os.getcwd(), "report_images", "02_initial_state_before_convergence.png"),
        "Figure 4.2: Initial Live Optimizer dashboard before starting evolution, with default parameter sliders."
    )

    add_h3("4.2.3 Final Converged Dashboard & Real-Time Performance")
    add_p(
        "Figure 4.3 captures the Live Optimizer dashboard immediately after evolution completes. Notice the verified results:\n"
        "• Constraint Feasibility Card: Displays '0 conflicts' and 'FEASIBLE OPTIMUM' (zero double-bookings).\n"
        "• Objective Penalty Cost Card: Displays a flawless '0.0' with Soft Gap Cost of 0.\n"
        "• Evolution Progress Card: Displays '54 / 200 gens' — illustrating that early stagnation termination stopped the run at Generation 54.\n"
        "• Fitness & Speed Card: Displays a perfect '1.0000' fitness achieved in a runtime of just 0.78 seconds.\n"
        "• Convergence Chart: Illustrates the objective cost dropping steeply from 105 in Generation 1 down to 0 at Generation 14, and flatlining."
    )

    add_image_with_caption(
        os.path.join(os.getcwd(), "report_images", "03_dashboard_after_convergence.png"),
        "Figure 4.3: Live Optimizer Dashboard after convergence: 0 conflicts, 0.0 cost, 1.0000 fitness in 0.78 seconds."
    )

    add_h3("4.2.4 Final Generated Symmetrical Timetable Matrix")
    add_p(
        "Figure 4.4 captures the populated Weekly Class Schedule Matrix. The grid organizes classes across Monday to Friday (rows) "
        "and Periods 1 to 8 (columns). Notice the dedicated universal lunch break column between 1:00 PM and 2:00 PM. Each scheduled "
        "card clearly shows the subject title, assigned professor, student batch, and room number with zero overlaps."
    )

    add_image_with_caption(
        os.path.join(os.getcwd(), "report_images", "04_final_timetable_after_convergence.png"),
        "Figure 4.4: Symmetrical Weekly Timetable Grid across 8 periods with dedicated universal lunch break (1:00 PM – 2:00 PM)."
    )

    add_h3("4.2.5 Operator Visualizer Pipeline & Heuristic Repair Proof")
    add_p(
        "Figure 4.5 shows the Operator Visualizer tab, demonstrating the 6-stage educational pipeline and the gene schema tuple "
        "g = (Subject, Faculty, Batch, Room, Day, Period) alongside initial unoptimized chromosome samples."
    )

    add_image_with_caption(
        os.path.join(os.getcwd(), "report_images", "05_visualizer_encoding_initial_sample.png"),
        "Figure 4.5: Operator Visualizer interface demonstrating problem modeling, gene schemas, and chromosome samples."
    )

    add_p(
        "Figure 4.6 captures Stage 5 (Constraint Repair) inside the visualizer. It provides empirical proof of the heuristic repair pass: "
        "pre-repair hard conflicts (8 clashes) are systematically resolved to zero post-repair conflicts, showing the exact number of "
        "repaired gene positions reassigned to vacant slots."
    )

    add_image_with_caption(
        os.path.join(os.getcwd(), "report_images", "06_visualizer_constraint_repair_before_after.png"),
        "Figure 4.6: Stage 5 Heuristic Repair Pass demonstrating pre-repair conflicts dropping from 8 to zero post-repair clashes."
    )

    output_path = os.path.join(os.getcwd(), "Timetable_Optimizer_Revised_Chapters_2_3_4.docx")
    doc.save(output_path)
    print(f"Revised report successfully created at: {output_path}")

if __name__ == "__main__":
    build_revised_document()
