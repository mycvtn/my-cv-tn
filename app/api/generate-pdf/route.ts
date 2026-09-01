import { NextRequest, NextResponse } from "next/server";
import { generateLatexResume } from "@/lib/latex/templateEngine";
import { execFile } from "child_process";
import fs from "fs";
import path from "path";
import os from "os";
import util from "util";

const execFileAsync = util.promisify(execFile);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      resumeData, 
      outputType = "free_watermark", // 'free_watermark' (0 crédit) ou 'clean' (10 crédits)
      format = "pdf",
      userId 
    } = body;

    if (!resumeData || !resumeData.personalInfo) {
      return NextResponse.json({ error: "Données de CV manquantes" }, { status: 400 });
    }

    const isCleanRequested = outputType === "clean";

    // 1. Génération du Code Source LaTeX (avec ou sans filigrane my-cv.tn)
    const latexContent = generateLatexResume(resumeData, {
      isWatermarked: !isCleanRequested,
      watermarkText: "my-cv.tn"
    });

    // Si l'utilisateur demande le code source LaTeX brut
    if (format === "tex") {
      return new NextResponse(latexContent, {
        status: 200,
        headers: {
          "Content-Type": "application/x-tex",
          "Content-Disposition": `attachment; filename="CV_${encodeURIComponent(resumeData.personalInfo.fullName || "ATS")}.tex"`,
        },
      });
    }

    // 2. Compilation LaTeX
    let pdfBuffer: Buffer | null = null;

    try {
      const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "latex-cv-"));
      const texFile = path.join(tmpDir, "document.tex");
      const pdfFile = path.join(tmpDir, "document.pdf");

      fs.writeFileSync(texFile, latexContent, "utf8");

      await execFileAsync("pdflatex", ["-interaction=nonstopmode", "-output-directory", tmpDir, texFile], {
        timeout: 12000,
      });

      if (fs.existsSync(pdfFile)) {
        pdfBuffer = fs.readFileSync(pdfFile);
      }

      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      } catch (e) {}
    } catch (localError) {
      // Fallback Cloud LaTeX Engine
    }

    if (!pdfBuffer) {
      try {
        const compileUrl = `https://latexonline.cc/compile?text=${encodeURIComponent(latexContent)}`;
        const response = await fetch(compileUrl, {
          method: "GET",
          headers: { "User-Agent": "My-CV-TN/1.0" },
        });

        if (response.ok) {
          const arrayBuf = await response.arrayBuffer();
          pdfBuffer = Buffer.from(arrayBuf);
        }
      } catch (cloudErr) {
        console.error("Cloud LaTeX compilation error:", cloudErr);
      }
    }

    if (!pdfBuffer) {
      return NextResponse.json(
        {
          error: "Compilation LaTeX indisponible.",
          latexContent,
        },
        { status: 503 }
      );
    }

    const safeName = (resumeData.personalInfo.fullName || "Candidat").replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = isCleanRequested 
      ? `CV_${safeName}_Pro_A4.pdf` 
      : `CV_${safeName}_my-cv.tn.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("PDF Generation Route Error:", error);
    return NextResponse.json({ error: error.message || "Erreur interne" }, { status: 500 });
  }
}
