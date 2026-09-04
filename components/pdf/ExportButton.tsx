"use client";

import React, { useState } from "react";
import { Download, Loader2, FileCode, ChevronDown, Sparkles, Printer } from "lucide-react";
import { exportResumeToPDF } from "@/lib/pdf/pdfExporter";
import { useLatexPdf } from "@/hooks/useLatexPdf";
import { ResumeData } from "@/types/resume";
import { getCurrentUser, consumeUserCredits } from "@/lib/auth/authStore";
import confetti from "canvas-confetti";

interface Props {
  elementId?: string;
  resumeData?: ResumeData;
  candidateName?: string;
  isUnlocked?: boolean;
  onRequireUnlock?: () => void;
}

export const ExportButton: React.FC<Props> = ({
  elementId = "resume-sheet-preview",
  resumeData,
  candidateName = "Candidat",
  isUnlocked = true,
  onRequireUnlock,
}) => {
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { downloadLatexPdf, downloadLatexSource, isGenerating } = useLatexPdf();

  // Direct 1-Click Instant PDF File Download
  const handleDirectDownload = async () => {
    const user = getCurrentUser();
    const currentCredits = user?.credits ?? 0;

    if (user?.role !== "admin" && currentCredits < 10) {
      if (onRequireUnlock) onRequireUnlock();
      return;
    }

    setDropdownOpen(false);
    setExporting(true);
    setProgress(15);

    const cleanName = (candidateName || "CV").replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `CV_${cleanName}_Pro_A4.pdf`;

    const success = await exportResumeToPDF(elementId, {
      fileName,
      isWatermarked: false,
      onProgress: (p) => setProgress(p),
    });

    if (success) {
      // Deduct exactly 10 credits
      if (user?.id) {
        consumeUserCredits(user.id, 10);
      }
      try {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      } catch (e) {}
    }

    setExporting(false);
    setProgress(0);
  };

  const handleExportLatex = async () => {
    const user = getCurrentUser();
    const currentCredits = user?.credits ?? 0;

    if (user?.role !== "admin" && currentCredits < 10) {
      if (onRequireUnlock) onRequireUnlock();
      return;
    }

    setDropdownOpen(false);
    if (resumeData) {
      const ok = await downloadLatexPdf(resumeData);
      if (ok) {
        if (user?.id) {
          consumeUserCredits(user.id, 10);
        }
      } else {
        handleDirectDownload();
      }
    }
  };

  const handleNativePrint = () => {
    setDropdownOpen(false);
    window.print();
  };

  const handleDownloadTex = async () => {
    setDropdownOpen(false);
    if (resumeData) {
      await downloadLatexSource(resumeData);
    }
  };

  const isLoading = isGenerating || exporting;

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center rounded-xl shadow-md bg-gradient-to-r from-rose-600 to-rose-700">
        <button
          onClick={handleDirectDownload}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-white font-bold text-xs hover:from-rose-500 hover:to-rose-600 transition disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Téléchargement ({progress}%)...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Télécharger PDF Pro (10 Crédits)</span>
            </>
          )}
        </button>

        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="px-2.5 py-2 text-white border-l border-rose-500/50 hover:bg-rose-800/40 rounded-r-xl transition"
          title="Autres formats"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
          <button
            onClick={handleDirectDownload}
            className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-800 font-semibold"
          >
            <Download className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <div>
              <div>Téléchargement Direct du PDF</div>
              <div className="text-[10px] text-slate-500 font-normal">Fichier .pdf immédiat (A4 - 3mm)</div>
            </div>
          </button>

          <button
            onClick={handleNativePrint}
            className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-800"
          >
            <Printer className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <div>
              <div>Imprimer / Enregistrer via Navigateur</div>
              <div className="text-[10px] text-slate-500 font-normal">Boîte de dialogue d'impression</div>
            </div>
          </button>

          <button
            onClick={handleExportLatex}
            className="w-full text-left px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2.5 text-slate-800"
          >
            <Sparkles className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <div>
              <div>PDF LaTeX ATS (Style Rami)</div>
              <div className="text-[10px] text-slate-500 font-normal">Compilation serveur LaTeX</div>
            </div>
          </button>

          <div className="border-t my-1 border-slate-100" />

          <button
            onClick={handleDownloadTex}
            className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-600"
          >
            <FileCode className="w-3.5 h-3.5 text-amber-600" />
            <span>Code Source LaTeX (.tex)</span>
          </button>
        </div>
      )}
    </div>
  );
};