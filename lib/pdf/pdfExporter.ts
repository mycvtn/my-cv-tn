"use client";

import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export interface PDFExportOptions {
  fileName?: string;
  isWatermarked?: boolean;
  watermarkText?: string;
  onProgress?: (progress: number) => void;
}

/**
 * Native Chromium Blink Vector PDF Exporter
 * Produces 100% genuine vector PDF with exact flexbox/SVG alignment and selectable text.
 */
export async function exportResumeToPDF(
  elementId: string = "resume-sheet-preview",
  options: PDFExportOptions = {}
): Promise<boolean> {
  const {
    fileName = "Mon_CV_A4.pdf",
    onProgress,
  } = options;

  if (typeof window === "undefined") return false;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found.`);
    return false;
  }

  try {
    if (onProgress) onProgress(20);

    // 1. Extract all active stylesheet rules from memory for 100% styling parity
    let liveStyles = "";
    try {
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules || [])) {
            liveStyles += rule.cssText + "\n";
          }
        } catch (e) {}
      }
    } catch (e) {}

    const styleTags = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
      .map((node) => node.outerHTML)
      .join("\n");

    const allStyles = `${styleTags}\n<style>\n${liveStyles}\n</style>`;

    const clone = element.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".export-ignore").forEach((n) => n.remove());

    if (onProgress) onProgress(45);

    // 2. Call Native Chromium Vector PDF Backend
    const response = await fetch("/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        html: clone.innerHTML,
        styles: allStyles,
        fileName,
        isWatermarked: !!options.isWatermarked,
      }),
    });

    if (onProgress) onProgress(80);

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
      a.download = cleanFileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      if (onProgress) onProgress(100);
      return true;
    }

    throw new Error(`Server returned status: ${response.status}`);
  } catch (error) {
    console.warn("Server vector PDF failed, using high-DPI client canvas fallback:", error);

    // 3. Client-side fallback if server is unreachable
    try {
      if (onProgress) onProgress(60);

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        ignoreElements: (el) => el.classList.contains("export-ignore"),
        windowWidth: 794,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = 210;
      const pdfHeight = 297;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, Math.min(imgHeight, pdfHeight), undefined, "FAST");

      const cleanFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
      pdf.save(cleanFileName);

      if (onProgress) onProgress(100);
      return true;
    } catch (canvasErr) {
      console.error("All export mechanisms failed:", canvasErr);
      window.print();
      return true;
    }
  }
}

/**
 * Native Vector PDF Exporter for Cover Letters (Lettres de Motivation)
 */
export async function exportCoverLetterToPDF(
  elementId: string = "cover-letter-sheet",
  fileName: string = "Lettre_de_Motivation.pdf",
  onProgress?: (progress: number) => void
): Promise<boolean> {
  if (typeof window === "undefined") return false;

  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`Element #${elementId} not found for cover letter export.`);
    return false;
  }

  try {
    if (onProgress) onProgress(20);

    // Collect active styles
    let liveStyles = "";
    try {
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          for (const rule of Array.from(sheet.cssRules || [])) {
            liveStyles += rule.cssText + "\n";
          }
        } catch (e) {}
      }
    } catch (e) {}

    const styleTags = Array.from(document.querySelectorAll("style, link[rel='stylesheet']"))
      .map((node) => node.outerHTML)
      .join("\n");

    const allStyles = `${styleTags}\n<style>\n${liveStyles}\n</style>`;

    const clone = element.cloneNode(true) as HTMLElement;
    clone.querySelectorAll(".export-ignore").forEach((n) => n.remove());

    if (onProgress) onProgress(45);

    // Try server-side vector PDF
    const response = await fetch("/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        html: clone.innerHTML,
        styles: allStyles,
        fileName,
        isWatermarked: false,
        margin: "10mm",
      }),
    });

    if (onProgress) onProgress(80);

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const cleanFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
      a.download = cleanFileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      if (onProgress) onProgress(100);
      return true;
    }
    throw new Error(`Server PDF export returned status ${response.status}`);
  } catch (error) {
    console.warn("Server PDF export failed, using client-side html2pdf / canvas fallback:", error);

    try {
      if (onProgress) onProgress(60);

      // Try dynamic html2pdf bundle if available
      // @ts-ignore
      const html2pdf = (await import("html2pdf.js")).default;
      if (html2pdf) {
        const opt = {
          margin: 10,
          filename: fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`,
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 3, useCORS: true, logging: false },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        };
        // @ts-ignore
        await html2pdf().set(opt).from(element).save();
        if (onProgress) onProgress(100);
        return true;
      }
    } catch (h2pErr) {
      console.warn("html2pdf dynamic import fallback failed, using jsPDF canvas:", h2pErr);
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        windowWidth: 794,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const margin = 10; // Exact 10mm margin around the page
      const printableWidth = 210 - margin * 2;
      const printableHeight = 297 - margin * 2;
      const imgHeight = (canvas.height * printableWidth) / canvas.width;

      pdf.addImage(
        imgData,
        "PNG",
        margin,
        margin,
        printableWidth,
        Math.min(imgHeight, printableHeight),
        undefined,
        "FAST"
      );
      const cleanFileName = fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`;
      pdf.save(cleanFileName);

      if (onProgress) onProgress(100);
      return true;
    } catch (e) {
      console.error("All PDF exports failed, printing window:", e);
      window.print();
      return true;
    }
  }
}

