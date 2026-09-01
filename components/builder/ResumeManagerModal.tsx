"use client";

import React, { useState } from "react";
import { ResumeData, TemplateId } from "@/types/resume";
import { INITIAL_RESUME_DATA } from "@/lib/sampleData";
import { 
  FolderOpen, Plus, Copy, Trash2, Edit2, Check, X, FileText, 
  Calendar, CheckCircle2, Sparkles, ArrowRight
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resumes: ResumeData[];
  activeId: string;
  onSelectResume: (id: string) => void;
  onCreateResume: (title: string, template: TemplateId, mode: "blank" | "sample" | "duplicate") => void;
  onRenameResume: (id: string, newTitle: string) => void;
  onDuplicateResume: (id: string) => void;
  onDeleteResume: (id: string) => void;
}

export const ResumeManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  resumes,
  activeId,
  onSelectResume,
  onCreateResume,
  onRenameResume,
  onDuplicateResume,
  onDeleteResume,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTemplate, setNewTemplate] = useState<TemplateId>("canadian");
  const [newMode, setNewMode] = useState<"blank" | "sample" | "duplicate">("blank");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setIsCreating(true);
    setNewTitle(`Mon CV (${resumes.length + 1})`);
  };

  const handleConfirmCreate = () => {
    if (!newTitle.trim()) return;
    onCreateResume(newTitle.trim(), newTemplate, newMode);
    setIsCreating(false);
    onClose();
  };

  const handleStartRename = (r: ResumeData) => {
    setEditingId(r.id || "");
    setEditingTitle(r.title || "Mon CV");
  };

  const handleConfirmRename = (id: string) => {
    if (!editingTitle.trim()) return;
    onRenameResume(id, editingTitle.trim());
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Mes CVs Enregistrés ({resumes.length})</h2>
              <p className="text-xs text-slate-300">Créez, gérez et basculez facilement entre vos différents CVs</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            title="Fermer la fenêtre de gestion des CVs"
            aria-label="Fermer la fenêtre de gestion des CVs"
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-grow">
          {/* Create New Resume Form Section */}
          {isCreating ? (
            <div className="p-4 bg-slate-50 rounded-2xl border border-indigo-200 space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Créer un nouveau CV
                </span>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                >
                  Annuler
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Titre ou Cible du CV *</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Ex: CV Développeur Full-Stack (Canada)"
                  className="w-full text-xs px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Modèle Initial</label>
                  <select
                    value={newTemplate}
                    onChange={(e) => setNewTemplate(e.target.value as TemplateId)}
                    className="w-full text-xs px-3 py-2 border rounded-xl bg-white"
                  >
                    <optgroup label="⭐ Modèles Pro ATS (Recommandé)">
                      <option value="canadian">🍁 Canadien ATS (Recommandé)</option>
                      <option value="europass">🇪🇺 Europass Pro ATS</option>
                      <option value="tunisian">🇹🇳 Tunisien Pro ATS</option>
                    </optgroup>
                    <optgroup label="✨ Autres Modèles">
                      <option value="modern_tech">🚀 Moderne Tech (Silicon)</option>
                      <option value="executive_luxe">💎 Executive Luxe Minimaliste</option>
                      <option value="creative_sidebar">🎨 Créatif Dark Sidebar</option>
                      <option value="compact_metro">🏙️ Compact Metro (Swiss)</option>
                      <option value="gradient_header">🌅 Gradient Header (Horizon)</option>
                      <option value="minimalist_clean">📄 Minimaliste Clean (Monochrome)</option>
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contenu de Départ</label>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="blank">CV Vierge (Entièrement vide - Recommandé)</option>
                    <option value="duplicate">Dupliquer le CV actif</option>
                    <option value="sample">Exemple Complet (Prêt à adapter)</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmCreate}
                disabled={!newTitle.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Créer & Ouvrir ce CV
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartCreate}
              className="w-full py-3 bg-gradient-to-r from-rose-50 to-indigo-50 hover:from-rose-100 hover:to-indigo-100 border-2 border-dashed border-rose-300 text-rose-700 text-xs font-bold rounded-2xl transition flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Créer un Nouveau CV</span>
            </button>
          )}

          {/* List of Saved Resumes */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-slate-700 block">Vos versions de CV :</span>

            {resumes.map((r) => {
              const isActive = (r.id || "") === activeId;
              const isEditing = editingId === r.id;

              return (
                <div
                  key={r.id}
                  className={`p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    isActive
                      ? "bg-rose-50/70 border-rose-300 ring-1 ring-rose-400"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3 flex-grow min-w-0">
                    <div
                      className={`p-2 rounded-xl border flex-shrink-0 ${
                        isActive
                          ? "bg-rose-600 text-white border-rose-600"
                          : "bg-slate-100 text-slate-600 border-slate-200"
                      }`}
                    >
                      <FileText className="w-4 h-4" />
                    </div>

                    <div className="min-w-0 flex-grow">
                      {isEditing ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="text"
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="text-xs px-2 py-1 border rounded-lg bg-white w-full font-bold"
                            autoFocus
                          />
                          <button
                            onClick={() => handleConfirmRename(r.id || "")}
                            className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-500"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {r.title || "Mon CV"}
                          </h4>
                          {isActive && (
                            <span className="text-[10px] bg-rose-600 text-white px-2 py-0.2 rounded-full font-bold">
                              Actif
                            </span>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                        <span className="capitalize font-semibold text-slate-700">
                          Modèle : {r.settings.template}
                        </span>
                        <span>•</span>
                        <span>{r.experiences.length} exp.</span>
                        <span>•</span>
                        <span>{r.skills.length} compétences</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!isActive && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectResume(r.id || "");
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
                      >
                        <span>Ouvrir</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleStartRename(r)}
                      className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
                      title="Renommer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDuplicateResume(r.id || "")}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition"
                      title="Dupliquer ce CV"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>

                    {resumes.length > 1 && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Supprimer définitivement "${r.title || "ce CV"}" ?`)) {
                            onDeleteResume(r.id || "");
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                        title="Supprimer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
