import { NextRequest, NextResponse } from "next/server";
import { createKonnectPayment } from "@/lib/payments/konnect";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { amount, orderId, clientName, clientEmail, clientPhone } = body;

    const result = await createKonnectPayment({
      amount: amount || 15000, // 15 TND
      orderId: orderId || `KONN_${Date.now()}`,
      clientName: clientName || "Candidat My-CV",
      clientEmail: clientEmail || "user@example.tn",
      clientPhone: clientPhone || "+21620000000",
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Konnect Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
