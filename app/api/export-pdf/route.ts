import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: NextRequest) {
  let browser = null;
  try {
    const body = await req.json();
    const { html, styles = "", fileName = "Mon_CV_A4.pdf", isWatermarked = false, margin = "10mm" } = body;

    if (!html) {
      return NextResponse.json({ error: "Contenu HTML manquant" }, { status: 400 });
    }

    const host = req.headers.get("host") || "localhost:1500";
    const protocol = host.startsWith("localhost") ? "http" : "https";
    const baseUrl = `${protocol}://${host}/`;

    const fullHtml = `
      <!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <base href="${baseUrl}" />
          <script src="https://cdn.tailwindcss.com"></script>
          ${styles}
          <style>
            @page {
              size: A4 portrait;
              margin: ${margin};
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
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
              width: 100% !important;
              -webkit-font-smoothing: antialiased;
            }
            header, aside, div, span, p, h1, h2, h3, ul, li {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            #resume-sheet-preview, #cover-letter-sheet, #modal-cover-letter-sheet {
              box-shadow: none !important;
              border: none !important;
              margin: 0 auto !important;
              padding: 0 !important;
              width: 100% !important;
              max-width: 100% !important;
              min-height: auto !important;
              transform: none !important;
              position: relative !important;
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
        <body>
          <div id="resume-sheet-preview">
            ${html}
            ${isWatermarked ? `<div class="full-page-watermark"></div>` : ""}
          </div>
        </body>
      </html>
    `;

    browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--font-render-hinting=none",
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    
    // Load content and wait for full load and fonts
    await page.setContent(fullHtml, { waitUntil: ["load", "domcontentloaded"], timeout: 15000 }).catch(() => {
      // If timeout, continue
    });

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
      margin: {
        top: margin,
        right: margin,
        bottom: margin,
        left: margin,
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