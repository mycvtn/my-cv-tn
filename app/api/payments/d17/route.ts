import { NextRequest, NextResponse } from "next/server";
import { redeemD17Code } from "@/lib/payments/d17";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, userId } = body;

    if (!code) {
      return NextResponse.json({ error: "Code D17 manquant" }, { status: 400 });
    }

    const result = await redeemD17Code(code, userId);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("D17 Voucher Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
