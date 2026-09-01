"use client";

import React, { useState } from "react";
import { Sparkles, X, CheckCircle, AlertCircle, ArrowRight, Loader2, Target, Check } from "lucide-react";
import { ATSAnalysisResult } from "@/types/resume";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resumeText: string;
  onApplySummary: (newSummary: string) => void;
}

export const ATSScoreModal: React.FC<Props> = ({ isOpen, onClose, resumeText, onApplySummary }) => {
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ATSAnalysisResult | null>(null);
  const [applied, setApplied] = useState(false);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setResult(null);
    setApplied(false);

    try {
      const res = await fetch("/api/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "ats_match",
          resumeText,
          jobDescription,
          language: "fr",
        }),
      });
      const data = await res.json();
      if (data.success && data.analysis) {
        setResult(data.analysis);
      }
    } catch (err) {
      console.error("ATS analysis error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-rose-600 bg-rose-50 border-rose-200";
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Scanner ATS & Match d'Offre d'Emploi</h2>
              <p className="text-xs text-slate-300">Analyse de compatibilité propulsée par Google Gemini</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            title="Fermer la fenêtre du Scanner ATS"
            aria-label="Fermer la fenêtre du Scanner ATS"
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5">
              Collez la description de l'offre d'emploi (Job Posting) :
            </label>
            <textarea
              rows={4}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Collez ici l'annonce (profil recherché, responsabilités, technologies requises)..."
              title="Description de l'offre d'emploi pour le match ATS"
              aria-label="Description de l'offre d'emploi pour le match ATS"
              className="w-full text-xs p-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 bg-slate-50"
            />
            <button
              onClick={handleAnalyze}
              disabled={loading || !jobDescription.trim()}
              title="Lancer l'analyse du score ATS et détecter les mots-clés"
              aria-label="Lancer l'analyse du score ATS et détecter les mots-clés"
              className="mt-2.5 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyse ATS en cours par Gemini...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Calculer le Score de Compatibilité & Mots-clés
                </>
              )}
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="space-y-5 border-t pt-5">
              {/* Score card */}
              <div className="flex items-center justify-between p-4 rounded-xl border bg-slate-50">
                <div>
                  <div className="text-xs font-medium text-slate-600">Score de Correspondance ATS</div>
                  <div className="text-xs text-slate-500">Calculé sur la pertinence des compétences et mots-clés</div>
                </div>
                <div className={`text-2xl font-black px-4 py-1.5 rounded-xl border ${getScoreColor(result.score)}`}>
                  {result.score}%
                </div>
              </div>

              {/* Keywords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-emerald-100 bg-emerald-50/50">
                  <div className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    Mots-clés Détectés ({result.matchedKeywords?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.matchedKeywords?.map((kw, i) => (
                      <span key={i} className="text-[11px] bg-white border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-md font-medium">
                        ✓ {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-rose-100 bg-rose-50/50">
                  <div className="text-xs font-bold text-rose-900 mb-2 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                    Mots-clés Manquants à Ajouter ({result.missingKeywords?.length || 0})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {result.missingKeywords?.map((kw, i) => (
                      <span key={i} className="text-[11px] bg-white border border-rose-200 text-rose-800 px-2 py-0.5 rounded-md font-medium">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Tailored Summary */}
              {result.tailoredSummary && (
                <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Accroche / Résumé Recommandé pour cette Offre
                    </span>
                    <button
                      onClick={() => {
                        onApplySummary(result.tailoredSummary);
                        setApplied(true);
                      }}
                      className="text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded-lg transition flex items-center gap-1"
                    >
                      {applied ? <Check className="w-3 h-3" /> : null}
                      {applied ? "Appliqué au CV" : "Appliquer au CV"}
                    </button>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-indigo-100">
                    {result.tailoredSummary}
                  </p>
                </div>
              )}

              {/* Recommendations */}
              {result.improvements && result.improvements.length > 0 && (
                <div>
                  <div className="text-xs font-bold text-slate-900 mb-2">Recommandations d'Optimisation :</div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {result.improvements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <ArrowRight className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
