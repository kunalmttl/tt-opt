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

    # ---------------- STRICT BLACK COLOR & TIMES NEW ROMAN ----------------
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
        p.paragraph_format.space_before = Pt(18)
        p.paragraph_format.space_after = Pt(8)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(text)
        r.font.name = FONT_NAME
        r.font.size = Pt(15)
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
        r.font.size = Pt(13)
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

    add_p("―" * 32, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=12, space_after=36)
    
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
        "This is to certify that the project report entitled \"TIMETABLE OPTIMIZER: Intelligent University Course Scheduling "
        "Using Constraint-Aware Genetic Algorithms\" submitted by Kunal Mittal (SID: 23104066) and Asmit Malhotra (SID: 23104036) "
        "in partial fulfillment of the requirements for the course Optimization Techniques in Electrical Engineering at "
        "Punjab Engineering College, Chandigarh, is an authentic record of original work carried out under my supervision.",
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
        "We express our sincere gratitude to our course instructor, Dr. Sandeep Kaur, for her valuable guidance, "
        "continuous encouragement, and practical insights throughout this semester. Her teaching in Optimization Techniques "
        "inspired us to tackle this challenging real-world problem and provided the theoretical foundation needed to design, "
        "implement, and evaluate our evolutionary scheduling algorithm."
    )
    add_p(
        "We are also thankful to the Department of Electrical Engineering and the administration of Punjab Engineering College, "
        "Chandigarh, for providing the laboratory facilities and academic environment that enabled us to build and verify this project."
    )

    add_h1("Abstract")
    add_p(
        "Making a college timetable manually is one of the most frustrating puzzles any academic department faces. "
        "Imagine having dozens of professors, hundreds of students divided into sections, and a limited number of classrooms "
        "and laboratories. Every single class must be assigned to an exact day, hour, and room. A single mistake—such as scheduling "
        "two professors in the same room or booking one professor for two classes at once—makes the entire schedule unworkable. "
        "Because there are billions of ways to arrange classes, finding a clash-free timetable by hand can take days or weeks."
    )
    add_p(
        "In this project, we created Timetable Optimizer, a software system that automates this entire process using a "
        "Constraint-Aware Genetic Algorithm. A genetic algorithm solves problems by mimicking biological evolution: it creates an "
        "initial population of random schedules, scores how good or bad each schedule is, breeds the best ones together, and "
        "mutates them slightly to find better arrangements. To make it especially powerful, we added a Heuristic Repair step: whenever "
        "a clash is detected, the algorithm immediately moves that class into an empty slot, resolving conflicts on the spot."
    )
    add_p(
        "The system schedules classes across a standard university day from 8:00 AM to 5:00 PM (8 one-hour teaching periods), with "
        "a guaranteed universal lunch break from 1:00 PM to 2:00 PM. The application consists of a fast Python (FastAPI) optimization "
        "engine connected to a modern Next.js web dashboard. It solves full college departments in less than one second (0.78 seconds), "
        "shows live real-time convergence graphs, and includes a step-by-step visualizer that clearly explains how the algorithm works."
    )

    doc.add_page_break()

    # =========================================================================
    # TABLE OF CONTENTS
    # =========================================================================
    add_h1("Table of Contents")
    
    toc_data = [
        ("1. Introduction and Problem Definition", "1"),
        ("   1.1 The Timetable Problem in Everyday Language", "1"),
        ("   1.2 Why Computers Cannot Simply Guess (NP-Hardness Explained)", "2"),
        ("   1.3 The College Schedule: 8:00 AM – 5:00 PM with Lunch Break", "3"),
        ("2. Problem Modeling: Turning Timetables into Math", "4"),
        ("   2.1 Genes and Chromosomes: The Building Blocks", "4"),
        ("   2.2 Hard Constraints: The Absolute Deal-Breakers", "5"),
        ("   2.3 Soft Constraints: Human Comfort and Quality", "6"),
        ("   2.4 The Cost and Fitness Score Formulas", "7"),
        ("3. The Genetic Algorithm Methodology", "8"),
        ("   3.1 The Evolutionary Cycle: Natural Selection at Work", "8"),
        ("   3.2 Step 1: Population Initialization", "8"),
        ("   3.3 Step 2: Scoring the Schedules", "9"),
        ("   3.4 Step 3: Tournament Selection (Picking the Best Parents)", "9"),
        ("   3.5 Step 4: Two-Point Crossover (Combining Good Schedules)", "10"),
        ("   3.6 Step 5: Gene Mutation (Adding Variety to Avoid Traps)", "10"),
        ("   3.7 Step 6: Heuristic Repair (Our Secret Weapon)", "11"),
        ("   3.8 Step 7 & 8: Elitism and Early Stagnation Stop", "11"),
        ("4. System Architecture and Application Interface", "12"),
        ("   4.1 How the Software is Built (Backend and Frontend)", "12"),
        ("   4.2 Live Optimizer Dashboard & Timetable Grid (Screenshots)", "13"),
        ("   4.3 The 6-Stage Operator Visualizer Suite (Screenshots)", "15"),
        ("5. Experimental Results, Slider Effects, and Testing", "17"),
        ("   5.1 Convergence Performance (From 105 Clashes to Zero in 0.78s)", "17"),
        ("   5.2 Slider Sensitivity: What Happens When You Tweak Parameters", "18"),
        ("   5.3 Automated Testing with Pytest (29 Tests Passing)", "19"),
        ("6. Conclusion and Future Roadmap", "20"),
        ("References", "21")
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
    
    add_h2("1.1 The Timetable Problem in Everyday Language")
    add_p(
        "Every college student and professor has looked at their weekly schedule. We know that on Monday at 9:00 AM, Section A "
        "has Data Structures with Dr. Sharma in Room 101. But very few people realize how difficult it is to create that schedule "
        "in the first place."
    )
    add_p(
        "Think of a university timetable like a giant three-dimensional puzzle. We have three main questions to answer for every "
        "single lecture session across the week:\n"
        "1. WHO is teaching it and WHO is attending? (The professor and the student batch)\n"
        "2. WHEN is it happening? (Which day of the week, and which hour of the day)\n"
        "3. WHERE is it happening? (Which classroom or laboratory)"
    )
    add_p(
        "If you schedule two classes for the same professor at the exact same hour, that is physically impossible—one person cannot "
        "be in two rooms at once. If you put two classes in the same lecture hall at the same time, the students will walk in and "
        "collide with each other. If you assign a batch of 60 students to a small 30-seat computer lab, half the students will have "
        "nowhere to sit. When coordinators try to build timetables manually on paper or Excel, fixing one overlap causes a chain reaction "
        "that breaks three other classes. It is exhausting and prone to human error."
    )

    add_h2("1.2 Why Computers Cannot Simply Guess (NP-Hardness Explained)")
    add_p(
        "You might ask: 'Why can't we just write a simple program that tests every possible schedule combination and chooses the "
        "best one?' This is where computational mathematics comes in."
    )
    add_p(
        "Imagine a small department with 80 class sessions per week, 40 available time slots (5 days × 8 hours), and 10 rooms. "
        "For each class session, there are 40 × 10 = 400 possible places to put it. For all 80 sessions, the total number of "
        "different timetable combinations is:"
    )
    
    add_p("Total Combinations = 400⁸⁰ ≈ 10²⁰⁸ possible timetables", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True)
    
    add_p(
        "To give you an idea of how big 10²⁰⁸ is: the entire observable universe only contains about 10⁸⁰ atoms. The number of timetable "
        "combinations is greater than all the atoms in the universe squared! Even a supercomputer that can test a billion timetables "
        "every second would take trillions of years to check them all. In computer science, this is called an NP-Hard Combinatorial Problem."
    )
    add_p(
        "Because brute force is mathematically impossible, we need smart optimization techniques. Instead of guessing randomly, our "
        "Genetic Algorithm starts with a small group of candidate timetables and iteratively improves them, learning which arrangements "
        "work best and producing a perfect schedule in under one second."
    )

    add_h2("1.3 The College Schedule: 8:00 AM – 5:00 PM with Lunch Break")
    add_p(
        "Our system is modeled around the real daily schedule used at Punjab Engineering College and other universities. The college "
        "operates from 8:00 AM to 5:00 PM, Monday through Friday, with a universal lunch break from 1:00 PM to 2:00 PM:"
    )

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
        ("Period 6", "02:00 PM – 03:00 PM", "Afternoon Academic Session"),
        ("Period 7", "03:00 PM – 04:00 PM", "Afternoon Academic Session"),
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
        "Why Lunch Gap Neutrality Matters: The morning periods are numbered 1 through 5, and the afternoon periods are numbered "
        "6 through 8. If a student has a class in Period 5 (ending at 1:00 PM) and their next class in Period 6 (starting at 2:00 PM), "
        "the period difference is 6 - 5 = 1. Mathematically, the algorithm recognizes this as continuous, so it never penalizes "
        "teachers or students for taking their lunch hour.",
        space_before=8
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 2: PROBLEM MODELING: TURNING TIMETABLES INTO MATH
    # =========================================================================
    add_h1("Chapter 2: Problem Modeling: Turning Timetables into Math")
    
    add_h2("2.1 Genes and Chromosomes: The Building Blocks")
    add_p(
        "To make a computer solve a timetable problem, we convert schedules into digital structures borrowed from genetics:"
    )
    add_p(
        "1. The Gene (A Single Class Session):\n"
        "Think of a gene like a single Lego brick. Each gene contains six pieces of information:\n"
        "   Gene g = (Subject, Faculty, Batch, Room, Day, Period)\n"
        "• Fixed Information (The Curriculum Requirements): Subject, Professor, and Student Batch. We cannot change who teaches what.\n"
        "• Variable Information (What the Algorithm Decides): Room, Day (Mon–Fri), and Period (1–8)."
    )
    add_p(
        "2. The Chromosome (A Full Weekly Timetable):\n"
        "A chromosome is simply a chain of all the genes together. If an engineering department needs 60 lecture sessions across "
        "the week, one candidate timetable is an array of 60 genes: Chromosome C = [Gene 1, Gene 2, ..., Gene 60]."
    )

    add_h2("2.2 Hard Constraints: The Absolute Deal-Breakers")
    add_p(
        "In optimization, constraints are rules. We divide them into two categories: Hard Constraints and Soft Constraints. "
        "Hard constraints are non-negotiable physical laws. If a timetable violates even one hard constraint, it cannot be used:"
    )
    add_p("• Rule 1: No Faculty Double-Booking. A professor cannot teach two different classes at the exact same hour.")
    add_p("• Rule 2: No Student Batch Double-Booking. A section (e.g. 3rd Year Electrical) cannot attend two lectures at the same time.")
    add_p("• Rule 3: No Room Double-Booking. A classroom or laboratory cannot host two different classes simultaneously.")
    add_p("• Rule 4: Seating Capacity Limit. The assigned room must have enough seats for all students in the batch.")

    add_h2("2.3 Soft Constraints: Human Comfort and Quality")
    add_p(
        "Soft constraints do not make a timetable impossible, but they make it much better for humans. Nobody likes a poorly organized "
        "schedule. We reward schedules that respect three soft rules:"
    )
    add_p("• Rule 1: Minimize Faculty Waiting Gaps. If a professor teaches at 8:00 AM and has their next class at 4:00 PM, they have to sit around for 7 empty hours. We minimize these idle gaps.")
    add_p("• Rule 2: Minimize Student Waiting Gaps. Students should have clean, compact schedules without awkward 2-hour empty gaps between lectures.")
    add_p("• Rule 3: Spread Subject Lectures Evenly. A 3-credit subject should meet on Monday, Wednesday, and Friday—not crammed into three back-to-back lectures on Monday morning.")

    add_h2("2.4 The Cost and Fitness Score Formulas")
    add_p(
        "To tell the computer how good or bad a timetable is, we calculate a Penalty Cost. Hard clashes receive an enormous penalty "
        "(1000 penalty points each), while soft gaps receive small penalties (5 to 15 points):"
    )
    
    add_p("Total Penalty Cost = (1000 × Hard Clashes) + (10 × Faculty Gaps) + (5 × Student Gaps) + (15 × Clustering)",
          align=WD_ALIGN_PARAGRAPH.CENTER, bold=True)

    add_p(
        "In Genetic Algorithms, we want to maximize Fitness (higher is better), but our cost function calculates penalties (lower is better). "
        "We convert cost into a clean normalized fitness score using this simple formula:"
    )

    add_p("Fitness = 1.0 / (1.0 + Total Penalty Cost)", align=WD_ALIGN_PARAGRAPH.CENTER, bold=True)

    add_p(
        "Let us look at two simple examples:\n"
        "• Example A (Bad Timetable with 5 clashes): Cost = 5000+ points. Fitness = 1 / 5001 = 0.0002. This schedule is terrible and will be eliminated immediately.\n"
        "• Example B (Perfect Timetable with 0 clashes and 0 gaps): Cost = 0.0 points. Fitness = 1 / (1 + 0) = 1.0000. This is the absolute mathematical maximum!"
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 3: THE GENETIC ALGORITHM METHODOLOGY
    # =========================================================================
    add_h1("Chapter 3: The Genetic Algorithm Methodology")
    
    add_h2("3.1 The Evolutionary Cycle: Natural Selection at Work")
    add_p(
        "How does a Genetic Algorithm actually find a perfect timetable without testing all 10²⁰⁸ combinations? It works exactly like "
        "breeding in nature. In nature, the healthiest animals survive, reproduce, and pass on their good genes to their offspring. "
        "Over many generations, the species becomes stronger, faster, and smarter."
    )
    add_p(
        "In our software, candidate timetables are the 'animals'. Clash-ridden timetables die out quickly, while clash-free timetables "
        "mate with each other to produce even better offspring. The entire process follows 8 clear steps:"
    )

    add_h2("3.2 Step 1: Population Initialization")
    add_p(
        "The algorithm begins by creating an initial pool of 60 candidate timetables. At this starting point, the computer assigns "
        "rooms, days, and periods largely at random. As you would expect, almost every schedule in Generation 1 is full of overlaps "
        "and has a high cost (around 105 points)."
    )

    add_h2("3.3 Step 2: Scoring the Schedules")
    add_p(
        "Every single candidate timetable in the population is inspected by our constraint engine. The engine counts every double-booked "
        "professor, classroom, and batch, calculates the penalty cost, and gives each timetable a fitness score between 0.0 and 1.0."
    )

    add_h2("3.4 Step 3: Tournament Selection (Picking the Best Parents)")
    add_p(
        "We cannot let bad timetables breed, but we also cannot pick only the single best timetable (that would eliminate diversity). "
        "Instead, we hold mini-tournaments: three random timetables are chosen from the population. The one with the highest fitness "
        "wins the tournament and gets chosen to become a parent. This gives good timetables a high chance of reproducing while keeping "
        "the population diverse."
    )

    add_h2("3.5 Step 4: Two-Point Crossover (Combining Good Schedules)")
    add_p(
        "Once two fit parent timetables are selected, they mate to create two new child timetables. We use Two-Point Crossover: the "
        "algorithm picks two cut-points along the class list, takes the middle section of classes from Parent A, and takes the remaining "
        "classes from Parent B. The result is a child timetable that inherits the clash-free morning block from Mom and the clash-free "
        "afternoon block from Dad."
    )

    add_h2("3.6 Step 5: Gene Mutation (Adding Variety to Avoid Traps)")
    add_p(
        "If you only combine existing parents, you might eventually run out of new ideas. With a 10% probability, the algorithm mutates "
        "a few class sessions in the child: randomly moving a class to another day or assigning it to a different room. This introduces "
        "fresh variety and ensures the search never gets stuck in a dead-end."
    )

    add_h2("3.7 Step 6: Heuristic Repair (Our Secret Weapon)")
    add_p(
        "In standard genetic algorithms, random crossover and mutation can accidentally create new clashes. Standard algorithms just "
        "penalize the child and hope for the best. Our system is much smarter: we added an active Heuristic Constraint Repair pass. "
        "Whenever a child timetable has an overlap, the repair operator immediately finds an empty, valid room and time slot and moves "
        "the class there. This active healing is why our algorithm eliminates all clashes in less than one second!"
    )

    add_h2("3.8 Step 7 & 8: Elitism and Early Stagnation Stop")
    add_p(
        "• Elitism (Top 4 Preserved): The best 4 timetables of each generation are automatically saved and passed directly into the next "
        "generation without any changes. This guarantees that once a good timetable is discovered, it is never lost.\n"
        "• Early Stagnation Stop: Even if you set the slider to 200 generations, the algorithm is smart enough to know when to stop. "
        "If it achieves zero clashes and the score stays at 0.0 for 40 consecutive generations, it stops immediately. That is why it "
        "completes at Generation 54 instead of wasting time running all the way to 200!"
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 4: SYSTEM ARCHITECTURE & APPLICATION INTERFACE
    # =========================================================================
    add_h1("Chapter 4: System Architecture and Application Interface")
    
    add_h2("4.1 How the Software is Built (Backend and Frontend)")
    add_p(
        "The project is built using a modern, decoupled full-stack architecture:\n"
        "1. Backend Engine (Python 3.10 with FastAPI): This is the brain. It holds the chromosome data structures, checks constraints, "
        "runs the selection, crossover, mutation, and repair operators, and streams generation statistics in real-time.\n"
        "2. Frontend Dashboard (Next.js 14 with TypeScript and Tailwind CSS): This is the user interface. It connects to the Python engine, "
        "displays live metric cards, draws convergence graphs, and renders the symmetrical weekly schedule matrix.\n"
        "3. Real-Time Streaming (Server-Sent Events - SSE): Traditional websites make you click a button and wait for a loading spinner. "
        "With SSE, our Python engine pushes updates generation-by-generation, allowing you to watch the timetable evolve in real time."
    )

    add_h2("4.2 Live Optimizer Dashboard & Timetable Grid")
    add_p(
        "Figure 1 shows the Live Optimizer dashboard captured from the running local application after evolution has completed. "
        "Notice the four metric cards at the top: Constraint Feasibility displays '0 conflicts', Objective Penalty Cost displays '0.0', "
        "Evolution Progress displays '54 / 200 gens', and Fitness displays a perfect '1.0000' achieved in just 0.78 seconds. "
        "Below the cards, the convergence chart shows the penalty dropping from 105 down to 0."
    )

    add_image_with_caption(
        os.path.join(os.getcwd(), "report_images", "01_live_optimizer_dashboard.png"),
        "Figure 1: Real-time Live Optimizer Dashboard showing completed evolution, 0 conflicts, 0.0 cost, and convergence curve."
    )

    add_p(
        "Figure 2 illustrates the resulting Symmetrical Weekly Class Schedule Matrix. Each row represents a weekday (Monday to Friday) "
        "and each column represents a teaching period from 8:00 AM to 5:00 PM. Notice the dedicated green column between Period 5 and "
        "Period 6 for the universal lunch break (1:00 PM – 2:00 PM). Every course displays the subject name, assigned faculty member, "
        "student batch, and room number with zero overlaps."
    )

    add_image_with_caption(
        os.path.join(os.getcwd(), "report_images", "02_timetable_grid.png"),
        "Figure 2: Populated Weekly Timetable Matrix displaying 8 periods with dedicated universal lunch break (1:00 PM – 2:00 PM)."
    )

    add_h2("4.3 The 6-Stage Operator Visualizer Suite")
    add_p(
        "For academic vivas and presentations, the application includes a dedicated Operator Visualizer tab. It breaks down the "
        "genetic algorithm into six step-by-step educational stages: Data to Encoding, Tournament Selection, Two-Point Crossover, "
        "Gene Mutation, Constraint Repair, and Final Timetable. Figure 3 shows the visualizer interface and problem encoding summary."
    )

    add_image_with_caption(
        os.path.join(os.getcwd(), "report_images", "03_operator_visualizer.png"),
        "Figure 3: Operator Visualizer interface demonstrating the problem modeling and chromosome gene structure."
    )

    add_p(
        "Figure 4 captures Stage 2 (Tournament Selection) inside the visualizer. It displays a tournament pool of three candidate "
        "chromosomes with their objective costs and fitness scores, visually highlighting the tournament winner that advances to the "
        "mating pool."
    )

    add_image_with_caption(
        os.path.join(os.getcwd(), "report_images", "04_tournament_selection.png"),
        "Figure 4: Tournament Selection Stage illustrating candidate pool evaluation and selected tournament winner."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 5: EXPERIMENTAL RESULTS, SLIDER EFFECTS & TESTING
    # =========================================================================
    add_h1("Chapter 5: Results, Testing and Performance Analysis")
    
    add_h2("5.1 Convergence Performance (From 105 Clashes to Zero in 0.78s)")
    add_p(
        "When you click 'Start GA Evolution', the algorithm executes with remarkable speed. Looking at the convergence chart in Figure 1, "
        "we can clearly see the three phases of optimization:\n"
        "• Phase 1 (Generations 1 to 4): Rapid Conflict Elimination. The random starting schedule has a cost of around 105. Tournament "
        "selection and heuristic repair quickly resolve the most obvious classroom and faculty collisions, dropping the cost to 25.\n"
        "• Phase 2 (Generations 5 to 14): Fine-Tuning. Crossover and mutation swap lingering conflicting classes into empty slots, driving "
        "hard conflicts down to exactly zero (Cost = 0.0, Fitness = 1.0000).\n"
        "• Phase 3 (Generations 15 to 54): Optimal Flatline. The schedule is already perfect. The 40-generation stagnation limit verifies "
        "stability and automatically stops at Generation 54 in just 0.78 seconds."
    )

    add_h2("5.2 Slider Sensitivity: What Happens When You Tweak Parameters")
    add_p(
        "The control panel lets you tweak four parameters. Here is exactly what happens when you adjust each slider:"
    )

    tbl_sens = doc.add_table(rows=5, cols=4)
    tbl_sens.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_sens.autofit = False
    
    sens_rows = [
        ("Parameter", "Default Value", "Effect of Decreasing", "Effect of Increasing"),
        ("Population Size", "60", "Runs faster per generation; lower diversity; risks getting stuck in local minima.", "Higher diversity; explores larger solution space; slightly more CPU time."),
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

    add_h2("5.3 Automated Testing with Pytest (29 Tests Passing)")
    add_p(
        "To ensure mathematical accuracy and prevent regression bugs, the backend is protected by an automated test suite written "
        "in pytest. All 29 tests pass consistently:\n"
        "• test_constraints.py (5 tests): Confirms 100% accuracy in detecting room clashes, faculty double-booking, and batch conflicts.\n"
        "• test_fitness.py (3 tests): Tests penalty weighting and reciprocal fitness math.\n"
        "• test_genetic_algorithm.py (15 tests): Tests tournament selection, two-point crossover, mutation, and constraint repair.\n"
        "• test_enhanced_features.py (6 tests): Validates real-time SSE streaming, scenario preset switching, and CSV timetable export."
    )

    doc.add_page_break()

    # =========================================================================
    # CHAPTER 6: CONCLUSION & FUTURE WORK
    # =========================================================================
    add_h1("Chapter 6: Conclusion and Future Roadmap")
    
    add_h2("6.1 Summary of Contributions")
    add_p(
        "In this project, we successfully formulated, designed, and deployed Timetable Optimizer to solve the university course "
        "scheduling problem using Constraint-Aware Genetic Algorithms. Key project contributions include:\n"
        "1. 100% Feasibility: Completely eliminates all physical faculty, room, and student overlaps.\n"
        "2. Sub-Second Speed: Generates optimal timetables in 0.78 seconds, replacing days of tedious manual scheduling.\n"
        "3. Authentic College Schedule: Implements an 8:00 AM to 5:00 PM day with an invariant 1:00 PM – 2:00 PM universal lunch pause.\n"
        "4. Heuristic Repair Innovation: Enhances standard genetic evolution with an active conflict-healing pass that guarantees rapid convergence.\n"
        "5. Interactive Educational Suite: Features a real-time streaming dashboard and an interactive 6-stage operator visualizer for viva presentations.\n"
        "6. Live Cloud Deployment: Successfully hosted and accessible globally on Vercel at https://frontend-azure-kappa-xbtipqbzto.vercel.app."
    )

    add_h2("6.2 Future Work")
    add_p(
        "Potential extensions for future development include:\n"
        "• Open Elective Course Scheduling: Supporting cross-departmental elective bundles where students from multiple branches merge.\n"
        "• Multi-Period Practical Labs: Scheduling contiguous 2-hour or 3-hour laboratory blocks with teaching assistants.\n"
        "• Faculty Personal Preferences: Allowing professors to indicate preferred teaching days or morning/afternoon windows.\n"
        "• Mobile App & Google Calendar Sync: Direct iCal feed generation to sync schedules into student and faculty mobile calendars."
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

    # Save to both paths
    pec_file = os.path.join(os.getcwd(), "Timetable_Optimizer_Project_Report_PEC.docx")
    doc.save(pec_file)
    print(f"Final report successfully created at: {pec_file}")

    primary_file = os.path.join(os.getcwd(), "Timetable_Optimizer_Project_Report.docx")
    try:
        doc.save(primary_file)
        print(f"Also updated primary file: {primary_file}")
    except PermissionError:
        print(f"Notice: {primary_file} is currently open in Word. Saved to {pec_file}")

if __name__ == "__main__":
    build_report()
