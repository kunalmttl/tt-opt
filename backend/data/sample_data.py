"""Generates a realistic sample university dataset so the app works out of the box."""
from __future__ import annotations
from backend.models.schemas import (
    DatasetInput, Subject, Faculty, Room, Batch, ScenarioMeta, ScenarioPreset
)

DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"]
PERIODS_PER_DAY = 6

_FACULTY_NAMES = [
    "Dr. A. Sharma", "Dr. B. Mehta", "Dr. C. Rao", "Dr. D. Iyer", "Dr. E. Nair",
    "Dr. F. Kapoor", "Dr. G. Desai", "Dr. H. Verma", "Dr. I. Joshi", "Dr. J. Pillai",
    "Dr. K. Bose", "Dr. L. Chatterjee", "Dr. M. Reddy", "Dr. N. Gupta", "Dr. O. Singh",
    "Dr. P. Khan", "Dr. Q. Patil", "Dr. R. Shah", "Dr. S. Menon", "Dr. T. Dutta",
]

_DEPARTMENTS = ["CSE", "AI & ML", "Mathematics", "Electronics"]

_SUBJECT_NAMES = [
    "Artificial Intelligence", "Machine Learning", "Deep Learning",
    "Database Management Systems", "Operating Systems", "Computer Networks",
    "Data Structures", "Algorithms", "Big Data Systems", "Software Engineering",
    "Web Technologies", "Cloud Computing", "Computer Architecture", "Mathematics-III",
    "Statistics for AI", "Natural Language Processing", "Computer Vision",
    "Reinforcement Learning", "Distributed Systems", "Compiler Design",
    "Theory of Computation", "Human-Computer Interaction", "Information Security",
    "Data Visualization", "Optimization Techniques", "Robotics Fundamentals",
    "Mobile Application Development", "DevOps Practices", "Blockchain Basics",
    "Ethics in AI",
]

_BATCH_NAMES = ["AIML-A", "AIML-B", "CSE-A", "CSE-B", "CSE-C"]

_ROOM_TYPES = ["Lecture", "Lab", "Seminar"]


def build_sample_dataset() -> DatasetInput:
    faculty = [
        Faculty(faculty_id=f"F{idx+1:02d}", name=name, department=_DEPARTMENTS[idx % len(_DEPARTMENTS)])
        for idx, name in enumerate(_FACULTY_NAMES)
    ]

    batches = [
        Batch(batch_id=f"B{idx+1}", name=name, student_count=45 + (idx * 5) % 30)
        for idx, name in enumerate(_BATCH_NAMES)
    ]

    rooms = []
    for idx in range(10):
        room_type = _ROOM_TYPES[idx % len(_ROOM_TYPES)]
        capacity = 40 if room_type == "Lab" else (80 if room_type == "Lecture" else 60)
        rooms.append(Room(room_id=f"R{idx+1:02d}", room_number=f"{'LT' if room_type=='Lecture' else 'LB' if room_type=='Lab' else 'SR'}-{idx+1}", capacity=capacity, room_type=room_type))

    subjects = []
    for idx, name in enumerate(_SUBJECT_NAMES):
        faculty_id = faculty[idx % len(faculty)].faculty_id
        batch_id = batches[idx % len(batches)].batch_id
        sessions = 3 if idx % 3 == 0 else (2 if idx % 3 == 1 else 4)
        expected_students = next(b.student_count for b in batches if b.batch_id == batch_id)
        preferred = "Lab" if "Programming" in name or name in ("Machine Learning", "Deep Learning", "Computer Vision") else None
        subjects.append(Subject(
            subject_id=f"S{idx+1:02d}",
            name=name,
            faculty_id=faculty_id,
            batch_id=batch_id,
            sessions_per_week=sessions,
            expected_students=expected_students,
            preferred_room_type=preferred,
        ))

    return DatasetInput(
        subjects=subjects,
        faculty=faculty,
        rooms=rooms,
        batches=batches,
        days=DAYS,
        periods_per_day=PERIODS_PER_DAY,
    )


