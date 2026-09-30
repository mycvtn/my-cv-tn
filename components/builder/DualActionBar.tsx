"use client";

import React, { useState } from "react";
import { Download, Sparkles, Loader2, Crown, Lock, CheckCircle2 } from "lucide-react";
import { ResumeData } from "@/types/resume";
import { exportResumeToPDF } from "@/lib/pdf/pdfExporter";
import { getCurrentUser, canDownloadProResume, consumeProDownload } from "@/lib/auth/authStore";

interface Props {
  resumeData: ResumeData;
  userCredits?: number;
  userId?: string;
  onOpenCreditCalculator: () => void;
  onDeductCredits?: (amount: number, updatedUser?: any) => void;
}

export const DualActionBar: React.FC<Props> = ({
  resumeData,
  onOpenCreditCalculator,
  onDeductCredits,
}) => {
  const [downloadingType, setDownloadingType] = useState<"free" | "pro" | null>(null);

  const currentUser = typeof window !== "undefined" ? getCurrentUser() : null;
  const proCheck = canDownloadProResume(currentUser);

  const handleDownload = async (outputType: "free_watermark" | "clean") => {
    const isClean = outputType === "clean";

    if (isClean) {
      if (!proCheck.allowed) {
        if (!proCheck.info.isSubscribed) {
          onOpenCreditCalculator();
          return;
        } else {
          alert(proCheck.reason || "Abonnement Pro requis.");
          return;
        }
      }

      // Consume 1 download from the monthly quota of 3
      if (!proCheck.info.isAdmin && currentUser?.id) {
        const result = consumeProDownload(currentUser.id);
        if (onDeductCredits) {
          onDeductCredits(1, result.user);
        }
      }
    }

    setDownloadingType(isClean ? "pro" : "free");

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
    } catch (error) {
      alert("Une erreur est survenue lors de la génération de votre CV.");
    } finally {
      setDownloadingType(null);
    }
  };

  return (
    <div className="win11-acrylic-card win11-window-shadow border border-white/20 p-3 sm:p-3.5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl backdrop-blur-xl relative overflow-hidden">
      {/* Top Accent Glow */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 via-amber-400 to-indigo-500 opacity-80" />

      {/* Option Gratuite avec Filigrane */}
      <button
        type="button"
        onClick={() => handleDownload("free_watermark")}
        disabled={downloadingType !== null}
        className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold rounded-xl border border-white/10 transition-all duration-200 win11-btn-interactive shadow-2xs"
      >
        {downloadingType === "free" ? (
          <Loader2 className="w-4 h-4 animate-spin text-slate-300" />
        ) : (
          <Download className="w-4 h-4 text-slate-300" />
        )}
        <span>Télécharger avec filigrane my-cv.tn (Gratuit)</span>
      </button>

      {/* Option Pro (Réservé aux Abonnés - Téléchargement Illimité) */}
      <button
        type="button"
        onClick={() => handleDownload("clean")}
        disabled={downloadingType !== null}
        className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white text-xs font-extrabold rounded-xl shadow-lg transition-all duration-200 win11-btn-interactive ${
          !proCheck.info.isSubscribed && !proCheck.info.isAdmin
            ? "bg-slate-800/90 hover:bg-slate-800 border border-amber-500/50 text-slate-200 hover:border-amber-400"
            : "bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 shadow-rose-600/30 cursor-pointer"
        }`}
      >
        {downloadingType === "pro" ? (
          <Loader2 className="w-4 h-4 animate-spin text-white" />
        ) : !proCheck.info.isSubscribed && !proCheck.info.isAdmin ? (
          <Lock className="w-4 h-4 text-amber-400" />
        ) : (
          <Crown className="w-4 h-4 text-amber-300" />
        )}

        <span>Télécharger PDF Pro (Sans filigrane)</span>

        {!proCheck.info.isSubscribed && !proCheck.info.isAdmin ? (
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-md ml-1 font-bold">
            Abonnement requis
          </span>
        ) : (
          <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-md ml-1 font-bold shadow-xs">
            ✨ Illimité
          </span>
        )}
      </button>
    </div>
  );
};
