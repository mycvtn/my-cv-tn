import { NextRequest, NextResponse } from "next/server";
import { createFlouciPayment, verifyFlouciPayment } from "@/lib/payments/flouci";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, amount, orderId, successUrl, failUrl, paymentId } = body;

    if (action === "create") {
      const result = await createFlouciPayment({
        amount: amount || 5000, // 5 TND default
        orderId: orderId || `ORD_${Date.now()}`,
        successUrl: successUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:1500"}/builder?payment=flouci_success`,
        failUrl: failUrl || `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:1500"}/builder?payment=flouci_failed`,
      });
      return NextResponse.json(result);
    }

    if (action === "verify") {
      const result = await verifyFlouciPayment(paymentId);
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    console.error("Flouci Route Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
