"use client";

import React, { useState, useMemo } from "react";
import { Download, Filter, User, MapPin } from "lucide-react";
import { GeneOut, DatasetInput } from "@/lib/types";
import { exportCsv } from "@/lib/api";

interface TimetableGridProps {
  timetable: GeneOut[];
  dataset: DatasetInput;
}

export const TimetableGrid: React.FC<TimetableGridProps> = ({ timetable, dataset }) => {
  const [selectedBatch, setSelectedBatch] = useState<string>("all");
  const [selectedFaculty, setSelectedFaculty] = useState<string>("all");
  const [selectedRoom, setSelectedRoom] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);

  const days = dataset.days || ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const periods = Array.from({ length: dataset.periods_per_day || 6 }, (_, i) => i + 1);

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
      link.setAttribute("download", `timetable_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Export error", e);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="p-8 rounded-3xl border border-surface-border bg-gradient-to-b from-surface to-[#0c0e11] flex flex-col gap-6 shadow-sm">
      {/* Header and Filter Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-mono tracking-widest uppercase text-muted">
            Optimized Schedule
          </span>
          <h2 className="text-base font-semibold text-white tracking-tight mt-0.5">
            Weekly Class Matrix
          </h2>
          <p className="text-xs text-muted mt-1 font-mono">
            Showing {filteredGenes.length} of {timetable.length} assigned lecture slots
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

      {/* Spacious Table View */}
      {timetable.length === 0 ? (
        <div className="h-72 rounded-2xl border border-dashed border-surface-border flex items-center justify-center text-muted text-xs font-mono">
          No active timetable yet. Click &quot;Start GA Evolution&quot; to optimize sessions.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[850px] border border-surface-border rounded-2xl overflow-hidden bg-surface">
            {/* Table Header */}
            <div className="grid grid-cols-7 bg-surface-raised/70 border-b border-surface-border text-xs text-muted font-medium">
              <div className="p-4 border-r border-surface-border font-mono text-[11px] text-neutral-400">
                Day \ Period
              </div>
              {periods.map((p) => (
                <div
                  key={p}
                  className="p-4 border-r last:border-r-0 border-surface-border text-center font-mono text-[11px] text-white"
                >
                  Period {p}
                </div>
              ))}
            </div>

            {/* Table Rows */}
            {days.map((day) => (
              <div
                key={day}
                className="grid grid-cols-7 border-b last:border-b-0 border-surface-border hover:bg-white/[0.015] transition-colors"
              >
                {/* Day Header */}
                <div className="p-4 border-r border-surface-border font-mono text-xs font-medium text-lime flex items-center justify-center bg-surface-raised/30">
                  {day}
                </div>

                {/* Slots */}
                {periods.map((period) => {
                  const genes = slotMap.get(`${day}-${period}`) || [];
                  return (
                    <div
                      key={`${day}-${period}`}
                      className="p-3 border-r last:border-r-0 border-surface-border min-h-[110px] flex flex-col gap-2"
                    >
                      {genes.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[10px] text-neutral-700 font-mono">
                          —
                        </div>
                      ) : (
                        genes.map((gene, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl border border-surface-border bg-surface-raised/90 flex flex-col gap-1.5 text-[11px] transition-all hover:border-lime-border group"
                          >
                            <div
                              className="font-medium text-white truncate text-xs"
                              title={gene.subject_name}
                            >
                              {gene.subject_name}
                            </div>

                            <div className="flex items-center gap-1.5 text-muted truncate text-[10px]">
                              <User className="h-3 w-3 shrink-0 text-neutral-400" />
                              <span className="truncate">{gene.faculty_name}</span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1 pt-1.5 border-t border-surface-border">
                              <span className="font-mono text-lime">{gene.batch_name}</span>
                              <span className="flex items-center gap-1 font-mono text-muted">
                                <MapPin className="h-2.5 w-2.5" />
                                {gene.room_number}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
