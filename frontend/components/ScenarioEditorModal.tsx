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
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-medium text-white tracking-tight">
              Scenario Data & In-App Editor
            </h2>
            <p className="text-xs text-muted mt-0.5">
              Select standard benchmark presets or fine-tune curriculum constraints in real time.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted hover:text-white hover:bg-surface-raised transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Strip */}
        <div className="flex border-b border-border bg-surface-raised/40 px-6 gap-2">
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
                className={`flex items-center gap-2 py-3 px-4 border-b-2 text-xs font-medium transition-colors ${
                  isActive
                    ? "border-white text-white"
                    : "border-transparent text-muted hover:text-neutral-300"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Preset Selector */}
          {activeTab === "presets" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {presets.map((preset) => {
                const isSelected = preset.metadata.id === currentPresetId;
                return (
                  <div
                    key={preset.metadata.id}
                    onClick={() => onSelectPreset(preset.metadata.id)}
                    className={`p-5 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                      isSelected
                        ? "border-white bg-surface-raised ring-1 ring-white/20"
                        : "border-border bg-surface hover:border-neutral-500"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-surface-raised border border-border text-muted">
                          {preset.metadata.difficulty}
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-white" />}
                      </div>

                      <h3 className="text-sm font-medium text-white mt-3">
                        {preset.metadata.name}
                      </h3>
                      <p className="text-xs text-muted mt-1 leading-relaxed">
                        {preset.metadata.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 grid grid-cols-2 gap-2 text-[11px] font-mono text-muted">
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
            <div className="space-y-3">
              <div className="grid grid-cols-12 text-xs font-mono text-muted px-3 py-1 border-b border-border">
                <span className="col-span-1">ID</span>
                <span className="col-span-5">Subject Name</span>
                <span className="col-span-2">Batch</span>
                <span className="col-span-2">Sessions/Wk</span>
                <span className="col-span-2">Type</span>
              </div>
              {dataset.subjects.map((s, idx) => (
                <div
                  key={s.subject_id}
                  className="grid grid-cols-12 items-center text-xs p-3 rounded-lg border border-border bg-surface-raised/40 hover:bg-surface-raised transition-colors"
                >
                  <span className="col-span-1 font-mono text-muted">{s.subject_id}</span>
                  <span className="col-span-5 text-white font-medium truncate pr-2">{s.name}</span>
                  <span className="col-span-2 font-mono text-neutral-300">{s.batch_id}</span>
                  <div className="col-span-2 flex items-center gap-2">
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
                      className="w-14 px-2 py-1 bg-surface border border-border text-white text-xs rounded font-mono"
                    />
                  </div>
                  <span className="col-span-2 text-muted">{s.preferred_room_type || "Standard"}</span>
                </div>
              ))}
            </div>
          )}

          {/* Rooms List */}
          {activeTab === "rooms" && (
            <div className="space-y-3">
              <div className="grid grid-cols-12 text-xs font-mono text-muted px-3 py-1 border-b border-border">
                <span className="col-span-2">Room ID</span>
                <span className="col-span-4">Room Number</span>
                <span className="col-span-3">Capacity</span>
                <span className="col-span-3">Type</span>
              </div>
              {dataset.rooms.map((r, idx) => (
                <div
                  key={r.room_id}
                  className="grid grid-cols-12 items-center text-xs p-3 rounded-lg border border-border bg-surface-raised/40"
                >
                  <span className="col-span-2 font-mono text-muted">{r.room_id}</span>
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
                      className="w-20 px-2 py-1 bg-surface border border-border text-white text-xs rounded font-mono"
                    />
                  </div>
                  <span className="col-span-3 text-muted">{r.room_type}</span>
                </div>
              ))}
            </div>
          )}

          {/* Faculty List */}
          {activeTab === "faculty" && (
            <div className="space-y-3">
              <div className="grid grid-cols-12 text-xs font-mono text-muted px-3 py-1 border-b border-border">
                <span className="col-span-2">ID</span>
                <span className="col-span-6">Faculty Name</span>
                <span className="col-span-4">Department</span>
              </div>
              {dataset.faculty.map((f) => (
                <div
                  key={f.faculty_id}
                  className="grid grid-cols-12 items-center text-xs p-3 rounded-lg border border-border bg-surface-raised/40"
                >
                  <span className="col-span-2 font-mono text-muted">{f.faculty_id}</span>
                  <span className="col-span-6 text-white font-medium">{f.name}</span>
                  <span className="col-span-4 text-muted">{f.department}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-3 bg-surface-raised/20">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-white text-neutral-900 text-xs font-medium hover:bg-neutral-100 transition-colors"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
