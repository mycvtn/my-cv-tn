import { NextRequest, NextResponse } from "next/server";
import { optimizeBulletPoint, analyzeJobMatch } from "@/lib/gemini/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, bullet, role, resumeText, jobDescription, language } = body;

    if (action === "bullet") {
      if (!bullet) {
        return NextResponse.json({ error: "Missing bullet point" }, { status: 400 });
      }
      const optimized = await optimizeBulletPoint(bullet, role || "", language || "fr");
      return NextResponse.json({ success: true, optimized });
    }

    if (action === "ats_match") {
      if (!jobDescription) {
        return NextResponse.json({ error: "Missing job description" }, { status: 400 });
      }
      const analysis = await analyzeJobMatch(resumeText || "", jobDescription, language || "fr");
      return NextResponse.json({ success: true, analysis });
    }

    return NextResponse.json({ error: "Invalid action specified" }, { status: 400 });
  } catch (error: any) {
    console.error("AI Route Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred during AI processing" },
      { status: 500 }
    );
  }
}
