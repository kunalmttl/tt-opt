import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def create_report():
    doc = docx.Document()
    
    # ---------------- PAGE SETUP (Standard A4 / 1 inch margins) ----------------
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)

    # ---------------- COLOR PALETTE ----------------
    COLOR_PRIMARY = RGBColor(30, 58, 138)     # Deep Navy
    COLOR_SECONDARY = RGBColor(15, 118, 110) # Teal Slate
    COLOR_TEXT = RGBColor(30, 41, 59)        # Slate 800
    COLOR_MUTED = RGBColor(100, 116, 139)    # Slate 500
    
    HEX_HEADER_BG = "1E3A8A"
    HEX_ROW_ALT = "F8FAFC"
    HEX_CALLOUT_BG = "F1F5F9"
    HEX_BORDER = "3B82F6"

    # Base Styles
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = COLOR_TEXT
    normal_style.paragraph_format.line_spacing = 1.2
    normal_style.paragraph_format.space_after = Pt(6)

    def set_cell_background(cell, fill_hex):
        tcPr = cell._tc.get_or_add_tcPr()
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
        tcPr.append(shd)

    def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
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

    def add_callout(title, text, border_color="3B82F6", bg_color="F8FAFC"):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        tbl.autofit = False
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.5)
        set_cell_background(cell, bg_color)
        set_cell_margins(cell, top=120, bottom=120, left=180, right=180)
        
        tcPr = cell._tc.get_or_add_tcPr()
        borders = parse_xml(
            f'<w:tcBorders {nsdecls("w")}>'
            f'<w:top w:val="none"/>'
            f'<w:left w:val="single" w:sz="24" w:space="0" w:color="{border_color}"/>'
            f'<w:bottom w:val="none"/>'
            f'<w:right w:val="none"/>'
            f'</w:tcBorders>'
        )
        tcPr.append(borders)
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        r1 = p.add_run(f"💡 Key Takeaway: {title}\n")
        r1.bold = True
        r1.font.color.rgb = COLOR_PRIMARY
        r1.font.size = Pt(10.5)
        
        r2 = p.add_run(text)
        r2.font.size = Pt(10)
        r2.font.color.rgb = COLOR_TEXT
        
        p_sp = doc.add_paragraph()
        p_sp.paragraph_format.space_before = Pt(0)
        p_sp.paragraph_format.space_after = Pt(4)

    def add_heading_1(text):
        h = doc.add_heading(level=1)
        h.paragraph_format.space_before = Pt(20)
        h.paragraph_format.space_after = Pt(8)
        h.paragraph_format.keep_with_next = True
        r = h.add_run(text)
        r.bold = True
        r.font.name = "Calibri"
        r.font.size = Pt(16)
        r.font.color.rgb = COLOR_PRIMARY
        return h

    def add_heading_2(text):
        h = doc.add_heading(level=2)
        h.paragraph_format.space_before = Pt(14)
        h.paragraph_format.space_after = Pt(6)
        h.paragraph_format.keep_with_next = True
        r = h.add_run(text)
        r.bold = True
        r.font.name = "Calibri"
        r.font.size = Pt(13)
        r.font.color.rgb = COLOR_SECONDARY
        return h

    def add_heading_3(text):
        h = doc.add_heading(level=3)
        h.paragraph_format.space_before = Pt(10)
        h.paragraph_format.space_after = Pt(4)
        h.paragraph_format.keep_with_next = True
        r = h.add_run(text)
        r.bold = True
        r.font.name = "Calibri"
        r.font.size = Pt(11.5)
        r.font.color.rgb = COLOR_TEXT
        return h

    # =========================================================================
    # 1. COVER / TITLE PAGE
    # =========================================================================
    p_title_space = doc.add_paragraph()
    p_title_space.paragraph_format.space_before = Pt(72)

    p_badge = doc.add_paragraph()
    p_badge.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_badge = p_badge.add_run("ACADEMIC PROJECT REPORT  •  OPTIMIZATION TECHNIQUES")
    r_badge.font.size = Pt(10)
    r_badge.font.bold = True
    r_badge.font.color.rgb = COLOR_SECONDARY

    p_main_title = doc.add_paragraph()
    p_main_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_main_title.paragraph_format.space_before = Pt(12)
    p_main_title.paragraph_format.space_after = Pt(8)
    r_main_title = p_main_title.add_run("TIMETABLE OPTIMIZER")
    r_main_title.font.size = Pt(30)
    r_main_title.font.bold = True
    r_main_title.font.color.rgb = COLOR_PRIMARY

    p_sub_title = doc.add_paragraph()
    p_sub_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub_title.paragraph_format.space_after = Pt(24)
    r_sub = p_sub_title.add_run(
        "Intelligent University Course Scheduling Using Constraint-Aware\n"
        "Genetic Algorithms with Real-Time Streaming and Heuristic Repair"
    )
    r_sub.font.size = Pt(13)
    r_sub.font.italic = True
    r_sub.font.color.rgb = COLOR_TEXT

    # Decorative separator bar
    p_line = doc.add_paragraph()
    p_line.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_line = p_line.add_run("―" * 38)
    r_line.font.color.rgb = RGBColor(203, 213, 225)

    p_meta_space = doc.add_paragraph()
    p_meta_space.paragraph_format.space_before = Pt(90)

    # Details Box
    tbl_meta = doc.add_table(rows=4, cols=2)
    tbl_meta.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_meta.autofit = False
    
    meta_info = [
        ("Course / Subject:", "Optimization Techniques (Metaheuristic Optimization)"),
        ("Problem Domain:", "Operations Research / NP-Hard Combinatorial Scheduling"),
        ("Technology Stack:", "Python 3.10 (FastAPI), Next.js 14, TypeScript, Tailwind CSS"),
        ("Live Deployment:", "https://frontend-azure-kappa-xbtipqbzto.vercel.app")
    ]
    for idx, (k, v) in enumerate(meta_info):
        row = tbl_meta.rows[idx]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(2.2)
        c1.width = Inches(4.3)
        set_cell_margins(c0, top=60, bottom=60, left=80, right=80)
        set_cell_margins(c1, top=60, bottom=60, left=80, right=80)
        
        p0 = c0.paragraphs[0]
        p0.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r0 = p0.add_run(k)
        r0.bold = True
        r0.font.size = Pt(10)
        r0.font.color.rgb = COLOR_MUTED
        
        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.LEFT
        r1 = p1.add_run(v)
        r1.font.size = Pt(10)
        r1.font.color.rgb = COLOR_TEXT

    doc.add_page_break()

    # =========================================================================
    # 2. EXECUTIVE SUMMARY / ABSTRACT
    # =========================================================================
    add_heading_1("Executive Summary")
    
    p_abs = doc.add_paragraph(
        "Creating a workable college timetable by hand is one of the most frustrating, time-consuming tasks "
        "faced by university administrations every semester. In any college, dozens of professors, multiple student "
        "batches, and limited lecture halls and laboratories must be scheduled across the week. A single clash—such "
        "as assigning two classes to the same room or double-booking a professor—makes the entire schedule unworkable."
    )
    
    doc.add_paragraph(
        "Mathematically, this challenge belongs to a class of problems known as NP-Hard Combinatorial Optimization. "
        "Because the number of possible schedule combinations is astronomically larger than the number of atoms in the "
        "observable universe, checking every combination one-by-one is impossible. Traditional trial-and-error takes "
        "days of manual effort and frequently results in overlooked clashes."
    )
    
    doc.add_paragraph(
        "This project presents Timetable Optimizer, a software system that automates the entire scheduling "
        "process using a Constraint-Aware Genetic Algorithm (GA). Inspired by natural evolution and 'survival of "
        "the fittest', the algorithm creates an initial pool of random schedules, iteratively evaluates them against "
        "strict college constraints, breeds the best performers using crossover and mutation, and applies an intelligent "
        "heuristic repair pass to instantly eliminate room and teacher overlaps."
    )
    
    doc.add_paragraph(
        "The system models an authentic university operating day from 8:00 AM to 5:00 PM across 8 teaching periods, "
        "featuring a universal lunch pause from 1:00 PM to 2:00 PM. Built on a modern full-stack architecture—combining a "
        "Python FastAPI mathematical engine with a Next.js 14 reactive web dashboard—the application streams the live "
        "evolution of timetables generation-by-generation via Server-Sent Events (SSE). It consistently produces 100% "
        "clash-free, highly ergonomic timetables in less than one second, while offering an interactive 6-stage educational "
        "visualizer to explain every step of the algorithm."
    )

    add_callout(
        "The Core Innovation",
        "Unlike standard genetic algorithms that merely assign penalty points to bad schedules and hope they improve by chance, "
        "our system incorporates an active Heuristic Constraint Repair pass. Conflicting classes are immediately moved to "
        "vacant slots, driving hard conflicts to zero in just a few generations."
    )

    doc.add_page_break()

    # =========================================================================
    # 3. TABLE OF CONTENTS SUMMARY
    # =========================================================================
    add_heading_1("Table of Contents")
    
    toc_items = [
        ("1. Introduction & Background", "Problem context, real-world motivation, and project scope"),
        ("2. Problem Formulation & Constraints", "Lego-brick gene model, hard vs. soft constraints, and fitness math"),
        ("3. The Genetic Algorithm Methodology", "Detailed breakdown of the 8 evolutionary operators and lifecycle"),
        ("4. System Architecture & Tech Stack", "FastAPI streaming backend, Next.js frontend, and visualizer suite"),
        ("5. Experimental Results & Sensitivity", "Performance metrics, slider sensitivity analysis, and automated tests"),
        ("6. Conclusion & Future Roadmap", "Summary of contributions and future enterprise extensions"),
    ]
    
    tbl_toc = doc.add_table(rows=len(toc_items), cols=2)
    tbl_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_toc.autofit = False
    
    for idx, (title, desc) in enumerate(toc_items):
        row = tbl_toc.rows[idx]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(2.8)
        c1.width = Inches(3.7)
        set_cell_background(c0, HEX_ROW_ALT if idx % 2 == 1 else "FFFFFF")
        set_cell_background(c1, HEX_ROW_ALT if idx % 2 == 1 else "FFFFFF")
        set_cell_margins(c0, top=70, bottom=70, left=100, right=100)
        set_cell_margins(c1, top=70, bottom=70, left=100, right=100)
        
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(title)
        r0.bold = True
        r0.font.size = Pt(10)
        r0.font.color.rgb = COLOR_PRIMARY
        
        p1 = c1.paragraphs[0]
        r1 = p1.add_run(desc)
        r1.font.size = Pt(9.5)
        r1.font.color.rgb = COLOR_MUTED

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 1: INTRODUCTION & BACKGROUND
    # =========================================================================
    add_heading_1("Chapter 1: Introduction & Problem Background")
    
    add_heading_2("1.1 The Real-World Timetabling Dilemma")
    doc.add_paragraph(
        "At the start of every academic term, educational institutions face the monumental challenge of constructing "
        "their master timetable. The objective sounds straightforward: ensure every batch of students is taught their "
        "required syllabus subjects by qualified professors in suitable classrooms across the week. In practice, however, "
        "it is a logistical nightmare."
    )
    doc.add_paragraph(
        "Consider a modest engineering college department: 30 distinct courses, 20 professors, 5 batches of students, and "
        "10 classrooms. A professor can only be in one classroom at a time; a room can only hold one class at a time; and "
        "students cannot attend two lectures simultaneously. If a department coordinator assigns 'Database Systems' and "
        "'Computer Networks' to the same lecture hall on Tuesday at 10:00 AM, the timetable is broken. Resolving that clash "
        "by moving one class creates a ripple effect, triggering secondary clashes across other batches and professors."
    )

    add_heading_2("1.2 Why Simple Trial-and-Error Fails: NP-Hardness Explained Simply")
    doc.add_paragraph(
        "Why can't a normal computer program just check every possible arrangement and pick the best one? "
        "To understand why, imagine you have 80 lecture sessions that each need to be placed into one of 40 available "
        "time slots (5 days × 8 periods) and 10 rooms. The total number of ways to assign these sessions exceeds:"
    )
    
    p_math_comb = doc.add_paragraph()
    p_math_comb.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_mc = p_math_comb.add_run("Total Combinations ≈ 400⁸⁰ ≈ 10²⁰⁸ possible timetables")
    r_mc.bold = True
    r_mc.font.size = Pt(11)
    r_mc.font.color.rgb = COLOR_PRIMARY

    doc.add_paragraph(
        "Even the most powerful supercomputer in the world, capable of testing billions of timetables per second, would "
        "take trillions of years to check all possibilities. In computer science, this property is called NP-Hardness. "
        "Exact brute-force search is impossible. Instead, we must use Metaheuristics—smart, guided search algorithms that "
        "explore the space efficiently to find a near-perfect solution in seconds."
    )

    add_heading_2("1.3 College Schedule Architecture (8 AM – 5 PM with Lunch)")
    doc.add_paragraph(
        "To reflect authentic university operations, our application enforces a realistic collegiate schedule:"
    )
    
    # Table of Periods
    tbl_sched = doc.add_table(rows=10, cols=3)
    tbl_sched.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_sched.autofit = False
    
    sched_data = [
        ("Period / Block", "Clock Time", "Academic Purpose"),
        ("Period 1", "08:00 AM – 09:00 AM", "Morning Lecture / Lab Session"),
        ("Period 2", "09:00 AM – 10:00 AM", "Morning Lecture / Lab Session"),
        ("Period 3", "10:00 AM – 11:00 AM", "Morning Lecture / Lab Session"),
        ("Period 4", "11:00 AM – 12:00 PM", "Pre-Noon Lecture"),
        ("Period 5", "12:00 PM – 01:00 PM", "Mid-Day Lecture"),
        ("LUNCH BREAK", "01:00 PM – 02:00 PM", "Universal Lunch Break (Zero classes scheduled)"),
        ("Period 6", "02:00 PM – 03:00 PM", "Afternoon Session"),
        ("Period 7", "03:00 PM – 04:00 PM", "Afternoon Session"),
        ("Period 8", "04:00 PM – 05:00 PM", "Final Afternoon Session"),
    ]
    
    for r_idx, (col0, col1, col2) in enumerate(sched_data):
        row = tbl_sched.rows[r_idx]
        is_hdr = (r_idx == 0)
        is_lunch = ("LUNCH" in col0)
        
        for c_idx, val in enumerate([col0, col1, col2]):
            cell = row.cells[c_idx]
            cell.width = Inches(2.1)
            bg = HEX_HEADER_BG if is_hdr else ("FEF3C7" if is_lunch else (HEX_ROW_ALT if r_idx % 2 == 1 else "FFFFFF"))
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.bold = is_hdr or is_lunch
            r.font.size = Pt(9)
            if is_hdr:
                r.font.color.rgb = RGBColor(255, 255, 255)
            elif is_lunch:
                r.font.color.rgb = RGBColor(180, 83, 9)
            else:
                r.font.color.rgb = COLOR_TEXT

    p_sp = doc.add_paragraph()
    p_sp.paragraph_format.space_before = Pt(4)

    add_callout(
        "Lunch Gap Neutrality",
        "Teaching periods are internally numbered 1 to 5 for morning, and 6 to 8 for afternoon. "
        "A class scheduled in Period 5 followed immediately by a class in Period 6 has a period distance of "
        "6 - 5 = 1. This mathematical formulation ensures that the 1-hour lunch break is recognized as continuous, "
        "preventing the algorithm from falsely penalizing students or teachers for taking their lunch hour!"
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 2: PROBLEM FORMULATION & CONSTRAINTS
    # =========================================================================
    add_heading_1("Chapter 2: Problem Modeling & Mathematical Formulation")
    
    add_heading_2("2.1 The Gene and Chromosome Representation")
    doc.add_paragraph(
        "In Genetic Algorithms, we borrow vocabulary from genetics. To solve a timetable problem, we represent the "
        "entire schedule as a 'Chromosome', which is made up of individual 'Genes' (like beads on a string):"
    )
    
    doc.add_paragraph(
        "1. A Gene is a single 1-hour class session. It is modeled as a 6-tuple:\n"
        "   Gene g = (Subject, Faculty, Batch, Room, Day, Period)\n"
        "   • Fixed Parts (Curriculum Requirements): Subject, Faculty, Batch.\n"
        "   • Variable Parts (To be optimized by GA): Room, Day (Mon–Fri), Period (1–8)."
    )
    doc.add_paragraph(
        "2. A Chromosome is a full candidate timetable. If a college requires 85 total class sessions across the week, "
        "a chromosome is a vector of exactly 85 genes: C = [g₁, g₂, ..., g₈₅]."
    )

    add_heading_2("2.2 Hard Constraints: The Laws of Physics")
    doc.add_paragraph(
        "Hard constraints are mandatory. A single violation means the timetable cannot be implemented in the real world. "
        "Our engine checks four distinct hard constraints:"
    )

    hard_items = [
        ("1. Faculty Conflict", "A professor cannot be in two classrooms at the same time. If Dr. Sharma is scheduled for AIML-A in Room 101 and CSE-B in Room 102 on Monday at 9:00 AM, this is a physical impossibility."),
        ("2. Student Batch Conflict", "A student group cannot attend two lectures simultaneously. Section AIML-A cannot have Operating Systems and Data Structures scheduled at the same period."),
        ("3. Room Conflict", "A single room cannot host multiple lectures at the exact same hour. Two classes assigned to Room LT-1 on Wednesday at 11:00 AM will collide."),
        ("4. Capacity Overflow", "The room capacity must comfortably accommodate the student batch size. Assigning a batch of 60 students to a 35-seat laboratory violates safety and seating constraints.")
    ]
    for name, desc in hard_items:
        p = doc.add_paragraph()
        r_n = p.add_run(f"• {name}: ")
        r_n.bold = True
        r_n.font.color.rgb = RGBColor(220, 38, 38)
        p.add_run(desc)

    add_heading_2("2.3 Soft Constraints: Human Comfort & Ergonomics")
    doc.add_paragraph(
        "Even if a timetable has zero clashes, it might still be terrible for students and faculty. Soft constraints "
        "measure schedule quality and convenience:"
    )
    soft_items = [
        ("1. Faculty Idle Gaps", "Minimizing dead window gaps. A professor who teaches at 8:00 AM and then has to wait on campus until 4:00 PM for their next lecture experiences 7 hours of unproductive idle time."),
        ("2. Student Idle Gaps", "Ensuring compact schedules for students so they are not left stranded between lectures."),
        ("3. Session Distribution", "Ensuring that the 3 or 4 sessions of a subject are spread evenly across different days (e.g., Mon, Wed, Fri) rather than cramming 3 back-to-back lectures into Monday morning.")
    ]
    for name, desc in soft_items:
        p = doc.add_paragraph()
        r_n = p.add_run(f"• {name}: ")
        r_n.bold = True
        r_n.font.color.rgb = COLOR_SECONDARY
        p.add_run(desc)

    add_heading_2("2.4 The Objective Penalty Cost and Fitness Function")
    doc.add_paragraph(
        "To score how 'good' or 'bad' a timetable is, we use an Objective Cost Function. Hard violations receive a massive "
        "penalty weight (1000 points each) so that the algorithm always prioritizes physical feasibility over minor preferences:"
    )

    p_cost = doc.add_paragraph()
    p_cost.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_cf = p_cost.add_run("Total Cost = (1000 × Hard Violations) + (10 × Faculty Gaps) + (5 × Student Gaps) + (15 × Clustering)")
    r_cf.bold = True
    r_cf.font.size = Pt(10.5)
    r_cf.font.color.rgb = COLOR_PRIMARY

    doc.add_paragraph(
        "In Genetic Algorithms, we want to maximize 'Fitness' rather than minimize cost. We convert cost into a normalized "
        "fitness score using the mathematical reciprocal formulation:"
    )

    p_fit = doc.add_paragraph()
    p_fit.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_ff = p_fit.add_run("Fitness = 1.0 / (1.0 + Total Cost)")
    r_ff.bold = True
    r_ff.font.size = Pt(11)
    r_ff.font.color.rgb = COLOR_PRIMARY

    doc.add_paragraph(
        "• If a timetable has 5 hard conflicts: Cost = 5000+ → Fitness ≈ 0.0002 (Very low fitness, discarded quickly).\n"
        "• If a timetable has 0 conflicts and 0 gaps: Cost = 0.0 → Fitness = 1.0 / (1.0 + 0.0) = 1.0000 (Mathematical perfection!)."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 3: THE GENETIC ALGORITHM METHODOLOGY
    # =========================================================================
    add_heading_1("Chapter 3: The Genetic Algorithm Methodology")
    
    doc.add_paragraph(
        "Genetic Algorithms simulate Charles Darwin's theory of natural selection. In nature, organisms that are best adapted "
        "to their environment survive, mate, and pass their favorable traits to the next generation. Over time, the population "
        "becomes stronger. Our timetable optimizer follows this exact biological lifecycle through 8 clear steps:"
    )

    steps = [
        ("Step 1: Initial Population Generation", 
         "The algorithm starts by creating a population of 60 candidate timetables. Each candidate assigns random days, "
         "periods, and rooms to the required syllabus sessions. At this early stage, almost every candidate is full of conflicts."),
        
        ("Step 2: Fitness Evaluation",
         "Every candidate in the population is checked against the constraint engine. The engine calculates hard violations, "
         "soft waiting gaps, total penalty cost, and assigns a fitness score from 0.0 to 1.0."),
        
        ("Step 3: Tournament Selection (k = 3)",
         "To choose which timetables get to 'reproduce', we run a tournament. Three random candidates are selected from the pool. "
         "They compete, and the candidate with the highest fitness wins the right to become a parent. This maintains healthy "
         "competition without completely killing off genetic variety."),
        
        ("Step 4: Two-Point Crossover (Recombination)",
         "Two winning parent timetables are combined to create two new children. The algorithm chooses two cut-points, swaps "
         "the middle slice of lectures between the parents, and creates offspring that inherit the best conflict-free morning "
         "and afternoon blocks from both parents."),
        
        ("Step 5: Stochastic Mutation (Diversity Injection)",
         "With a 10% probability, random class sessions in the child timetables have their day, period, or room mutated. "
         "This introduces fresh combinations and prevents the algorithm from getting stuck in dead-end traps (local minima)."),
        
        ("Step 6: Heuristic Constraint Repair (The Secret Weapon)",
         "Standard GAs often struggle because random mutations create new room or faculty overlaps. Our optimizer performs an "
         "active local repair pass: whenever a conflict is detected in an offspring, the conflicting lecture is immediately shifted "
         "to an unoccupied, valid time slot. This drives hard conflicts to zero dramatically faster."),
        
        ("Step 7: Elitism",
         "To guarantee that the algorithm never loses its best discovery, the top 4 highest-performing timetables of each generation "
         "are automatically copied into the next generation without modification."),
        
        ("Step 8: Early Stagnation Termination",
         "If the optimizer reaches zero hard violations and the schedule score remains flat for 40 consecutive generations, "
         "it concludes that mathematical perfection has been achieved and stops early to save computational time.")
    ]

    for title, desc in steps:
        add_heading_3(title)
        doc.add_paragraph(desc)

    add_callout(
        "Why Heuristic Repair is Critical",
        "In pure random genetic algorithms, breeding two good parents can accidentally produce children with clashes. "
        "By pairing the GA with an active Heuristic Repair step, we transform a blind evolutionary search into an "
        "intelligent, self-healing scheduling engine."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 4: SOFTWARE ARCHITECTURE & IMPLEMENTATION
    # =========================================================================
    add_heading_1("Chapter 4: Software Architecture & Implementation")
    
    add_heading_2("4.1 Full-Stack System Design")
    doc.add_paragraph(
        "The project is architected as a clean, decoupled full-stack web application designed for high performance "
        "and real-time interactivity:"
    )

    arch_points = [
        ("Backend (Python 3.10 + FastAPI):", "Houses the mathematical chromosome models, constraint detectors, GA evolutionary loop, and heuristic repair algorithms. It exposes REST and Server-Sent Events (SSE) streaming endpoints."),
        ("Frontend (Next.js 14 + TypeScript):", "A modern, reactive dashboard using React App Router, Tailwind CSS, and Recharts. It streams live generation updates and renders a symmetrical 8 AM – 5 PM timetable grid."),
        ("Real-Time Streaming Protocol (SSE):", "Instead of waiting for the entire optimization to finish and returning a static JSON response, the backend pushes live generation statistics (best cost, current fitness, active conflicts) in real-time over an open HTTP stream.")
    ]
    for title, desc in arch_points:
        p = doc.add_paragraph()
        r_t = p.add_run(f"• {title} ")
        r_t.bold = True
        r_t.font.color.rgb = COLOR_PRIMARY
        p.add_run(desc)

    add_heading_2("4.2 The 6-Stage Operator Visualizer (Educational Viva Suite)")
    doc.add_paragraph(
        "A standout feature of Timetable Optimizer is the dedicated Operator Visualizer tab, specifically engineered "
        "to demonstrate every micro-step of the genetic algorithm during academic vivas and presentations:"
    )

    vis_steps = [
        ("Stage 1: Data to Chromosome Encoding", "Shows how raw curriculum inputs (e.g. 3 sessions/week of Artificial Intelligence with Dr. A. Sharma) are converted into discrete gene tuples g = (S, F, B, R, D, P)."),
        ("Stage 2: Tournament Selection", "Visualizes the candidate tournament pool of 3 timetables, showing their cost scores and highlighting the winner."),
        ("Stage 3: Two-Point Crossover", "Displays Parent A and Parent B side-by-side with Child A and Child B, highlighting the exact swapped genetic segment bounded by cut points p1 and p2."),
        ("Stage 4: Gene Mutation", "Compares the chromosome before and after mutation, highlighting the exact genes that underwent room or time changes in coral red."),
        ("Stage 5: Constraint Repair", "Illustrates the before-and-after of the heuristic repair pass, showing pre-repair conflicts dropping to zero post-repair."),
        ("Stage 6: Final Generated Timetable", "Renders the decoded feasible chromosome directly into the interactive weekly timetable grid.")
    ]
    for title, desc in vis_steps:
        p = doc.add_paragraph()
        r_t = p.add_run(f"{title}: ")
        r_t.bold = True
        r_t.font.color.rgb = COLOR_SECONDARY
        p.add_run(desc)

    add_heading_2("4.3 Built-In University Scenarios & In-App Editor")
    doc.add_paragraph(
        "The system ships with three ready-to-run academic scenarios accessible via the top-right Scenario Editor drawer:"
    )
    doc.add_paragraph(
        "1. Fast Interactive Demo: 8 subjects, 6 professors, 4 rooms. Designed for instant 5-second live demonstrations.\n"
        "2. Standard Engineering College: 30 subjects, 20 professors, 10 rooms across 5 student batches. Represents a full academic department.\n"
        "3. High-Congestion Stress Test: 18 dense subjects competing for only 4 rooms across 4 batches. Tests the algorithm's ability to untangle severe resource bottlenecks."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 5: RESULTS & SENSITIVITY ANALYSIS
    # =========================================================================
    add_heading_1("Chapter 5: Results, Testing & Performance Analysis")
    
    add_heading_2("5.1 Dashboard Metric Cards Explained")
    doc.add_paragraph(
        "During live optimization, the application dashboard presents four real-time color-blocked metric cards:"
    )

    metric_exps = [
        ("Constraint Feasibility (White Card)", "Displays the active count of hard clashes. Shows '0 conflicts' and 'FEASIBLE OPTIMUM' once all teacher, room, and student overlaps are eliminated."),
        ("Objective Penalty Cost (Canary Yellow Card)", "Displays the total cost score (1000 × Hard + Soft). When both physical clashes and waiting gaps are zero, this card displays a flawless 0.0."),
        ("Evolution Progress (Forest Slate Card)", "Tracks current generation vs. maximum limit (e.g. '54 / 200 gens'). When the 40-generation stagnation limit triggers early convergence, it stops gracefully."),
        ("Fitness & Speed (White Card)", "Displays the normalized fitness score (1.0000) and the total execution runtime (e.g. 0.78 seconds).")
    ]
    for title, desc in metric_exps:
        p = doc.add_paragraph()
        r_t = p.add_run(f"• {title}: ")
        r_t.bold = True
        p.add_run(desc)

    add_heading_2("5.2 Parameter Sensitivity: What Happens When You Tweak Sliders?")
    doc.add_paragraph(
        "The optimizer controls panel lets users adjust 4 key evolutionary parameters. The table below summarizes the exact "
        "effect of tweaking each setting:"
    )

    # Sensitivity Table
    tbl_sens = doc.add_table(rows=5, cols=4)
    tbl_sens.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_sens.autofit = False
    
    sens_data = [
        ("Parameter", "Default", "Lower Value Effect", "Higher Value Effect"),
        ("Population Size", "60", "Runs faster per generation; lower diversity; risks getting stuck in local minima.", "Higher diversity; explores larger solution space; slightly more CPU time."),
        ("Generations", "200", "Faster run; may terminate before resolving dense bottlenecks in hard scenarios.", "Provides more time to untangle complex schedules; safely stops early if optimal."),
        ("Mutation Rate", "10%", "Population becomes rigid; cannot escape shared parental clashes.", "Too high (>35%) acts like random noise, destroying good schedules and oscillating."),
        ("Crossover Rate", "80%", "Offspring are mostly clones; slow discovery of new room/day combinations.", "Promotes rapid sharing of clash-free blocks from fit parents.")
    ]
    
    for r_idx, (c0, c1, c2, c3) in enumerate(sens_data):
        row = tbl_sens.rows[r_idx]
        is_hdr = (r_idx == 0)
        for c_idx, val in enumerate([c0, c1, c2, c3]):
            cell = row.cells[c_idx]
            cell.width = Inches(1.1) if c_idx in (0, 1) else Inches(2.1)
            bg = HEX_HEADER_BG if is_hdr else (HEX_ROW_ALT if r_idx % 2 == 1 else "FFFFFF")
            set_cell_background(cell, bg)
            set_cell_margins(cell, top=60, bottom=60, left=70, right=70)
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.bold = is_hdr or (c_idx == 0)
            r.font.size = Pt(8.5)
            r.font.color.rgb = RGBColor(255, 255, 255) if is_hdr else COLOR_TEXT

    p_sp2 = doc.add_paragraph()
    p_sp2.paragraph_format.space_before = Pt(6)

    add_heading_2("5.3 Verification: 29 Automated Pytest Tests")
    doc.add_paragraph(
        "To guarantee mathematical correctness and software reliability, the backend includes an automated test suite "
        "built with pytest. All 29 unit and integration tests pass consistently:"
    )
    doc.add_paragraph(
        "• test_constraints.py: 5 tests verifying exact detection of room, faculty, batch, and capacity violations.\n"
        "• test_fitness.py: 3 tests validating penalty weights and normalized fitness calculation.\n"
        "• test_genetic_algorithm.py: 15 tests covering selection, crossover, mutation, repair, elitism, and convergence.\n"
        "• test_enhanced_features.py: 6 tests checking SSE streaming, scenario preset endpoints, and CSV export."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 6: CONCLUSION & FUTURE ENHANCEMENTS
    # =========================================================================
    add_heading_1("Chapter 6: Conclusion & Future Roadmap")
    
    add_heading_2("6.1 Summary of Contributions")
    doc.add_paragraph(
        "The Timetable Optimizer successfully bridges the gap between theoretical operations research and practical "
        "academic software. Key achievements of this project include:"
    )
    doc.add_paragraph(
        "1. Complete Elimination of Clashes: Generates 100% physically feasible college schedules with 0 faculty, room, or student overlaps.\n"
        "2. Sub-Second Execution: Solves standard university departments in under 1 second (e.g. 0.78s), replacing days of manual trial-and-error.\n"
        "3. Authentic College Architecture: Fully respects 8:00 AM – 5:00 PM operating hours and a universal 1:00 PM – 2:00 PM lunch pause.\n"
        "4. Live Visual Explainability: Features real-time SSE streaming graphs and an interactive 6-stage operator visualizer for viva presentations.\n"
        "5. Production Cloud Deployment: Successfully hosted and accessible globally on Vercel at https://frontend-azure-kappa-xbtipqbzto.vercel.app."
    )

    add_heading_2("6.2 Future Enhancements")
    doc.add_paragraph(
        "While the current system solves core university scheduling comprehensively, future development can explore:\n"
        "• Student Elective Bundles: Handling students from different batches taking shared open elective courses.\n"
        "• Multi-Period Practical Labs: Scheduling contiguous 2-hour or 3-hour laboratory sessions with laboratory assistants.\n"
        "• Professor Preference Profiles: Allowing faculty to submit specific preferred teaching days or morning/afternoon preferences.\n"
        "• Mobile App & Google Calendar Sync: Exporting generated schedules directly into university mobile apps and faculty Google Calendars via iCal/ICS feeds."
    )

    # Save document
    output_path = os.path.join(os.getcwd(), "Timetable_Optimizer_Project_Report.docx")
    doc.save(output_path)
    print(f"Report successfully saved to: {output_path}")

if __name__ == "__main__":
    create_report()
