"use client";

import React, { useState } from "react";
import { INITIAL_COVER_LETTER_DATA } from "@/lib/sampleData";
import { CoverLetterData } from "@/types/resume";
import { 
  FileText, Sparkles, Copy, Download, Check, ArrowLeft, 
  Send, RefreshCw, Loader2 
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function CoverLetterPage() {
  const [data, setData] = useState<CoverLetterData>(INITIAL_COVER_LETTER_DATA);
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerateAI = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateData: {
            name: data.candidateName,
            email: data.candidateEmail,
            phone: data.candidatePhone,
            address: data.candidateAddress,
            experiences: "4+ ans d'expérience en génie logiciel Next.js/React, Cloud & architecture",
            skills: "Next.js, TypeScript, PostgreSQL, Docker, AWS, Clean Architecture",
            education: "Diplôme d'Ingénieur INSAT",
          },
          jobData: {
            jobTitle: data.jobTitle,
            companyName: data.companyName,
            jobDescription: jobDescription || `${data.jobTitle} chez ${data.companyName}`,
            language: data.language,
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
        confetti({ particleCount: 70, spread: 50, origin: { y: 0.6 } });
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
${data.companyAddress}

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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Header */}
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
            <span className="font-bold text-sm text-slate-950">Générateur de Lettre de Motivation</span>
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
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition"
          >
            <Download className="w-3.5 h-3.5" />
            Imprimer / PDF
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4 h-fit">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-sm font-bold text-slate-900">Paramètres de Candidature</h2>
            <button
              onClick={handleGenerateAI}
              disabled={loading || !data.jobTitle || !data.companyName}
              className="flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-rose-600 hover:opacity-90 disabled:opacity-50 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm transition"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              {loading ? "Génération..." : "Rédiger avec l'IA"}
            </button>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Votre Nom & Prénom</label>
              <input
                type="text"
                value={data.candidateName}
                onChange={(e) => setData({ ...data, candidateName: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Poste Visé</label>
                <input
                  type="text"
                  value={data.jobTitle}
                  onChange={(e) => setData({ ...data, jobTitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Entreprise</label>
                <input
                  type="text"
                  value={data.companyName}
                  onChange={(e) => setData({ ...data, companyName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Détails de l'Offre (Optionnel)</label>
              <textarea
                rows={3}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Collez l'offre pour adapter les arguments clés..."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Objet de la lettre</label>
              <input
                type="text"
                value={data.subject}
                onChange={(e) => setData({ ...data, subject: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Accroche / Introduction</label>
              <textarea
                rows={3}
                value={data.openingParagraph}
                onChange={(e) => setData({ ...data, openingParagraph: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Corps / Arguments & Compétences</label>
              <textarea
                rows={4}
                value={data.bodyParagraph}
                onChange={(e) => setData({ ...data, bodyParagraph: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Conclusion & Entretien</label>
              <textarea
                rows={2}
                value={data.closingParagraph}
                onChange={(e) => setData({ ...data, closingParagraph: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Right Sheet Preview (7 Cols) */}
        <div className="lg:col-span-7 flex justify-center items-start">
          <div className="bg-white rounded-xl shadow-sheet p-10 max-w-[700px] w-full min-h-[900px] text-slate-800 text-xs font-sans leading-relaxed border border-slate-200">
            {/* Header sender / receiver */}
            <div className="flex justify-between items-start mb-8 text-xs">
              <div>
                <div className="font-bold text-slate-900 text-sm">{data.candidateName}</div>
                <div className="text-slate-600">{data.candidateEmail}</div>
                <div className="text-slate-600">{data.candidatePhone}</div>
                <div className="text-slate-600">{data.candidateAddress}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-900">{data.recipientTitle || "Responsable Recrutement"}</div>
                <div className="font-semibold text-slate-800">{data.companyName}</div>
                <div className="text-slate-600">{data.companyAddress}</div>
                <div className="text-slate-500 mt-2">{data.date}</div>
              </div>
            </div>

            {/* Subject */}
            <div className="font-bold text-slate-900 text-xs mb-6 pb-2 border-b">
              Objet : {data.subject}
            </div>

            {/* Greeting */}
            <div className="mb-4">{data.greeting}</div>

            {/* Paragraphs */}
            <div className="space-y-4 text-justify text-slate-800">
              <p>{data.openingParagraph}</p>
              <p>{data.bodyParagraph}</p>
              <p>{data.closingParagraph}</p>
            </div>

            {/* Signoff */}
            <div className="mt-8">
              <p>{data.signoff}</p>
              <p className="font-bold text-slate-900 mt-4">{data.candidateName}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthGuard>
);
}
