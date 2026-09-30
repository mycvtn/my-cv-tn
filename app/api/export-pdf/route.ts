import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

/**
 * Read all compiled Tailwind and Next.js CSS files directly from disk (.next/static/css)
 * This guarantees 100% offline styling parity on Linux/Ubuntu without any network/CORS issues.
 */
function getLocalCompiledCss(): string {
  try {
    const cssPath = path.join(process.cwd(), ".next", "static", "css");
    if (!fs.existsSync(cssPath)) return "";
    let accumulated = "";
    const walk = (dir: string) => {
      for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, item.name);
        if (item.isDirectory()) walk(full);
        else if (item.name.endsWith(".css")) accumulated += fs.readFileSync(full, "utf8") + "\n";
      }
    };
    walk(cssPath);
    return accumulated;
  } catch (e) {
    return "";
  }
}

export async function POST(req: NextRequest) {
  let browser: any = null;
  try {
    const body = await req.json();
    const { html, styles = "", fileName = "Mon_CV_A4.pdf", isWatermarked = false, margin = "0mm", documentType } = body;

    if (!html) {
      return NextResponse.json({ error: "Contenu HTML manquant" }, { status: 400 });
    }

    const isCoverLetter = 
      documentType === "cover_letter" || 
      fileName.toLowerCase().includes("lettre") || 
      fileName.toLowerCase().includes("motivation") || 
      fileName.toLowerCase().includes("cover");

    const host = req.headers.get("host") || "localhost:1500";
    const forwardedProto = req.headers.get("x-forwarded-proto");
    const protocol = forwardedProto || (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");
    const baseUrl = `${protocol}://${host}/`;

    // 1. Gather all compiled styles directly from disk
    const diskCss = getLocalCompiledCss();

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=794, initial-scale=1" />
          <base href="${baseUrl}" />
          <!-- Google Fonts Inter for identical cross-platform rendering -->
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
          <!-- Fallback Tailwind CDN in case disk CSS is not built -->
          <script src="https://cdn.tailwindcss.com"></script>
          ${styles}
          <style>
            ${diskCss}
          </style>
          <style>
            @page {
              size: 210mm 297mm;
              margin: 0;
            }
            *, *::before, *::after {
              box-sizing: border-box !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
              color-adjust: exact !important;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif !important;
              width: 210mm !important;
              max-width: 210mm !important;
              -webkit-font-smoothing: antialiased;
              text-rendering: geometricPrecision;
            }
            header, aside, div, span, p, h1, h2, h3, ul, li {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }

            /* Professional Margins for Motivation Letter (Lettre de Motivation) */
            #cover-letter-sheet-export, .cover-letter-sheet-export {
              box-shadow: none !important;
              border: none !important;
              border-radius: 0 !important;
              margin: 0 auto !important;
              padding: 18mm 20mm 16mm 20mm !important;
              width: 210mm !important;
              max-width: 210mm !important;
              min-height: 297mm !important;
              box-sizing: border-box !important;
              position: relative !important;
              background: #ffffff !important;
              color: #0f172a !important;
              display: flex !important;
              flex-direction: column !important;
              justify-content: space-between !important;
            }

            /* Zero/3mm Bleed Margins for CV / Resume */
            #resume-sheet-preview {
              box-shadow: none !important;
              border: none !important;
              margin: 0 auto !important;
              padding: 3mm !important;
              width: 794px !important;
              max-width: 794px !important;
              min-height: 1123px !important;
              transform: none !important;
              position: relative !important;
              background: #ffffff !important;
              color: #0f172a !important;
              box-sizing: border-box !important;
            }

            .break-inside-avoid {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            section {
              break-inside: auto;
              page-break-inside: auto;
            }
            .export-ignore {
              display: none !important;
            }
            .full-page-watermark {
              position: fixed;
              inset: 0;
              width: 100vw;
              height: 100vh;
              pointer-events: none;
              z-index: 99999;
              background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='280' height='160' viewBox='0 0 280 160'><text x='50%' y='50%' fill='%23000000' fill-opacity='0.22' font-size='24' font-family='sans-serif' font-weight='900' text-anchor='middle' transform='rotate(-35 140 80)'>my-cv.tn</text></svg>");
              background-repeat: repeat;
            }
          </style>
        </head>
        <body class="bg-white text-slate-900 m-0 p-0">
          <div id="${isCoverLetter ? "cover-letter-sheet-export" : "resume-sheet-preview"}" class="${isCoverLetter ? "cover-letter-sheet-export" : ""}">
            ${html}
            ${isWatermarked ? `<div class="full-page-watermark"></div>` : ""}
          </div>
        </body>
      </html>
    `;

    // Detect Linux system Chromium/Chrome path automatically
    let executablePath: string | undefined = process.env.PUPPETEER_EXECUTABLE_PATH;
    if (!executablePath && process.platform === "linux") {
      const possiblePaths = [
        "/usr/bin/chromium-browser",
        "/usr/bin/chromium",
        "/usr/bin/google-chrome-stable",
        "/usr/bin/google-chrome",
        "/snap/bin/chromium",
      ];
      for (const p of possiblePaths) {
        try {
          if (fs.existsSync(p)) {
            executablePath = p;
            break;
          }
        } catch (e) {}
      }
    }

    const launchConfig: any = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--font-render-hinting=none",
      ],
    };

    if (executablePath) {
      launchConfig.executablePath = executablePath;
    }

    browser = await puppeteer.launch(launchConfig);

    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    
    // Load content and wait for network and fonts
    await page.setContent(fullHtml, { waitUntil: ["domcontentloaded", "load"], timeout: 15000 }).catch(() => {});

    await page.evaluate(async () => {
      // Ensure all images are loaded
      const imgs = Array.from(document.querySelectorAll("img"));
      await Promise.all(
        imgs.map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      // Ensure fonts are ready
      // @ts-ignore
      if (document.fonts) await document.fonts.ready;
    });

    const pdfUint8 = await page.pdf({
      format: "A4",
      width: "210mm",
      height: "297mm",
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
      printBackground: true,
      preferCSSPageSize: true,
    });

    await browser.close();
    browser = null;

    const cleanBaseName = fileName.replace(/\.pdf$/i, "");
    const safeFileName = `${encodeURIComponent(cleanBaseName)}_A4.pdf`;

    return new NextResponse(new Uint8Array(pdfUint8), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${safeFileName}"; filename*=UTF-8''${safeFileName}`,
        "Content-Length": pdfUint8.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Puppeteer PDF Export Error:", error);
    if (browser) {
      try {
        await browser.close();
      } catch (e) {}
    }
    return NextResponse.json({ error: error.message || "Échec génération PDF" }, { status: 500 });
  }
}