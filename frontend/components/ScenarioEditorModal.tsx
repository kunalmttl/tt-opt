"use client";

import React, { useState } from "react";
import { X, Layers, Users, BookOpen, MapPin, Check } from "lucide-react";
import { DatasetInput, ScenarioPreset } from "@/lib/types";

interface ScenarioEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  dataset: DatasetInput;
  setDataset: (data: DatasetInput) => void;
  presets: ScenarioPreset[];
  onSelectPreset: (presetId: string) => void;
  currentPresetId: string;
}

export const ScenarioEditorModal: React.FC<ScenarioEditorModalProps> = ({
  isOpen,
  onClose,
  dataset,
  setDataset,
  presets,
  onSelectPreset,
  currentPresetId,
}) => {
  const [activeTab, setActiveTab] = useState<"presets" | "subjects" | "rooms" | "faculty">("presets");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-surface to-[#0c0e11] border border-surface-border rounded-3xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-7 border-b border-surface-border flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-lime uppercase tracking-widest">
              Curriculum Data Manager
            </span>
            <h2 className="text-base font-semibold text-white tracking-tight mt-0.5">
              Scenario Data & In-App Editor
            </h2>
            <p className="text-xs text-muted mt-1 font-sans">
              Select standard benchmark presets or fine-tune constraints in real time.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 rounded-2xl text-muted hover:text-white hover:bg-surface-raised border border-transparent hover:border-surface-border transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-surface-border bg-surface-raised/40 px-6 gap-2">
          {[
            { id: "presets", label: "Scenario Presets", icon: Layers },
            { id: "subjects", label: `Subjects (${dataset.subjects.length})`, icon: BookOpen },
            { id: "rooms", label: `Rooms (${dataset.rooms.length})`, icon: MapPin },
            { id: "faculty", label: `Faculty (${dataset.faculty.length})`, icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-medium font-mono transition-all ${
                  isActive
                    ? "border-lime text-lime"
                    : "border-transparent text-muted hover:text-neutral-200"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-7 overflow-y-auto flex-1">
          {/* Preset Selector */}
          {activeTab === "presets" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {presets.map((preset) => {
                const isSelected = preset.metadata.id === currentPresetId;
                return (
                  <div
                    key={preset.metadata.id}
                    onClick={() => onSelectPreset(preset.metadata.id)}
                    className={`p-6 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                      isSelected
                        ? "border-lime-border bg-surface-raised ring-1 ring-lime/20 shadow-[0_0_20px_rgba(212,249,56,0.1)]"
                        : "border-surface-border bg-surface hover:border-neutral-600"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-surface-raised border border-surface-border text-muted">
                          {preset.metadata.difficulty}
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-lime" />}
                      </div>

                      <h3 className="text-sm font-semibold text-white mt-4">
                        {preset.metadata.name}
                      </h3>
                      <p className="text-xs text-muted mt-1 leading-relaxed font-sans">
                        {preset.metadata.description}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-surface-border grid grid-cols-2 gap-2 text-[11px] font-mono text-muted">
                      <span>{preset.metadata.num_subjects} Subjects</span>
                      <span>{preset.metadata.num_faculty} Faculty</span>
                      <span>{preset.metadata.num_rooms} Rooms</span>
                      <span>{preset.metadata.num_batches} Batches</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Subjects List */}
          {activeTab === "subjects" && (
            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-12 text-[11px] text-muted px-3 py-1 border-b border-surface-border">
                <span className="col-span-1">ID</span>
                <span className="col-span-5">Subject Name</span>
                <span className="col-span-2">Batch</span>
                <span className="col-span-2">Sessions/Wk</span>
                <span className="col-span-2">Type</span>
              </div>
              {dataset.subjects.map((s, idx) => (
                <div
                  key={s.subject_id}
                  className="grid grid-cols-12 items-center p-3.5 rounded-xl border border-surface-border bg-surface-raised/40 hover:bg-surface-raised transition-all"
                >
                  <span className="col-span-1 text-muted">{s.subject_id}</span>
                  <span className="col-span-5 text-white font-medium truncate pr-2 font-sans">{s.name}</span>
                  <span className="col-span-2 text-lime">{s.batch_id}</span>
                  <div className="col-span-2">
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={s.sessions_per_week}
                      onChange={(e) => {
                        const val = Math.max(1, Number(e.target.value));
                        const updated = [...dataset.subjects];
                        updated[idx] = { ...s, sessions_per_week: val };
                        setDataset({ ...dataset, subjects: updated });
                      }}
                      className="w-14 px-2 py-1 bg-surface border border-surface-border text-white text-xs rounded-lg font-mono focus:outline-none"
                    />
                  </div>
                  <span className="col-span-2 text-muted">{s.preferred_room_type || "Standard"}</span>
                </div>
              ))}
            </div>
          )}

          {/* Rooms List */}
          {activeTab === "rooms" && (
            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-12 text-[11px] text-muted px-3 py-1 border-b border-surface-border">
                <span className="col-span-2">Room ID</span>
                <span className="col-span-4">Room Number</span>
                <span className="col-span-3">Capacity</span>
                <span className="col-span-3">Type</span>
              </div>
              {dataset.rooms.map((r, idx) => (
                <div
                  key={r.room_id}
                  className="grid grid-cols-12 items-center p-3.5 rounded-xl border border-surface-border bg-surface-raised/40"
                >
                  <span className="col-span-2 text-muted">{r.room_id}</span>
                  <span className="col-span-4 text-white font-medium">{r.room_number}</span>
                  <div className="col-span-3">
                    <input
                      type="number"
                      min={20}
                      max={200}
                      value={r.capacity}
                      onChange={(e) => {
                        const val = Math.max(10, Number(e.target.value));
                        const updated = [...dataset.rooms];
                        updated[idx] = { ...r, capacity: val };
                        setDataset({ ...dataset, rooms: updated });
                      }}
                      className="w-20 px-2 py-1 bg-surface border border-surface-border text-white text-xs rounded-lg font-mono focus:outline-none"
                    />
                  </div>
                  <span className="col-span-3 text-muted">{r.room_type}</span>
                </div>
              ))}
            </div>
          )}

          {/* Faculty List */}
          {activeTab === "faculty" && (
            <div className="space-y-3 font-mono text-xs">
              <div className="grid grid-cols-12 text-[11px] text-muted px-3 py-1 border-b border-surface-border">
                <span className="col-span-2">ID</span>
                <span className="col-span-6">Faculty Name</span>
                <span className="col-span-4">Department</span>
              </div>
              {dataset.faculty.map((f) => (
                <div
                  key={f.faculty_id}
                  className="grid grid-cols-12 items-center p-3.5 rounded-xl border border-surface-border bg-surface-raised/40"
                >
                  <span className="col-span-2 text-muted">{f.faculty_id}</span>
                  <span className="col-span-6 text-white font-medium font-sans">{f.name}</span>
                  <span className="col-span-4 text-muted">{f.department}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-surface-border flex justify-end gap-3 bg-surface-raised/30">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-2xl bg-lime hover:bg-lime-hover text-black font-semibold text-xs transition-all shadow-[0_0_15px_rgba(212,249,56,0.2)]"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
