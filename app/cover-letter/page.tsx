"use client";

import React, { useState, useEffect } from "react";
import { INITIAL_COVER_LETTER_DATA, INITIAL_RESUME_DATA } from "@/lib/sampleData";
import { CoverLetterData, ResumeData } from "@/types/resume";
import { 
  FileText, Sparkles, Copy, Download, Check, ArrowLeft, 
  Building2, Briefcase, Loader2, Sparkle
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { getCurrentUser } from "@/lib/auth/authStore";
import { exportCoverLetterToPDF } from "@/lib/pdf/pdfExporter";

export default function CoverLetterPage() {
  const [data, setData] = useState<CoverLetterData>(INITIAL_COVER_LETTER_DATA);
  const [activeResume, setActiveResume] = useState<ResumeData | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [tone, setTone] = useState<"formal" | "dynamic" | "academic">("formal");
  const [loading, setLoading] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [copied, setCopied] = useState(false);

  // Auto-populate from active resume if available
  useEffect(() => {
    try {
      const user = getCurrentUser();
      const userId = user ? user.id : "guest";
      const listKey = `my_cv_resumes_list_${userId}`;
      const activeIdKey = `my_cv_active_resume_id_${userId}`;
      
      const savedList = localStorage.getItem(listKey);
      const savedActiveId = localStorage.getItem(activeIdKey);

      if (savedList) {
        const parsed: ResumeData[] = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const selected = parsed.find((r) => r.id === savedActiveId) || parsed[0];
          setActiveResume(selected);
          setData((prev) => ({
            ...prev,
            candidateName: selected.personalInfo.fullName || prev.candidateName,
            candidateEmail: selected.personalInfo.email || prev.candidateEmail,
            candidatePhone: selected.personalInfo.phone || prev.candidatePhone,
            candidateAddress: selected.personalInfo.location || prev.candidateAddress,
            jobTitle: selected.personalInfo.jobTitle || prev.jobTitle,
          }));
        }
      }
    } catch (e) {
      console.error("Failed to load active resume:", e);
    }
  }, []);

  const handleGenerateAI = async () => {
    setLoading(true);
    try {
      const candidateData = activeResume
        ? {
            name: activeResume.personalInfo.fullName || data.candidateName,
            email: activeResume.personalInfo.email || data.candidateEmail,
            phone: activeResume.personalInfo.phone || data.candidatePhone,
            address: activeResume.personalInfo.location || data.candidateAddress,
            experiences: activeResume.experiences
              .map(
                (e) =>
                  `${e.title} chez ${e.company} (${e.startDate}-${e.current ? "Présent" : e.endDate}): ${e.bulletPoints.join(" ")}`
              )
              .join(" | "),
            skills: activeResume.skills.map((s) => s.name).join(", "),
            education: activeResume.education
              .map((ed) => `${ed.degree} à ${ed.institution} (${ed.honors || ""})`)
              .join(" | "),
            projects: (activeResume.projects || [])
              .map((p) => `${p.name}: ${p.description}`)
              .join(" | "),
          }
        : {
            name: data.candidateName,
            email: data.candidateEmail,
            phone: data.candidatePhone,
            address: data.candidateAddress,
            experiences: "Expérience professionnelle confirmée et gestion de projets",
            skills: "Compétences techniques et méthodologiques avancées",
            education: "Formation supérieure",
          };

      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateData,
          jobData: {
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            jobDescription: jobDescription || `Poste de ${data.jobTitle} chez ${data.companyName}`,
            tone,
            language: data.language || "fr",
          },
        }),
      });
      const resJson = await res.json();
      if (resJson.success && resJson.coverLetter) {
        const cl = resJson.coverLetter;
        setData({
          ...data,
          subject: cl.subject || data.subject,
          greeting: cl.greeting || data.greeting,
          openingParagraph: cl.openingParagraph || data.openingParagraph,
          bodyParagraph: cl.bodyParagraph || data.bodyParagraph,
          closingParagraph: cl.closingParagraph || data.closingParagraph,
          signoff: cl.signoff || data.signoff,
        });
        try {
          confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
        } catch (e) {}
      }
    } catch (e) {
      console.error("AI Cover letter error:", e);
    } finally {
      setLoading(false);
    }
  };

  const getFullText = () => {
    return `${data.candidateName}
${data.candidateEmail} | ${data.candidatePhone}
${data.candidateAddress}

${data.recipientTitle || "Direction du Recrutement"}
${data.companyName}
${data.companyAddress || "Tunisie"}

Le ${data.date}

Objet : ${data.subject}

${data.greeting}

${data.openingParagraph}

${data.bodyParagraph}

${data.closingParagraph}

${data.signoff}

${data.candidateName}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getFullText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    setExportingPdf(true);
    try {
      const fileName = `Lettre_Motivation_${(data.candidateName || "Candidat").replace(/\s+/g, "_")}.pdf`;
      await exportCoverLetterToPDF("cover-letter-sheet", fileName);
    } catch (e) {
      console.error("PDF export error:", e);
    } finally {
      setExportingPdf(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        {/* Top Navbar */}
        <header className="bg-white/95 backdrop-blur-md text-slate-900 px-6 py-3.5 flex items-center justify-between border-b border-slate-200 shadow-2xs">
          <div className="flex items-center gap-3">
            <Link href="/builder" className="text-slate-600 hover:text-slate-950 flex items-center gap-1.5 text-xs font-semibold">
              <ArrowLeft className="w-4 h-4" /> Retour au CV
            </Link>
            <span className="text-slate-300">|</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                LM
              </div>
              <span className="font-bold text-sm text-slate-950">Générateur de Lettre de Motivation IA</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              {copied ? "Copié !" : "Copier le texte"}
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={exportingPdf}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition"
            >
              {exportingPdf ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
              {exportingPdf ? "Exportation..." : "Télécharger PDF"}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Form (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4 h-fit">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Paramètres de Candidature</h2>
                <p className="text-[11px] text-slate-500">Génération ciblée avec vos expériences</p>
              </div>
              <button
                onClick={handleGenerateAI}
                disabled={loading || !data.jobTitle || !data.companyName}
                className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-rose-600 hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-sm transition"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                {loading ? "Génération IA..." : "Rédiger avec l'IA"}
              </button>
            </div>

            {activeResume && (
              <div className="p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950 flex items-center justify-between">
                <span>CV connecté : <strong>{activeResume.personalInfo.fullName}</strong></span>
                <span className="text-[10px] text-indigo-600 font-semibold">{activeResume.experiences.length} exp.</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              {/* Candidate Coordinates */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">Vos Coordonnées (Expéditeur)</span>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nom & Prénom *</label>
                  <input
                    type="text"
                    value={data.candidateName}
                    onChange={(e) => setData({ ...data, candidateName: e.target.value })}
                    placeholder="Votre Nom & Prénom"
                    className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={data.candidateEmail}
                      onChange={(e) => setData({ ...data, candidateEmail: e.target.value })}
                      placeholder="votre.email@domaine.tn"
                      className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Téléphone</label>
                    <input
                      type="tel"
                      value={data.candidatePhone}
                      onChange={(e) => setData({ ...data, candidatePhone: e.target.value })}
                      placeholder="+216 -- --- ---"
                      className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Adresse / Ville</label>
                  <input
                    type="text"
                    value={data.candidateAddress}
                    onChange={(e) => setData({ ...data, candidateAddress: e.target.value })}
                    placeholder="Ex: Tunis, Tunisie"
                    className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              {/* Recipient & Job Coordinates */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block">Coordonnées de l'Entreprise Cible</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Poste Visé *</label>
                    <input
                      type="text"
                      value={data.jobTitle}
                      onChange={(e) => setData({ ...data, jobTitle: e.target.value })}
                      placeholder="Ex: Ingénieur Logiciel"
                      className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Entreprise *</label>
                    <input
                      type="text"
                      value={data.companyName}
                      onChange={(e) => setData({ ...data, companyName: e.target.value })}
                      placeholder="Ex: Entreprise Cible"
                      className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Titre du Destinataire</label>
                    <input
                      type="text"
                      value={data.recipientTitle}
                      onChange={(e) => setData({ ...data, recipientTitle: e.target.value })}
                      placeholder="Ex: Direction du Recrutement"
                      className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Date de la Lettre</label>
                    <input
                      type="text"
                      value={data.date}
                      onChange={(e) => setData({ ...data, date: e.target.value })}
                      placeholder="Ex: 4 Septembre 2026"
                      className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 transition"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Adresse de l'Entreprise</label>
                  <input
                    type="text"
                    value={data.companyAddress}
                    onChange={(e) => setData({ ...data, companyAddress: e.target.value })}
                    placeholder="Ex: Tunis, Tunisie"
                    className="w-full px-3 py-2 border rounded-xl bg-white focus:ring-2 focus:ring-indigo-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description du Poste / Exigences de l'Offre</label>
                <textarea
                  rows={3}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Collez ici les missions ou exigences de l'offre pour cibler précisément la lettre..."
                  className="w-full px-3 py-2 border rounded-xl bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tonalité de la lettre</label>
                <div className="flex gap-2">
                  {(["formal", "dynamic", "academic"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTone(t)}
                      className={`text-xs px-2.5 py-1.5 rounded-lg border transition ${
                        tone === t
                          ? "bg-indigo-600 text-white border-indigo-600 font-semibold"
                          : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                      }`}
                    >
                      {t === "formal" ? "Professionnelle" : t === "dynamic" ? "Dynamique" : "Académique / PFE"}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3 space-y-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Objet de la lettre</label>
                  <input
                    type="text"
                    value={data.subject}
                    onChange={(e) => setData({ ...data, subject: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Accroche / Introduction</label>
                  <textarea
                    rows={3}
                    value={data.openingParagraph}
                    onChange={(e) => setData({ ...data, openingParagraph: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Corps / Arguments & Compétences</label>
                  <textarea
                    rows={4}
                    value={data.bodyParagraph}
                    onChange={(e) => setData({ ...data, bodyParagraph: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Conclusion & Entretien</label>
                  <textarea
                    rows={2}
                    value={data.closingParagraph}
                    onChange={(e) => setData({ ...data, closingParagraph: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Sheet Preview (7 Cols) */}
          <div className="lg:col-span-7 flex justify-center items-start">
            <div
              id="cover-letter-sheet"
              className="bg-white rounded-xl shadow-sheet p-10 max-w-[700px] w-full min-h-[850px] text-slate-800 text-xs font-sans leading-relaxed border border-slate-200"
            >
              {/* Header sender / receiver */}
              <div className="flex justify-between items-start mb-8 text-xs border-b border-slate-100 pb-5">
                <div>
                  <div className="font-bold text-slate-950 text-sm">{data.candidateName}</div>
                  <div className="text-slate-600">{data.candidateEmail}</div>
                  <div className="text-slate-600">{data.candidatePhone}</div>
                  <div className="text-slate-600">{data.candidateAddress}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">{data.recipientTitle || "Direction des Ressources Humaines"}</div>
                  <div className="font-semibold text-indigo-700">{data.companyName}</div>
                  <div className="text-slate-600">{data.companyAddress || "Tunisie"}</div>
                  <div className="text-slate-500 mt-2">{data.date}</div>
                </div>
              </div>

              {/* Subject */}
              <div className="font-bold text-slate-950 text-xs mb-6 pb-2 border-b border-slate-100">
                Objet : {data.subject}
              </div>

              {/* Greeting */}
              <div className="mb-4 font-semibold text-slate-900">{data.greeting}</div>

              {/* Paragraphs */}
              <div className="space-y-4 text-justify text-slate-800 leading-relaxed">
                <p>{data.openingParagraph}</p>
                <p>{data.bodyParagraph}</p>
                <p>{data.closingParagraph}</p>
              </div>

              {/* Signoff */}
              <div className="mt-8 pt-4">
                <p>{data.signoff}</p>
                <p className="font-bold text-slate-950 mt-4">{data.candidateName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}

