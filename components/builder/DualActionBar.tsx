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
          alert(proCheck.reason || "Quota mensuel atteint.");
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
    <div className="bg-slate-900 border border-slate-800 p-3 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xl">
      {/* Option Gratuite avec Filigrane */}
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

      {/* Option Pro (Réservé aux Abonnés - Quota 3 CVs / mois) */}
      <button
        type="button"
        onClick={() => handleDownload("clean")}
        disabled={downloadingType !== null}
        className={`w-full sm:flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-white text-xs font-extrabold rounded-xl shadow-md transition ${
          !proCheck.info.isSubscribed && !proCheck.info.isAdmin
            ? "bg-slate-800/90 hover:bg-slate-800 border border-amber-500/50 text-slate-200"
            : proCheck.remainingThisMonth <= 0 && !proCheck.info.isAdmin
            ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed"
            : "bg-gradient-to-r from-rose-600 via-rose-500 to-indigo-600 hover:from-rose-500 hover:to-indigo-500"
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
        ) : proCheck.info.isAdmin ? (
          <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-md ml-1">
            Admin Illimité
          </span>
        ) : proCheck.remainingThisMonth > 0 ? (
          <span className="bg-white/20 text-[10px] px-1.5 py-0.5 rounded-md ml-1 font-bold">
            {proCheck.remainingThisMonth}/3 ce mois
          </span>
        ) : (
          <span className="bg-rose-500/30 text-rose-300 text-[10px] px-1.5 py-0.5 rounded-md ml-1 font-bold">
            Quota 3/3 atteint
          </span>
        )}
      </button>
    </div>
  );
};
