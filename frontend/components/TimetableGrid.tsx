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

  // Filtered genes
  const filteredGenes = useMemo(() => {
    return timetable.filter((g) => {
      if (selectedBatch !== "all" && g.batch_id !== selectedBatch) return false;
      if (selectedFaculty !== "all" && g.faculty_id !== selectedFaculty) return false;
      if (selectedRoom !== "all" && g.room_id !== selectedRoom) return false;
      return true;
    });
  }, [timetable, selectedBatch, selectedFaculty, selectedRoom]);

  // Lookup map: `${day}-${period}` -> GeneOut[]
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
      link.setAttribute("download", `timetable_schedule_${new Date().toISOString().slice(0, 10)}.csv`);
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
    <div className="p-6 rounded-xl border border-border bg-surface flex flex-col gap-6">
      {/* Header and Filters Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-medium text-white tracking-tight">
            Schedule Matrix
          </h2>
          <p className="text-xs text-muted mt-0.5">
            Showing {filteredGenes.length} of {timetable.length} total scheduled sessions
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Batch Filter */}
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <Filter className="h-3.5 w-3.5" />
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="bg-surface-raised border border-border text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
            >
              <option value="all">All Batches</option>
              {dataset.batches.map((b) => (
                <option key={b.batch_id} value={b.batch_id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Faculty Filter */}
          <select
            value={selectedFaculty}
            onChange={(e) => setSelectedFaculty(e.target.value)}
            className="bg-surface-raised border border-border text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Faculty</option>
            {dataset.faculty.map((f) => (
              <option key={f.faculty_id} value={f.faculty_id}>
                {f.name}
              </option>
            ))}
          </select>

          {/* Room Filter */}
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="bg-surface-raised border border-border text-neutral-200 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
          >
            <option value="all">All Rooms</option>
            {dataset.rooms.map((r) => (
              <option key={r.room_id} value={r.room_id}>
                {r.room_number} ({r.room_type})
              </option>
            ))}
          </select>

          {/* CSV Export */}
          <button
            onClick={handleExportCsv}
            disabled={timetable.length === 0 || isExporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-neutral-300 hover:text-white hover:bg-surface-raised text-xs font-medium transition-colors disabled:opacity-40"
          >
            <Download className="h-3.5 w-3.5" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </button>
        </div>
      </div>

      {/* Spacious Grid View */}
      {timetable.length === 0 ? (
        <div className="h-64 rounded-lg border border-dashed border-border flex items-center justify-center text-muted text-xs">
          No active timetable. Start the Genetic Algorithm optimizer above to generate a schedule.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[800px] border border-border rounded-lg overflow-hidden">
            {/* Table Header (Periods) */}
            <div className="grid grid-cols-7 bg-surface-raised border-b border-border text-xs text-muted font-medium">
              <div className="p-3.5 border-r border-border font-mono text-[11px] text-neutral-400">
                Day \ Period
              </div>
              {periods.map((p) => (
                <div key={p} className="p-3.5 border-r last:border-r-0 border-border text-center font-mono">
                  Period {p}
                </div>
              ))}
            </div>

            {/* Table Rows (Days) */}
            {days.map((day) => (
              <div
                key={day}
                className="grid grid-cols-7 border-b last:border-b-0 border-border bg-surface/50 hover:bg-surface transition-colors"
              >
                {/* Day Label */}
                <div className="p-4 border-r border-border font-medium text-xs text-white flex items-center justify-center bg-surface-raised/40">
                  {day}
                </div>

                {/* Period Cells */}
                {periods.map((period) => {
                  const genes = slotMap.get(`${day}-${period}`) || [];
                  return (
                    <div
                      key={`${day}-${period}`}
                      className="p-2.5 border-r last:border-r-0 border-border min-h-[110px] flex flex-col gap-2"
                    >
                      {genes.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-[11px] text-neutral-600 font-mono">
                          —
                        </div>
                      ) : (
                        genes.map((gene, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-lg border border-border bg-surface-raised flex flex-col gap-1 text-[11px] transition-all hover:border-neutral-500"
                          >
                            <div className="font-medium text-white truncate" title={gene.subject_name}>
                              {gene.subject_name}
                            </div>

                            <div className="flex items-center gap-1.5 text-muted truncate">
                              <User className="h-3 w-3 shrink-0" />
                              <span className="truncate">{gene.faculty_name}</span>
                            </div>

                            <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1 pt-1 border-t border-border/60">
                              <span className="font-mono text-neutral-300">{gene.batch_name}</span>
                              <span className="flex items-center gap-1 font-mono text-neutral-400">
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
