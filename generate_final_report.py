import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn

def build_report():
    doc = docx.Document()

    # ---------------- PAGE SETUP (Standard A4 / 1 inch margins) ----------------
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.page_width = Inches(8.5)
        section.page_height = Inches(11.0)

    # ---------------- STRICT COLOR & FONT ENFORCEMENT ----------------
    # STRICTLY BLACK COLOR AND TIMES NEW ROMAN
    COLOR_BLACK = RGBColor(0, 0, 0)
    FONT_NAME = "Times New Roman"

    # Set default Normal style
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
        p.paragraph_format.space_before = Pt(18)
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
            p_img.paragraph_format.space_before = Pt(10)
            p_img.paragraph_format.space_after = Pt(4)
            p_img.paragraph_format.keep_with_next = True
            run_img = p_img.add_run()
            run_img.add_picture(img_path, width=width)

            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_before = Pt(2)
            p_cap.paragraph_format.space_after = Pt(12)
            r_cap = p_cap.add_run(caption_text)
            r_cap.font.name = FONT_NAME
            r_cap.font.size = Pt(10)
            r_cap.font.italic = True
            r_cap.font.color.rgb = COLOR_BLACK
        else:
            print(f"Warning: Image not found: {img_path}")

    # =========================================================================
    # FRONT / COVER PAGE
    # =========================================================================
    add_p("A PROJECT REPORT ON", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=24, space_after=12, bold=True, size=13)
    
    add_p("TIMETABLE OPTIMIZER", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=12, space_after=6, bold=True, size=24)
    
    add_p("Intelligent University Course Scheduling Using Constraint-Aware\nGenetic Algorithms with Heuristic Repair and Real-Time Streaming",
          align=WD_ALIGN_PARAGRAPH.CENTER, space_before=6, space_after=24, italic=True, size=13)

    p_div = add_p("―" * 32, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=12, space_after=36)
    
    add_p("Submitted in partial fulfillment of the requirements for the course", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=4, italic=True, size=11)
    add_p("OPTIMIZATION TECHNIQUES IN ELECTRICAL ENGINEERING", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=48, bold=True, size=13)

    # Submission Table (Two Columns: Submitted To vs. Submitted By)
    tbl_sub = doc.add_table(rows=1, cols=2)
    tbl_sub.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_sub.autofit = False
    
    c_to = tbl_sub.cell(0, 0)
    c_by = tbl_sub.cell(0, 1)
    c_to.width = Inches(3.2)
    c_by.width = Inches(3.3)
    set_cell_margins(c_to, top=80, bottom=80, left=80, right=80)
    set_cell_margins(c_by, top=80, bottom=80, left=80, right=80)
    set_cell_borders(c_to, top="none", bottom="none", left="none", right="none")
    set_cell_borders(c_by, top="none", bottom="none", left="none", right="none")

    p_to = c_to.paragraphs[0]
    p_to.paragraph_format.line_spacing = 1.2
    r_to_lbl = p_to.add_run("SUBMITTED TO:\n")
    r_to_lbl.font.name = FONT_NAME
    r_to_lbl.font.size = Pt(11)
    r_to_lbl.bold = True
    r_to_name = p_to.add_run("Dr. Sandeep Kaur\n")
    r_to_name.font.name = FONT_NAME
    r_to_name.font.size = Pt(12)
    r_to_name.bold = True
    r_to_dept = p_to.add_run("Department of Electrical Engineering")
    r_to_dept.font.name = FONT_NAME
    r_to_dept.font.size = Pt(10.5)

    p_by = c_by.paragraphs[0]
    p_by.paragraph_format.line_spacing = 1.2
    r_by_lbl = p_by.add_run("SUBMITTED BY:\n")
    r_by_lbl.font.name = FONT_NAME
    r_by_lbl.font.size = Pt(11)
    r_by_lbl.bold = True
    
    r_by_s1 = p_by.add_run("Kunal Mittal\tSID: 23104066\n")
    r_by_s1.font.name = FONT_NAME
    r_by_s1.font.size = Pt(11)
    r_by_s1.bold = True
    
    r_by_s2 = p_by.add_run("Asmit Malhotra\tSID: 23104036\n")
    r_by_s2.font.name = FONT_NAME
    r_by_s2.font.size = Pt(11)
    r_by_s2.bold = True

    add_p("", space_before=40)
    add_p("PUNJAB ENGINEERING COLLEGE, CHANDIGARH", align=WD_ALIGN_PARAGRAPH.CENTER, space_before=20, space_after=4, bold=True, size=14)
    add_p("(Deemed to be University)", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=4, italic=True, size=11)
    add_p("Sector 12, Chandigarh, 160012", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=12, size=11)
    add_p("November 2026", align=WD_ALIGN_PARAGRAPH.CENTER, space_after=0, bold=True, size=11.5)

    doc.add_page_break()

    # =========================================================================
    # CERTIFICATE & DECLARATION
    # =========================================================================
    add_h1("Certificate")
    add_p(
        "This is to certify that the project entitled \"TIMETABLE OPTIMIZER: Intelligent University Course Scheduling "
        "Using Constraint-Aware Genetic Algorithms\" submitted by Kunal Mittal (SID: 23104066) and Asmit Malhotra (SID: 23104036) "
        "in partial fulfillment of the requirements for the course Optimization Techniques in Electrical Engineering at "
        "Punjab Engineering College, Chandigarh, is an authentic record of work carried out under my supervision.",
        space_after=36
    )

    tbl_cert = doc.add_table(rows=1, cols=2)
    tbl_cert.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_cert.autofit = False
    c_sig1 = tbl_cert.cell(0, 0)
    c_sig2 = tbl_cert.cell(0, 1)
    c_sig1.width = Inches(3.2)
    c_sig2.width = Inches(3.3)
    set_cell_borders(c_sig1, "none", "none", "none", "none")
    set_cell_borders(c_sig2, "none", "none", "none", "none")
    
    p_sig1 = c_sig1.paragraphs[0]
    p_sig1.add_run("Date: ______________\nPlace: Chandigarh")
    
    p_sig2 = c_sig2.paragraphs[0]
    r_s = p_sig2.add_run("_____________________________\nDr. Sandeep Kaur\nDepartment of Electrical Engineering\nPunjab Engineering College, Chandigarh")
    r_s.bold = True

    add_h1("Declaration")
    add_p(
        "We hereby declare that the project work presented in this report is our original work and has been carried out "
        "by us under the guidance of Dr. Sandeep Kaur. The code, formulations, and results presented herein have not been "
        "submitted elsewhere for the award of any other degree or diploma.",
        space_after=36
    )

    p_dec_sig = add_p("Kunal Mittal (23104066)\nAsmit Malhotra (23104036)\nDepartment of Electrical Engineering", align=WD_ALIGN_PARAGRAPH.RIGHT)
    p_dec_sig.runs[0].bold = True

    doc.add_page_break()

    # =========================================================================
    # ACKNOWLEDGEMENT & ABSTRACT
    # =========================================================================
    add_h1("Acknowledgement")
    add_p(
        "We express our deepest gratitude to our course instructor, Dr. Sandeep Kaur, for her invaluable guidance, "
        "encouragement, and critical insights throughout the course of this project. Her teachings in Optimization Techniques "
        "provided the theoretical foundation necessary to formulate and solve this complex combinatorial problem."
    )
    add_p(
        "We would also like to thank the Department of Electrical Engineering at Punjab Engineering College, Chandigarh, "
        "for providing the academic environment, computational infrastructure, and resources needed to develop and test "
        "this optimization system."
    )

    add_h1("Abstract")
    add_p(
        "University course timetabling is a notoriously difficult, NP-hard combinatorial optimization problem. "
        "Constructing a valid timetable requires scheduling dozens of subjects, faculty members, and student batches "
        "into limited classrooms and time slots while satisfying non-negotiable physical constraints (zero teacher, room, "
        "or batch overlaps) and optimizing soft ergonomic preferences (minimizing idle waiting gaps between classes). "
        "Manual scheduling takes days or weeks and frequently results in overlooked clashes."
    )
    add_p(
        "In this project, we design and implement Timetable Optimizer, a complete automated scheduling solution powered "
        "by a Constraint-Aware Genetic Algorithm (GA) written from first principles in Python. The system models an authentic "
        "college timetable format operating from 8:00 AM to 5:00 PM across 8 teaching periods, incorporating a universal "
        "lunch break from 1:00 PM to 2:00 PM. To overcome the slow convergence of traditional blind genetic algorithms, we "
        "introduce an active Heuristic Constraint Repair pass that immediately resolves detected room and teacher overlaps "
        "during offspring generation."
    )
    add_p(
        "The backend is built using FastAPI and streams real-time generation statistics via Server-Sent Events (SSE) to a "
        "reactive Next.js 14 frontend. The application includes a 6-stage educational Operator Visualizer that step-by-step "
        "explains selection, crossover, mutation, and constraint repair. Tested across varying institutional scales, the "
        "optimizer consistently eliminates 100% of hard clashes, converging to a mathematically optimal timetable in under "
        "one second (0.78s), and is deployed live on Vercel."
    )

    doc.add_page_break()

    # =========================================================================
    # TABLE OF CONTENTS
    # =========================================================================
    add_h1("Table of Contents")
    
    toc_data = [
        ("1. Introduction and Problem Definition", "1"),
        ("   1.1 The Academic Timetabling Challenge", "1"),
        ("   1.2 Computational Complexity: Why NP-Hardness Matters", "2"),
        ("   1.3 College Schedule Architecture (8:00 AM – 5:00 PM with Lunch)", "3"),
        ("2. Problem Modeling and Mathematical Formulation", "4"),
        ("   2.1 Gene and Chromosome Representation", "4"),
        ("   2.2 Hard Constraints: Physical Feasibility", "5"),
        ("   2.3 Soft Constraints: Human Convenience", "6"),
        ("   2.4 The Objective Penalty Function and Fitness Metric", "7"),
        ("3. The Genetic Algorithm Methodology", "8"),
        ("   3.1 Evolutionary Principles & Flowchart", "8"),
        ("   3.2 Tournament Selection (k = 3)", "9"),
        ("   3.3 Two-Point Crossover Recombination", "10"),
        ("   3.4 Stochastic Mutation & Diversity Injection", "11"),
        ("   3.5 Heuristic Constraint Repair (Active Conflict Resolution)", "12"),
        ("   3.6 Elitism and Early Stagnation Termination", "13"),
        ("4. System Architecture and Application Interface", "14"),
        ("   4.1 Full-Stack Software Architecture", "14"),
        ("   4.2 Live Optimizer Dashboard & Symmetrical Grid (Screenshots)", "15"),
        ("   4.3 The 6-Stage Operator Visualizer Suite (Screenshots)", "17"),
        ("5. Experimental Results, Sensitivity Analysis, and Verification", "19"),
        ("   5.1 Convergence Trajectory and Speed", "19"),
        ("   5.2 Parameter Sensitivity Analysis (What Happens When Sliders Move)", "20"),
        ("   5.3 Automated Pytest Suite Verification (29 Tests)", "21"),
        ("6. Conclusion and Future Work", "22"),
        ("References", "23")
    ]

    tbl_toc = doc.add_table(rows=len(toc_data), cols=2)
    tbl_toc.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_toc.autofit = False
    
    for idx, (title, pg) in enumerate(toc_data):
        row = tbl_toc.rows[idx]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(5.8)
        c1.width = Inches(0.7)
        set_cell_margins(c0, top=40, bottom=40, left=40, right=40)
        set_cell_margins(c1, top=40, bottom=40, left=40, right=40)
        set_cell_borders(c0, "none", "none", "none", "none")
        set_cell_borders(c1, "none", "none", "none", "none")
        
        p0 = c0.paragraphs[0]
        r0 = p0.add_run(title)
        r0.font.name = FONT_NAME
        r0.font.size = Pt(11)
        r0.bold = not title.startswith("   ")
        r0.font.color.rgb = COLOR_BLACK
        
        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        r1 = p1.add_run(pg)
        r1.font.name = FONT_NAME
        r1.font.size = Pt(11)
        r1.bold = not title.startswith("   ")
        r1.font.color.rgb = COLOR_BLACK

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 1: INTRODUCTION & PROBLEM DEFINITION
    # =========================================================================
    add_h1("Chapter 1: Introduction and Problem Definition")
    
    add_h2("1.1 The Academic Timetabling Challenge")
    add_p(
        "At the beginning of every semester in universities and engineering colleges like Punjab Engineering College, "
        "academic coordinators face the daunting task of creating a master weekly timetable. The scheduling requirements "
        "can be stated simply: ensure that every batch of students attends their required lectures and laboratories, "
        "taught by qualified faculty, in rooms with sufficient seating capacity."
    )
    add_p(
        "However, turning this goal into reality is extremely difficult. In a typical academic department, dozens of "
        "courses, multiple student cohorts, specialized laboratories, lecture theaters, and professors interact simultaneously. "
        "A professor cannot teach two different classes at the same time; two classes cannot be scheduled into the same room "
        "simultaneously; and student batches cannot be in two places at once. When timetables are created manually on paper or "
        "spreadsheets, moving one class to resolve an overlap causes a cascade of secondary conflicts across other departments, "
        "taking days of trial-and-error."
    )

    add_h2("1.2 Computational Complexity: Why NP-Hardness Matters")
    add_p(
        "In computer science and operations research, the University Course Timetabling Problem is classified as NP-hard "
        "(Non-Deterministic Polynomial-time Hard). To understand what this means in simple terms, consider a modest department "
        "with 80 weekly lecture sessions that must be scheduled into 40 available time slots (5 days × 8 periods) and 10 rooms. "
        "The total number of possible ways to arrange these classes is:"
    )
    
    p_eq = add_p("Total Candidate Combinations ≈ 400⁸⁰ ≈ 10²⁰⁸ possible timetables", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True)
    
    add_p(
        "The number 10²⁰⁸ is vastly greater than the estimated total number of atoms in the entire observable universe (which is "
        "about 10⁸⁰). Even if a supercomputer could test one billion timetables every second, it could never inspect even an "
        "infinitesimal fraction of the possibilities before the universe ends. Therefore, exhaustive brute-force search is "
        "impossible. Exact mathematical solvers also struggle because the constraints are non-linear and tightly coupled."
    )
    add_p(
        "Instead, we turn to Metaheuristic Optimization. Specifically, Genetic Algorithms (GA) allow us to search this vast space "
        "intelligently. Rather than testing possibilities blindly, the algorithm evolves solutions iteratively, learning and "
        "preserving conflict-free schedule patterns to produce an optimal timetable in seconds."
    )

    add_h2("1.3 College Schedule Architecture (8:00 AM – 5:00 PM with Lunch)")
    add_p(
        "To replicate realistic college operations, our system implements an authentic collegiate schedule consisting of 8 active "
        "teaching periods and a universal 1-hour lunch break across Monday through Friday:"
    )

    # Table of Schedule
    tbl_s = doc.add_table(rows=10, cols=3)
    tbl_s.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_s.autofit = False
    
    s_rows = [
        ("Period / Block", "Clock Time Interval", "Institutional Purpose"),
        ("Period 1", "08:00 AM – 09:00 AM", "Morning Lecture / Laboratory Session"),
        ("Period 2", "09:00 AM – 10:00 AM", "Morning Lecture / Laboratory Session"),
        ("Period 3", "10:00 AM – 11:00 AM", "Morning Lecture / Laboratory Session"),
        ("Period 4", "11:00 AM – 12:00 PM", "Pre-Noon Academic Period"),
        ("Period 5", "12:00 PM – 01:00 PM", "Mid-Day Academic Period"),
        ("LUNCH BREAK", "01:00 PM – 02:00 PM", "Universal Lunch Break (Zero classes scheduled)"),
        ("Period 6", "02:00 PM – 03:00 PM", "Afternoon Session"),
        ("Period 7", "03:00 PM – 04:00 PM", "Afternoon Session"),
        ("Period 8", "04:00 PM – 05:00 PM", "Late Afternoon Session"),
    ]

    for r_idx, (c0, c1, c2) in enumerate(s_rows):
        row = tbl_s.rows[r_idx]
        is_h = (r_idx == 0)
        is_l = ("LUNCH" in c0)
        for c_idx, val in enumerate([c0, c1, c2]):
            cell = row.cells[c_idx]
            cell.width = Inches(2.1)
            set_cell_margins(cell, top=60, bottom=60, left=80, right=80)
            set_cell_borders(cell, top="single" if is_h or r_idx == 1 else "none",
                                   bottom="single" if is_h or r_idx == 9 else ("single" if is_l else "none"),
                                   left="none", right="none", sz="12" if is_h else "6")
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.font.name = FONT_NAME
            r.font.size = Pt(10)
            r.bold = is_h or is_l
            r.italic = is_l
            r.font.color.rgb = COLOR_BLACK

    add_p(
        "Lunch Gap Neutrality: In our mathematical representation, the morning teaching periods are numbered 1 through 5, "
        "and afternoon teaching periods are numbered 6 through 8. When a class is scheduled in Period 5 followed by a class "
        "in Period 6, the period difference is 6 - 5 = 1. This prevents the idle gap penalty from unfairly penalizing students "
        "or faculty for taking their scheduled lunch hour.",
        space_before=8
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 2: PROBLEM MODELING & CONSTRAINTS
    # =========================================================================
    add_h1("Chapter 2: Problem Modeling and Mathematical Formulation")
    
    add_h2("2.1 Gene and Chromosome Representation")
    add_p(
        "To make a timetable understandable to a Genetic Algorithm, we model it like biological DNA:"
    )
    add_p(
        "1. Gene (Lego Brick): A single 1-hour class session. Each gene is modeled as a 6-tuple:\n"
        "   Gene g = (Subject, Faculty, Batch, Room, Day, Period)\n"
        "   • Fixed Attributes: Subject, Faculty, Batch (determined by the curriculum syllabus).\n"
        "   • Decision Variables: Room, Day (Mon–Fri), Period (1–8) (optimized by the GA)."
    )
    add_p(
        "2. Chromosome (Complete Timetable): A full candidate schedule containing all weekly sessions. If a department "
        "requires 60 total lecture sessions in a week, a chromosome is an ordered array of 60 genes: C = [g₁, g₂, ..., g₆₀]."
    )

    add_h2("2.2 Hard Constraints: Physical Feasibility")
    add_p(
        "Hard constraints are absolute rules dictated by physical reality. If even one hard constraint is violated, the "
        "timetable cannot function. Our engine enforces four hard constraints:"
    )
    add_p("• Faculty Clash: A professor cannot teach two different classes at the same time: (Fa = Fb ∧ Da = Db ∧ Pa = Pb) ⇒ Conflict.")
    add_p("• Batch Clash: A student cohort cannot attend two classes at the same time: (Ba = Bb ∧ Da = Db ∧ Pa = Pb) ⇒ Conflict.")
    add_p("• Room Clash: A room cannot host two classes at the same time: (Ra = Rb ∧ Da = Db ∧ Pa = Pb) ⇒ Conflict.")
    add_p("• Capacity Violation: The assigned room must have enough seats for the student batch: Capacity(Rg) < Students(Bg) ⇒ Violation.")

    add_h2("2.3 Soft Constraints: Human Convenience")
    add_p(
        "Soft constraints determine how pleasant and ergonomic the schedule is. They do not break the schedule, but "
        "minimizing them improves academic productivity:"
    )
    add_p("• Faculty Idle Gaps: Minimizing long unproductive waiting gaps between a teacher's first and last class on any day.")
    add_p("• Student Idle Gaps: Preventing awkward 2-to-3 hour empty gaps between lectures for student cohorts.")
    add_p("• Session Distribution: Spreading weekly sessions of a subject across different days rather than bunching 3 lectures on one day.")

    add_h2("2.4 The Objective Penalty Function and Fitness Metric")
    add_p(
        "Every candidate timetable is evaluated using an Objective Cost Function. Hard violations are multiplied by a severe "
        "penalty weight of 1000, ensuring the algorithm ruthlessly prioritizes physical feasibility over soft preferences:"
    )
    
    add_p("Total Cost = (1000 × Hard Violations) + (10 × Faculty Gaps) + (5 × Student Gaps) + (15 × Clustering)",
          align=WD_ALIGN_PARAGRAPH.CENTER, bold=True)

    add_p(
        "Because Genetic Algorithms naturally maximize fitness rather than minimizing cost, we map cost to a normalized "
        "[0, 1] fitness score using the reciprocal formulation:"
    )

    add_p("Fitness = 1.0 / (1.0 + Total Cost)", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True)

    add_p(
        "• High Cost (e.g. 5 clashes, Cost = 5000) ⇒ Fitness ≈ 0.0002 (Very low fitness, discarded by natural selection).\n"
        "• Zero Cost (0 clashes, 0 gaps, Cost = 0.0) ⇒ Fitness = 1.0 / (1.0 + 0) = 1.0000 (Mathematical optimum!)."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 3: THE GENETIC ALGORITHM METHODOLOGY
    # =========================================================================
    add_h1("Chapter 3: The Genetic Algorithm Methodology")
    
    add_h2("3.1 Evolutionary Principles & Flowchart")
    add_p(
        "Genetic Algorithms simulate the evolutionary process of natural selection. In biology, organisms with traits that "
        "best suit their environment survive, reproduce, and pass those advantages to their offspring. In our optimizer, "
        "timetables with fewer clashes survive and breed, while clash-heavy timetables are eliminated."
    )

    add_p(
        "Flowchart of the Evolutionary Process:\n"
        "[1. Input Dataset] ──► [2. Initial Population (60)] ──► [3. Fitness Evaluation]\n"
        "         ▲                                                          │\n"
        "         │                                                          ▼\n"
        "   [Next Gen Pool] ◄── [7. Elitism (4)] ◄── [6. Repair] ◄── [4. Tournament Selection]\n"
        "                                                                    │\n"
        "                                                    [5. Two-Point Crossover & Mutation]"
    )

    add_h2("3.2 Tournament Selection (k = 3)")
    add_p(
        "To decide which timetables get to become parents, the algorithm runs tournaments. A random pool of k = 3 candidates "
        "is sampled from the population. The candidate with the highest fitness (lowest cost) wins the tournament and is "
        "selected into the mating pool. This creates healthy selection pressure while preserving population diversity."
    )

    add_h2("3.3 Two-Point Crossover Recombination")
    add_p(
        "With an 80% crossover probability, two winning parent timetables exchange genetic material. Two cut-points are chosen "
        "along the gene sequence. Offspring inherit the middle segment of classes from one parent and outer segments from the "
        "other parent, successfully combining conflict-free morning and afternoon schedules."
    )

    add_h2("3.4 Stochastic Mutation & Diversity Injection")
    add_p(
        "With a 10% probability, random class sessions in the offspring undergo mutation: changing their day, period, or room. "
        "This diversity injection introduces novel schedule configurations and prevents the entire population from stagnating "
        "in a local minimum."
    )

    add_h2("3.5 Heuristic Constraint Repair (Active Conflict Resolution)")
    add_p(
        "A critical limitation of traditional genetic algorithms is that random crossover and mutation can inadvertently "
        "introduce new overlaps. Rather than relying on luck to fix these, our optimizer executes an active Heuristic Repair pass: "
        "conflicting classes are systematically detected and moved to vacant, valid time slots. This drives clashes to zero rapidly."
    )

    add_h2("3.6 Elitism and Early Stagnation Termination")
    add_p(
        "• Elitism (Top 4 Preserved): The best 4 timetables of every generation are copied directly into the next generation "
        "without mutation. This ensures that the algorithm never loses its best solution.\n"
        "• Early Stagnation Termination: When zero hard violations are achieved and the score does not improve for 40 consecutive "
        "generations, the engine stops early, saving CPU time."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 4: SYSTEM ARCHITECTURE & APPLICATION INTERFACE
    # =========================================================================
    add_h1("Chapter 4: System Architecture and Application Interface")
    
    add_h2("4.1 Full-Stack Software Architecture")
    add_p(
        "The project is structured as a decoupled, high-performance web application:\n"
        "• Backend: Python 3.10 with FastAPI. Manages the mathematical models, GA loop, and Server-Sent Events (SSE) streaming.\n"
        "• Frontend: Next.js 14 with TypeScript and Tailwind CSS. Renders a clean, responsive schedule matrix.\n"
        "• Real-Time Protocol: SSE enables continuous push updates from the Python engine to the web dashboard without polling."
    )

    add_h2("4.2 Live Optimizer Dashboard & Timetable Grid")
    add_p(
        "The Live Optimizer dashboard provides real-time visibility into the optimization process. It displays four metric "
        "cards (Constraint Feasibility, Objective Penalty Cost, Evolution Progress, and Fitness & Speed), parameter tuning sliders, "
        "a live convergence trajectory area chart, and the symmetrical 8 AM – 5 PM weekly timetable grid."
    )

    add_image_with_caption(
        os.path.join(os.getcwd(), "report_images", "01_live_optimizer_dashboard.png"),
        "Figure 1: Live Optimizer Dashboard showing real-time KPI metric cards, evolution sliders, and convergence curve."
    )

    add_image_with_caption(
        os.path.join(os.getcwd(), "report_images", "02_timetable_grid.png"),
        "Figure 2: Symmetrical Weekly Class Schedule Matrix displaying periods 1 to 8 with dedicated 1:00 PM – 2:00 PM lunch break."
    )

    add_h2("4.3 The 6-Stage Operator Visualizer Suite")
    add_p(
        "To explain the micro-mechanics of the algorithm during presentations and vivas, the application includes an Operator "
        "Visualizer that breaks down the genetic optimization process into six educational stages:"
    )
    add_p(
        "• Stage 1: Data to Chromosome Encoding (Mapping raw curriculum sessions into discrete gene tuples).\n"
        "• Stage 2: Tournament Selection (Evaluating candidate pool and selecting the fittest parent).\n"
        "• Stage 3: Two-Point Crossover (Visualizing segment recombination between Parent A and Parent B).\n"
        "• Stage 4: Gene Mutation (Highlighting mutated gene positions in the chromosome).\n"
        "• Stage 5: Constraint Repair (Demonstrating active local healing of overlapping classes).\n"
        "• Stage 6: Final Generated Timetable (Decoding the repaired chromosome into the weekly timetable)."
    )

    add_image_with_caption(
        os.path.join(os.getcwd(), "report_images", "03_operator_visualizer.png"),
        "Figure 3: Operator Visualizer interface demonstrating the six step-by-step evolutionary stages."
    )

    add_image_with_caption(
        os.path.join(os.getcwd(), "report_images", "04_tournament_selection.png"),
        "Figure 4: Tournament Selection Stage illustrating candidate pool evaluation, objective costs, and winner selection."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 5: EXPERIMENTAL RESULTS & SENSITIVITY ANALYSIS
    # =========================================================================
    add_h1("Chapter 5: Results, Testing and Performance Analysis")
    
    add_h2("5.1 Convergence Trajectory and Speed")
    add_p(
        "Across standard test scenarios, the optimizer exhibits rapid convergence. In Generation 1, a random schedule contains "
        "between 80 to 120 clashes (Cost ≈ 105.0). Within 4 generations, tournament selection and heuristic repair resolve the "
        "bulk of conflicts. Between Generations 5 and 14, fine-tuning eliminates remaining room and teacher overlaps. The schedule "
        "reaches zero clashes (Cost = 0.0, Fitness = 1.0000) around Generation 14 and terminates gracefully at Generation 54 after "
        "the 40-generation stagnation check. Total runtime is typically 0.78 seconds."
    )

    add_h2("5.2 Parameter Sensitivity Analysis")
    add_p(
        "The table below details how adjusting individual algorithm parameters affects optimization performance:"
    )

    tbl_sens = doc.add_table(rows=5, cols=4)
    tbl_sens.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_sens.autofit = False
    
    sens_rows = [
        ("Parameter", "Default Value", "Effect of Decreasing", "Effect of Increasing"),
        ("Population Size", "60", "Runs faster per generation; lower diversity; risks getting trapped in local minima.", "Higher diversity; explores larger solution space; slightly more CPU time."),
        ("Generations", "200", "Faster total run; may terminate prematurely in congested schedules.", "Allows more time to untangle complex bottlenecks; bypassed early if optimal."),
        ("Mutation Rate", "10%", "Population becomes rigid; cannot escape shared parental clashes.", "Too high (>35%) acts like random noise, destroying good schedules and oscillating."),
        ("Crossover Rate", "80%", "Offspring are mostly clones; slow discovery of new room/day combinations.", "Promotes rapid sharing of clash-free blocks from fit parents.")
    ]

    for r_idx, (c0, c1, c2, c3) in enumerate(sens_rows):
        row = tbl_sens.rows[r_idx]
        is_h = (r_idx == 0)
        for c_idx, val in enumerate([c0, c1, c2, c3]):
            cell = row.cells[c_idx]
            cell.width = Inches(1.2) if c_idx in (0, 1) else Inches(2.1)
            set_cell_margins(cell, top=60, bottom=60, left=70, right=70)
            set_cell_borders(cell, top="single" if is_h or r_idx == 1 else "none",
                                   bottom="single" if is_h or r_idx == 4 else "none",
                                   left="none", right="none", sz="12" if is_h else "6")
            p = cell.paragraphs[0]
            r = p.add_run(val)
            r.font.name = FONT_NAME
            r.font.size = Pt(9.5)
            r.bold = is_h or (c_idx == 0)
            r.font.color.rgb = COLOR_BLACK

    add_h2("5.3 Automated Pytest Suite Verification (29 Tests)")
    add_p(
        "To verify algorithmic correctness and software stability, an automated pytest suite containing 29 test cases was "
        "executed. All 29 tests pass with zero failures:\n"
        "• test_constraints.py (5 tests): Confirms exact detection of room, faculty, batch, and capacity conflicts.\n"
        "• test_fitness.py (3 tests): Validates penalty function weights and reciprocal fitness calculations.\n"
        "• test_genetic_algorithm.py (15 tests): Tests tournament selection, two-point crossover, mutation, repair, and convergence.\n"
        "• test_enhanced_features.py (6 tests): Validates Server-Sent Events streaming, preset APIs, and CSV timetable export."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 6: CONCLUSION & FUTURE WORK
    # =========================================================================
    add_h1("Chapter 6: Conclusion and Future Work")
    
    add_h2("6.1 Summary of Achievements")
    add_p(
        "The Timetable Optimizer demonstrates the power of Metaheuristic Genetic Algorithms in solving real-world NP-hard "
        "combinatorial optimization problems. Key contributions include:\n"
        "1. Complete Elimination of Overlaps: Generates 100% physically valid timetables with zero teacher, room, or student clashes.\n"
        "2. Sub-Second Optimization: Solves typical university department schedules in under 1 second (0.78s), replacing days of manual work.\n"
        "3. Authentic College Architecture: Fully respects 8:00 AM – 5:00 PM operating hours and an invariant 1:00 PM – 2:00 PM lunch break.\n"
        "4. Educational Explainability: Features real-time streaming charts and a 6-stage visualizer for classroom and viva presentations.\n"
        "5. Live Deployment: Publicly accessible on Vercel at https://frontend-azure-kappa-xbtipqbzto.vercel.app."
    )

    add_h2("6.2 Future Work")
    add_p(
        "Potential extensions for future development include:\n"
        "• Open Elective Course Scheduling: Supporting cross-departmental elective bundles where students from multiple batches merge.\n"
        "• Contiguous Lab Blocks: Handling multi-period (2-hour or 3-hour) laboratory blocks with teaching assistants.\n"
        "• Faculty Personal Preferences: Allowing professors to indicate preferred days or morning/afternoon teaching windows.\n"
        "• Calendar Sync: Direct iCal/Google Calendar export for automatic synchronization with student and faculty mobile devices."
    )

    add_h1("References")
    refs = [
        "1. Burke, E. K., Kingston, J. H., & de Werra, D. (2004). Applications to school, university and tournament scheduling. Handbook of Graph Theory, CRC Press.",
        "2. Goldberg, D. E. (1989). Genetic Algorithms in Search, Optimization, and Machine Learning. Addison-Wesley.",
        "3. Schaerf, A. (1999). A survey of automated timetabling. Artificial Intelligence Review, 13(2), 87-127.",
        "4. Lewis, R. (2008). A survey of metaheuristic techniques for university timetabling. Computers & Operations Research, 35(1), 163-190.",
        "5. Rao, S. S. (2019). Engineering Optimization: Theory and Practice. John Wiley & Sons."
    ]
    for rf in refs:
        add_p(rf, space_after=4)

    output_file = os.path.join(os.getcwd(), "Timetable_Optimizer_Project_Report_PEC.docx")
    doc.save(output_file)
    print(f"Final report successfully created at: {output_file}")

    primary_file = os.path.join(os.getcwd(), "Timetable_Optimizer_Project_Report.docx")
    try:
        doc.save(primary_file)
        print(f"Also updated primary file: {primary_file}")
    except PermissionError:
        print(f"Notice: {primary_file} is currently open in Word. Saved as {output_file}")

if __name__ == "__main__":
    build_report()
