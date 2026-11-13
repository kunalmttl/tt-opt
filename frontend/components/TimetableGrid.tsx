"use client";

import React, { useState, useMemo } from "react";
import { Download, Filter, User, MapPin, Coffee, Clock } from "lucide-react";
import { GeneOut, DatasetInput } from "@/lib/types";
import { exportCsv } from "@/lib/api";

interface TimetableGridProps {
  timetable: GeneOut[];
  dataset: DatasetInput;
}

const PERIOD_TIMES: Record<number, { label: string; time: string }> = {
  1: { label: "Period 1", time: "08:00 - 09:00 AM" },
  2: { label: "Period 2", time: "09:00 - 10:00 AM" },
  3: { label: "Period 3", time: "10:00 - 11:00 AM" },
  4: { label: "Period 4", time: "11:00 - 12:00 PM" },
  5: { label: "Period 5", time: "12:00 - 01:00 PM" },
  6: { label: "Period 6", time: "02:00 - 03:00 PM" },
  7: { label: "Period 7", time: "03:00 - 04:00 PM" },
  8: { label: "Period 8", time: "04:00 - 05:00 PM" },
};

export const TimetableGrid: React.FC<TimetableGridProps> = ({ timetable, dataset }) => {
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all");
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);

  const days = dataset.days || ["Mon", "Tue", "Wed", "Thu", "Fri"];

  const filteredGenes = useMemo(() => {
    return timetable.filter((g) => {
      if (selectedBatch !== "all" && g.batch_id !== selectedBatch) return false;
      if (selectedFaculty !== "all" && g.faculty_id !== selectedFaculty) return false;
      if (selectedRoom !== "all" && g.room_id !== selectedRoom) return false;
      return true;
    });
  }, [timetable, selectedBatch, selectedFaculty, selectedRoom]);

  const slotMap = useMemo(() => {
    const map = new Map<string, GeneOut[]>();
    for (const gene of filteredGenes) {
      const key = `${gene.day}-${gene.period}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(gene);
    }
    return map;
  }, [filteredGenes]);

  const handleExportCsv = async () => {
    if (timetable.length === 0) return;
    try {
      setIsExporting(true);
      const csvData = await exportCsv(timetable);
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `college_timetable_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Export error", e);
    } finally {
      setIsExporting(false);
    }
  };

  const renderPeriodCell = (day: string, period: number) => {
    const genes = slotMap.get(`${day}-${period}`) || [];
    return (
      <div
        key={`${day}-${period}`}
        className="p-2 border-r last:border-r-0 border-surface-border min-h-[110px] min-w-0 flex flex-col justify-center gap-1.5 overflow-hidden"
      >
        {genes.length === 0 ? (
          <div className="h-full flex items-center justify-center text-[10px] text-neutral-700 font-mono">
            —
          </div>
        ) : (
          genes.map((gene, idx) => (
            <div
              key={idx}
              className="p-2.5 rounded-xl border border-surface-border bg-surface-raised/95 flex flex-col gap-1 text-[11px] min-w-0 overflow-hidden shadow-sm hover:border-lime-border transition-all"
            >
              <div
                className="font-medium text-white truncate text-xs leading-tight"
                title={gene.subject_name}
              >
                {gene.subject_name}
              </div>

              <div className="flex items-center gap-1 text-muted truncate text-[10px]">
                <User className="h-3 w-3 shrink-0 text-neutral-400" />
                <span className="truncate">{gene.faculty_name}</span>
              </div>

              <div className="flex items-center justify-between text-[10px] mt-1 pt-1 border-t border-surface-border/70 min-w-0 gap-1 font-mono">
                <span className="text-lime truncate">{gene.batch_name}</span>
                <span className="flex items-center gap-0.5 text-muted shrink-0 whitespace-nowrap">
                  <MapPin className="h-2.5 w-2.5" />
                  {gene.room_number}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="p-8 rounded-3xl border border-surface-border bg-gradient-to-b from-surface to-[#0c0e11] flex flex-col gap-6 shadow-sm">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest uppercase text-muted">
              College Timetable
            </span>
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-raised border border-surface-border text-[10px] font-mono text-neutral-300">
              <Clock className="h-3 w-3 text-lime" />
              8:00 AM – 5:00 PM • Lunch: 1:00 – 2:00 PM
            </span>
          </div>
          <h2 className="text-base font-semibold text-white tracking-tight mt-0.5">
            Weekly Class Schedule Matrix
          </h2>
          <p className="text-xs text-muted mt-1 font-mono">
            Showing {filteredGenes.length} of {timetable.length} assigned lecture sessions
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Batch Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-surface-raised border border-surface-border text-xs">
            <Filter className="h-3 w-3 text-muted" />
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#13161a]">All Batches</option>
              {dataset.batches.map((b) => (
                <option key={b.batch_id} value={b.batch_id} className="bg-[#13161a]">
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Faculty Selector */}
          <div className="px-3 py-1.5 rounded-2xl bg-surface-raised border border-surface-border text-xs">
            <select
              value={selectedFaculty}
              onChange={(e) => setSelectedFaculty(e.target.value)}
              className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#13161a]">All Faculty</option>
              {dataset.faculty.map((f) => (
                <option key={f.faculty_id} value={f.faculty_id} className="bg-[#13161a]">
                  {f.name}
                </option>
              ))}
            </select>
          </div>

          {/* Room Selector */}
          <div className="px-3 py-1.5 rounded-2xl bg-surface-raised border border-surface-border text-xs">
            <select
              value={selectedRoom}
              onChange={(e) => setSelectedRoom(e.target.value)}
              className="bg-transparent text-white font-mono text-xs focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#13161a]">All Rooms</option>
              {dataset.rooms.map((r) => (
                <option key={r.room_id} value={r.room_id} className="bg-[#13161a]">
                  {r.room_number} ({r.room_type})
                </option>
              ))}
            </select>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            disabled={timetable.length === 0 || isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-surface-border text-neutral-300 hover:text-white hover:bg-surface-raised text-xs font-medium transition-all disabled:opacity-30"
          >
            <Download className="h-3.5 w-3.5 text-lime" />
            <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
          </button>
        </div>
      </div>

      {/* College Table View with Morning, Lunch, and Afternoon Periods */}
      {timetable.length === 0 ? (
        <div className="h-72 rounded-2xl border border-dashed border-surface-border flex items-center justify-center text-muted text-xs font-mono">
          No active timetable yet. Click &quot;Start GA Evolution&quot; to optimize sessions across 8 AM – 5 PM.
        </div>
      ) : (
        <div className="overflow-x-auto w-full">
          <div className="min-w-[980px] w-full border border-surface-border rounded-2xl overflow-hidden bg-surface">
            {/* Table Header: Day (64px) | Periods 1-5 (minmax(0, 1fr)) | LUNCH (44px) | Periods 6-8 (minmax(0, 1fr)) */}
            <div className="grid grid-cols-[64px_repeat(5,minmax(0,1fr))_44px_repeat(3,minmax(0,1fr))] bg-surface-raised/70 border-b border-surface-border text-xs text-muted font-medium">
              <div className="p-3 border-r border-surface-border font-mono text-[11px] text-neutral-400 flex items-center justify-center">
                Day
              </div>

              {/* Periods 1 to 5 (Morning) */}
              {[1, 2, 3, 4, 5].map((p) => (
                <div
                  key={p}
                  className="p-3 border-r border-surface-border text-center flex flex-col justify-center min-w-0"
                >
                  <span className="font-mono text-xs text-white font-medium truncate">
                    {PERIOD_TIMES[p].label}
                  </span>
                  <span className="text-[10px] text-muted font-mono mt-0.5 truncate">
                    {PERIOD_TIMES[p].time}
                  </span>
                </div>
              ))}

              {/* LUNCH BREAK COLUMN HEADER */}
              <div className="p-2 border-r border-surface-border text-center bg-[#151a13] flex flex-col justify-center items-center">
                <Coffee className="h-3 w-3 text-lime" />
                <span className="text-[9px] font-mono text-lime font-medium mt-0.5">
                  LUNCH
                </span>
                <span className="text-[8px] text-lime/70 font-mono">
                  1-2 PM
                </span>
              </div>

              {/* Periods 6 to 8 (Afternoon) */}
              {[6, 7, 8].map((p) => (
                <div
                  key={p}
                  className="p-3 border-r last:border-r-0 border-surface-border text-center flex flex-col justify-center min-w-0"
                >
                  <span className="font-mono text-xs text-white font-medium truncate">
                    {PERIOD_TIMES[p].label}
                  </span>
                  <span className="text-[10px] text-muted font-mono mt-0.5 truncate">
                    {PERIOD_TIMES[p].time}
                  </span>
                </div>
              ))}
            </div>

            {/* Table Rows per Day */}
            {days.map((day) => (
              <div
                key={day}
                className="grid grid-cols-[64px_repeat(5,minmax(0,1fr))_44px_repeat(3,minmax(0,1fr))] border-b last:border-b-0 border-surface-border hover:bg-white/[0.015] transition-colors"
              >
                {/* Day Header */}
                <div className="p-4 border-r border-surface-border font-mono text-xs font-semibold text-lime flex items-center justify-center bg-surface-raised/30">
                  {day}
                </div>

                {/* Periods 1 to 5 */}
                {[1, 2, 3, 4, 5].map((period) => renderPeriodCell(day, period))}

                {/* Lunch Break Divider Cell */}
                <div className="border-r border-surface-border bg-gradient-to-b from-[#141a12]/60 to-[#10140e]/60 flex flex-col items-center justify-center p-1 text-center select-none">
                  <span className="text-[9px] font-mono text-lime/70 uppercase tracking-widest [writing-mode:vertical-lr] rotate-180">
                    LUNCH BREAK
                  </span>
                </div>

                {/* Periods 6 to 8 */}
                {[6, 7, 8].map((period) => renderPeriodCell(day, period))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
