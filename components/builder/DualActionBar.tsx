"use client";

import React, { useState } from "react";
import { Download, Sparkles, Loader2, Crown, Lock } from "lucide-react";
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
    <div className="w-full flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-sans">
      {/* Option 1: Télécharger Gratuit (avec filigrane) - Clair, lisible et rassurant */}
      <button
        type="button"
        onClick={() => handleDownload("free_watermark")}
        disabled={downloadingType !== null}
        className="group relative flex-1 flex items-center justify-between p-3 sm:px-4 sm:py-3 bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-emerald-500/80 rounded-2xl transition-all duration-200 shadow-sm hover:shadow-md win11-btn-interactive text-left cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-emerald-100/80 text-emerald-600 flex items-center justify-center transition-colors flex-shrink-0 border border-emerald-200/80 shadow-2xs">
            {downloadingType === "free" ? (
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
            ) : (
              <Download className="w-5 h-5" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                Télécharger Gratuitement
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-medium truncate">
              Format PDF standard • avec filigrane discret
            </span>
          </div>
        </div>

        <span className="flex-shrink-0 ml-2 inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100/70 text-emerald-800 border border-emerald-300/80 shadow-2xs">
          100% Gratuit
        </span>
      </button>

      {/* Option 2: Télécharger PDF Pro (Sans Filigrane) */}
      <button
        type="button"
        onClick={() => handleDownload("clean")}
        disabled={downloadingType !== null}
        className={`group relative flex-1 flex items-center justify-between p-3 sm:px-4 sm:py-3 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg win11-btn-interactive text-left cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${
          !proCheck.info.isSubscribed && !proCheck.info.isAdmin
            ? "bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 hover:border-amber-400/60 shadow-slate-900/20"
            : "bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white border border-rose-400/40 shadow-rose-600/25"
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/15 text-white flex items-center justify-center transition-colors flex-shrink-0 border border-white/20 shadow-2xs">
            {downloadingType === "pro" ? (
              <Loader2 className="w-5 h-5 animate-spin text-white" />
            ) : !proCheck.info.isSubscribed && !proCheck.info.isAdmin ? (
              <Lock className="w-5 h-5 text-amber-300" />
            ) : (
              <Crown className="w-5 h-5 text-amber-300" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5 truncate">
              <span>Télécharger PDF Pro</span>
            </span>
            <span className="text-[11px] text-white/85 font-medium truncate">
              Haute Définition • Zéro filigrane
            </span>
          </div>
        </div>

        <div className="flex-shrink-0 ml-2">
          {!proCheck.info.isSubscribed && !proCheck.info.isAdmin ? (
            <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-2xs">
              Pass Pro
            </span>
          ) : (
            <span className="inline-flex items-center text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/25 text-white border border-white/30 shadow-2xs">
              ✨ Illimité
            </span>
          )}
        </div>
      </button>
    </div>
  );
};