def build_compact_dataset() -> DatasetInput:
    faculty = [
        Faculty(faculty_id=f"F{idx+1:02d}", name=_FACULTY_NAMES[idx], department=_DEPARTMENTS[idx % len(_DEPARTMENTS)])
        for idx in range(6)
    ]
    batches = [
        Batch(batch_id=f"B{idx+1}", name=_BATCH_NAMES[idx], student_count=40)
        for idx in range(2)
    ]
    rooms = [
        Room(room_id="R01", room_number="LT-1", capacity=60, room_type="Lecture"),
        Room(room_id="R02", room_number="LT-2", capacity=60, room_type="Lecture"),
        Room(room_id="R03", room_number="LB-1", capacity=45, room_type="Lab"),
        Room(room_id="R04", room_number="SR-1", capacity=50, room_type="Seminar"),
    ]
    subjects = []
    for idx in range(8):
        f_id = faculty[idx % len(faculty)].faculty_id
        b_id = batches[idx % len(batches)].batch_id
        subjects.append(
            Subject(
                subject_id=f"S{idx+1:02d}",
                name=_SUBJECT_NAMES[idx],
                faculty_id=f_id,
                batch_id=b_id,
                sessions_per_week=2,
                expected_students=40,
                preferred_room_type="Lab" if idx == 1 else "Lecture",
            )
        )
    return DatasetInput(
        subjects=subjects,
        faculty=faculty,
        rooms=rooms,
        batches=batches,
        days=["Mon", "Tue", "Wed", "Thu", "Fri"],
        periods_per_day=4,
    )


def build_high_constraint_dataset() -> DatasetInput:
    faculty = [
        Faculty(faculty_id=f"F{idx+1:02d}", name=_FACULTY_NAMES[idx], department=_DEPARTMENTS[idx % len(_DEPARTMENTS)])
        for idx in range(8)
    ]
    batches = [
        Batch(batch_id=f"B{idx+1}", name=_BATCH_NAMES[idx], student_count=50)
        for idx in range(4)
    ]
    rooms = [
        Room(room_id="R01", room_number="LT-101", capacity=60, room_type="Lecture"),
        Room(room_id="R02", room_number="LT-102", capacity=60, room_type="Lecture"),
        Room(room_id="R03", room_number="LB-101", capacity=55, room_type="Lab"),
        Room(room_id="R04", room_number="SR-101", capacity=50, room_type="Seminar"),
    ]
    subjects = []
    for idx in range(18):
        f_id = faculty[idx % len(faculty)].faculty_id
        b_id = batches[idx % len(batches)].batch_id
        subjects.append(
            Subject(
                subject_id=f"S{idx+1:02d}",
                name=_SUBJECT_NAMES[idx],
                faculty_id=f_id,
                batch_id=b_id,
                sessions_per_week=3,
                expected_students=50,
                preferred_room_type="Lab" if idx % 4 == 0 else "Lecture",
            )
        )
    return DatasetInput(
        subjects=subjects,
        faculty=faculty,
        rooms=rooms,
        batches=batches,
        days=["Mon", "Tue", "Wed", "Thu", "Fri"],
        periods_per_day=5,
    )


def get_all_presets() -> list[ScenarioPreset]:
    standard = build_sample_dataset()
    compact = build_compact_dataset()
    high_constraint = build_high_constraint_dataset()

    return [
        ScenarioPreset(
            metadata=ScenarioMeta(
                id="standard-university",
                name="Standard Engineering College",
                description="Realistic university curriculum with 30 subjects, 20 professors, and 10 rooms across 5 batches.",
                difficulty="Moderate",
                num_subjects=len(standard.subjects),
                num_faculty=len(standard.faculty),
                num_rooms=len(standard.rooms),
                num_batches=len(standard.batches),
            ),
            dataset=standard,
        ),
        ScenarioPreset(
            metadata=ScenarioMeta(
                id="compact-demo",
                name="Fast Interactive Demo",
                description="Lightweight department schedule with 8 subjects and 4 rooms. Optimized for instant live demonstrations.",
                difficulty="Easy",
                num_subjects=len(compact.subjects),
                num_faculty=len(compact.faculty),
                num_rooms=len(compact.rooms),
                num_batches=len(compact.batches),
            ),
            dataset=compact,
        ),
        ScenarioPreset(
            metadata=ScenarioMeta(
                id="high-constraint",
                name="High-Congestion Stress Test",
                description="Dense schedule with 18 courses competing for only 4 rooms, demonstrating robust conflict resolution.",
                difficulty="Hard",
                num_subjects=len(high_constraint.subjects),
                num_faculty=len(high_constraint.faculty),
                num_rooms=len(high_constraint.rooms),
                num_batches=len(high_constraint.batches),
            ),
            dataset=high_constraint,
        ),
    ]


def get_preset_by_id(scenario_id: str) -> ScenarioPreset | None:
    for preset in get_all_presets():
        if preset.metadata.id == scenario_id:
            return preset
    return None
