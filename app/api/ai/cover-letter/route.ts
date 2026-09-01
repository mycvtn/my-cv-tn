import { NextRequest, NextResponse } from "next/server";
import { generateCoverLetter } from "@/lib/gemini/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { candidateData, jobData } = body;

    if (!candidateData || !jobData || !jobData.jobTitle || !jobData.companyName) {
      return NextResponse.json(
        { error: "Missing required candidate or job data" },
        { status: 400 }
      );
    }

    const coverLetter = await generateCoverLetter(candidateData, jobData);
    return NextResponse.json({ success: true, coverLetter });
  } catch (error: any) {
    console.error("Cover Letter Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Error generating cover letter" },
      { status: 500 }
    );
  }
}
