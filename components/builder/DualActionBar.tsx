"use client";

import React, { useState } from "react";
import { Download, Sparkles, Loader2, Coins } from "lucide-react";
import { ResumeData } from "@/types/resume";
import { exportResumeToPDF } from "@/lib/pdf/pdfExporter";

interface Props {
  resumeData: ResumeData;
  userCredits: number;
  userId?: string;
  onOpenCreditCalculator: () => void;
  onDeductCredits?: (amount: number) => void;
}

export const DualActionBar: React.FC<Props> = ({
  resumeData,
  userCredits,
  userId,
  onOpenCreditCalculator,
  onDeductCredits,
}) => {
  const [downloadingType, setDownloadingType] = useState<"free" | "pro" | null>(null);

  const handleDownload = async (outputType: "free_watermark" | "clean") => {
    if (outputType === "clean" && userCredits < 10) {
      onOpenCreditCalculator();
      return;
    }

    setDownloadingType(outputType === "clean" ? "pro" : "free");

    try {
      const isFree = outputType === "free_watermark";
      const safeName = (resumeData.personalInfo.fullName || "Candidat").replace(/[^a-zA-Z0-9]/g, "_");
      const fileName = isFree ? `CV_${safeName}_my-cv.tn.pdf` : `CV_${safeName}_Pro_A4.pdf`;

      const success = await exportResumeToPDF("resume-sheet-preview", {
        fileName,
        isWatermarked: isFree,
        watermarkText: "my-cv.tn",
      });

      if (!success) {
        throw new Error("Échec de l'exportation PDF");
      }

      if (outputType === "clean" && onDeductCredits) {
        onDeductCredits(10);
      }
    } catch (error) {
      alert("Une erreur est survenue lors de la génération de votre CV.");
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
      {/* Option Gratuite */}
      <button
        type="button"
        onClick={() => handleDownload("free_watermark")}
        disabled={downloadingType !== null}
        className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
      >
        {downloadingType === "free" ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
        ) : (
          <Download className="w-4 h-4 text-slate-400" />
        )}
        <span>Télécharger avec filigrane my-cv.tn (Gratuit)</span>
      </button>

      {/* Option Pro 10 Crédits */}
      <button
        type="button"
        onClick={() => handleDownload("clean")}
        disabled={downloadingType !== null}
        className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-extrabold rounded-xl shadow-md transition"
      >
        {downloadingType === "pro" ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : (
          <Sparkles className="w-4 h-4 text-yellow-300" />
        )}
        <span>Télécharger PDF Pro (10 Crédits)</span>
        {userCredits < 10 ? (
          <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded-md ml-1">
            Recharge requise
          </span>
        ) : (
          <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-md ml-1 flex items-center gap-1">
            <Coins className="w-3 h-3 text-amber-300" />
            <span>-10 Cr</span>
          </span>
        )}
      </button>
    </div>
  );
};
