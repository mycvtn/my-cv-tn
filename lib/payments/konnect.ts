/**
 * Konnect Payment Gateway Integration Helper
 * Official API documentation: https://konnect.network
 */

export interface KonnectPaymentPayload {
  amount: number; // in Millimes
  orderId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
}

export async function createKonnectPayment(payload: KonnectPaymentPayload) {
  const apiKey = process.env.KONNECT_API_KEY;
  const walletId = process.env.KONNECT_WALLET_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:1500";

  if (!apiKey || !walletId) {
    return {
      success: true,
      payUrl: `https://api.preprod.konnect.network/gateway/pay?token=demo_${payload.orderId}`,
      paymentRef: `konnect_demo_${Date.now()}`,
      isMock: true,
    };
  }

  const response = await fetch("https://api.konnect.network/api/v2/payments/init-payment", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      receiverWalletId: walletId,
      token: "TND",
      amount: payload.amount,
      type: "immediate",
      description: `Paiement MY-CV.TN - Commande #${payload.orderId}`,
      acceptedPaymentMethods: ["bank_card", "e-DINAR", "flouci"],
      lifespan: 30,
      checkoutForm: false,
      addPaymentFeesToAmount: true,
      firstName: payload.clientName.split(" ")[0] || "Client",
      lastName: payload.clientName.split(" ").slice(1).join(" ") || "My-CV",
      phoneNumber: payload.clientPhone || "20000000",
      email: payload.clientEmail || "client@my-cv.tn",
      orderId: payload.orderId,
      webhook: `${appUrl}/api/payments/konnect/webhook`,
      silentWebhook: true,
      successUrl: `${appUrl}/builder?payment=success&orderId=${payload.orderId}`,
      failUrl: `${appUrl}/builder?payment=failed`,
    }),
  });

  const data = await response.json();
  return data;
}
