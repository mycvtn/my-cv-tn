"use client";

import { useState } from "react";
import { ResumeData } from "@/types/resume";
import confetti from "canvas-confetti";

export function useLatexPdf() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const downloadLatexPdf = async (resumeData: ResumeData): Promise<boolean> => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, format: "pdf" }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Échec de compilation LaTeX du PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanName = (resumeData.personalInfo.fullName || "ATS").replace(/[^a-zA-Z0-9]/g, "_");
      a.download = `CV_${cleanName}_Rami_Style.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      confetti({ particleCount: 90, spread: 60, origin: { y: 0.6 } });
      return true;
    } catch (err: any) {
      console.error("LaTeX PDF export error:", err);
      setError(err.message);
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadLatexSource = async (resumeData: ResumeData): Promise<boolean> => {
    try {
      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeData, format: "tex" }),
      });

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `CV_${(resumeData.personalInfo.fullName || "ATS").replace(/[^a-zA-Z0-9]/g, "_")}.tex`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
      return true;
    } catch (err: any) {
      console.error("LaTeX source export error:", err);
      return false;
    }
  };

  return {
    downloadLatexPdf,
    downloadLatexSource,
    isGenerating,
    error,
  };
}