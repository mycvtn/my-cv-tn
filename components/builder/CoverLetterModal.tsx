"use client";

import React, { useState } from "react";
import { ResumeData } from "@/types/resume";
import { X, Sparkles, Loader2, Copy, Check, FileText, ArrowRight, Building2, Briefcase, Download } from "lucide-react";
import confetti from "canvas-confetti";
import { exportCoverLetterToPDF } from "@/lib/pdf/pdfExporter";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  resumeData: ResumeData;
}

export const CoverLetterModal: React.FC<Props> = ({ isOpen, onClose, resumeData }) => {
  const [jobTitle, setJobTitle] = useState(resumeData.personalInfo.jobTitle || "");
  const [companyName, setCompanyName] = useState("");
  const [recipientTitle, setRecipientTitle] = useState("Direction du Recrutement");
  const [companyAddress, setCompanyAddress] = useState(resumeData.personalInfo.location || "Tunisie");
  const [letterDate, setLetterDate] = useState(new Date().toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }));
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<"formal" | "dynamic" | "academic">("formal");
  const [loading, setLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [generatedLetter, setGeneratedLetter] = useState<{
    subject: string;
    greeting: string;
    openingParagraph: string;
    bodyParagraph: string;
    closingParagraph: string;
    signoff: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!jobTitle || !companyName) return;
    setLoading(true);
    setGeneratedLetter(null);

    // Format full candidate CV profile
    const candidateData = {
      name: resumeData.personalInfo.fullName,
      email: resumeData.personalInfo.email,
      phone: resumeData.personalInfo.phone,
      address: resumeData.personalInfo.location,
      experiences: resumeData.experiences
        .map(
          (e) =>
            `${e.title} chez ${e.company} (${e.startDate}-${e.current ? "Présent" : e.endDate}): ${e.bulletPoints.join(" ")}`
        )
        .join(" | "),
      skills: resumeData.skills.map((s) => s.name).join(", "),
      education: resumeData.education
        .map((ed) => `${ed.degree} à ${ed.institution} (${ed.honors || ""})`)
        .join(" | "),
      projects: (resumeData.projects || [])
        .map((p) => `${p.name}: ${p.description}`)
        .join(" | "),
    };

    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateData,
          jobData: {
            jobTitle,
            companyName,
            jobDescription: jobDescription || `Poste de ${jobTitle} chez ${companyName}`,
            tone,
            language: "fr",
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.coverLetter) {
        setGeneratedLetter(data.coverLetter);
        try {
          confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
        } catch (e) {}
      }
    } catch (e) {
      console.error("Cover letter error:", e);
    } finally {
      setLoading(false);
    }
  };

  const getFullText = () => {
    if (!generatedLetter) return "";
    return `${resumeData.personalInfo.fullName}
${resumeData.personalInfo.email} | ${resumeData.personalInfo.phone}
${resumeData.personalInfo.location}

${recipientTitle}
${companyName}
${companyAddress}

Le ${letterDate}

Objet : ${generatedLetter.subject}

${generatedLetter.greeting}

${generatedLetter.openingParagraph}

${generatedLetter.bodyParagraph}

${generatedLetter.closingParagraph}

${generatedLetter.signoff}
${resumeData.personalInfo.fullName}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadPDF = async () => {
    setExportingPdf(true);
    try {
      const fileName = `Lettre_Motivation_${(resumeData.personalInfo.fullName || "Candidat").replace(/\s+/g, "_")}.pdf`;
      await exportCoverLetterToPDF("modal-cover-letter-sheet", fileName);
    } catch (e) {
      console.error("PDF export error:", e);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-5 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Générateur de Lettre de Motivation IA</h2>
              <p className="text-xs text-slate-300">
                Fusion intelligente entre vos expériences de CV et les exigences de l'offre
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            title="Fermer la fenêtre du Générateur de Lettre IA"
            aria-label="Fermer la fenêtre du Générateur de Lettre IA"
            className="text-slate-400 hover:text-white p-1.5 rounded-lg transition hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-grow">
          {/* Active CV Data Info Pill */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center justify-between text-xs text-indigo-950">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                <strong>CV Actif :</strong> {resumeData.personalInfo.fullName} ({resumeData.experiences.length} expériences, {resumeData.skills.length} compétences détectées)
              </span>
            </div>
            <span className="text-[11px] text-indigo-600 font-medium hidden sm:inline">Prêt pour l'adaptation IA</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Poste Visé *
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Ex: Senior Full-Stack Engineer"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Entreprise Cible *
              </label>
              <div className="relative">
                <Building2 className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Sofrecom Tunisie / Orange / Vermeg"
                  className="w-full text-xs pl-9 pr-3 py-2.5 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Titre Destinataire
              </label>
              <input
                type="text"
                value={recipientTitle}
                onChange={(e) => setRecipientTitle(e.target.value)}
                placeholder="Ex: Direction du Recrutement"
                className="w-full text-xs px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Adresse Entreprise
              </label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="Ex: Tunis, Tunisie"
                className="w-full text-xs px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1">
                Date de la Lettre
              </label>
              <input
                type="text"
                value={letterDate}
                onChange={(e) => setLetterDate(e.target.value)}
                placeholder="Ex: 4 Septembre 2026"
                className="w-full text-xs px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-900">
                Description de l'Offre / Exigences Clés (Optionnel mais Recommandé)
              </label>
              <span className="text-[10px] text-slate-400">Pour un ciblage chirurgical</span>
            </div>
            <textarea
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Collez ici le texte de l'offre (responsabilités, compétences recherchées, technologies...). L'IA va connecter chaque exigence à vos réalisations de CV..."
              className="w-full text-xs p-3 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition leading-relaxed"
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Tonalité :</span>
              {(["formal", "dynamic", "academic"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition ${
                    tone === t
                      ? "bg-indigo-600 text-white border-indigo-600 font-semibold shadow-sm"
                      : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                  }`}
                >
                  {t === "formal" ? "Professionnelle" : t === "dynamic" ? "Dynamique" : "Académique / PFE"}
                </button>
              ))}
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !jobTitle || !companyName}
              title="Générer la lettre de motivation sur-mesure avec l'IA"
              aria-label="Générer la lettre de motivation sur-mesure avec l'IA"
              className="py-2.5 px-5 bg-gradient-to-r from-indigo-600 to-rose-600 hover:opacity-95 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-md"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "Synthèse CV + Offre en cours..." : "Générer la Lettre Sur-Mesure"}
            </button>
          </div>

          {/* Generated Result */}
          {generatedLetter && (
            <div className="border-t pt-4 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Lettre de Motivation Sur-Mesure Générée :
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    title="Copier le texte de la lettre de motivation dans le presse-papier"
                    aria-label="Copier le texte de la lettre de motivation dans le presse-papier"
                    className="text-xs text-slate-700 hover:text-slate-900 font-semibold flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    {copied ? "Copié !" : "Copier le texte"}
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    disabled={exportingPdf}
                    title="Télécharger la lettre de motivation en format PDF"
                    aria-label="Télécharger la lettre de motivation en format PDF"
                    className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 font-bold flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl shadow-sm transition disabled:opacity-50"
                  >
                    {exportingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                    {exportingPdf ? "Exportation..." : "Télécharger PDF"}
                  </button>
                </div>
              </div>

              {/* Styled Printable / Exportable Sheet */}
              <div
                id="modal-cover-letter-sheet"
                className="p-8 rounded-2xl border bg-white text-slate-900 space-y-5 font-sans leading-relaxed border-slate-200 shadow-sm"
              >
                {/* Sender & Recipient Header */}
                <div className="flex justify-between items-start text-xs border-b border-slate-100 pb-4">
                  <div>
                    <div className="font-bold text-slate-950 text-sm">{resumeData.personalInfo.fullName}</div>
                    <div className="text-slate-600">{resumeData.personalInfo.email}</div>
                    <div className="text-slate-600">{resumeData.personalInfo.phone}</div>
                    <div className="text-slate-600">{resumeData.personalInfo.location}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{recipientTitle || "Direction du Recrutement"}</div>
                    <div className="font-semibold text-indigo-700">{companyName}</div>
                    {companyAddress && <div className="text-slate-600">{companyAddress}</div>}
                    <div className="text-slate-500 mt-1">Le {letterDate}</div>
                  </div>
                </div>

                <div className="font-bold text-slate-950 text-xs pb-1">
                  Objet : {generatedLetter.subject}
                </div>
                <div className="font-semibold text-slate-900 text-xs">{generatedLetter.greeting}</div>
                <p className="text-justify text-slate-800 text-xs">{generatedLetter.openingParagraph}</p>
                <p className="text-justify text-slate-800 text-xs">
                  {generatedLetter.bodyParagraph}
                </p>
                <p className="text-justify text-slate-800 text-xs">{generatedLetter.closingParagraph}</p>
                <div className="pt-3">
                  <p className="text-xs text-slate-800">{generatedLetter.signoff}</p>
                  <p className="font-bold text-slate-950 text-xs mt-3">{resumeData.personalInfo.fullName}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};