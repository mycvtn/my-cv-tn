/**
 * Flouci Payment Gateway Integration Helper
 * Official API documentation: https://developers.flouci.com
 */

export interface FlouciPaymentPayload {
  amount: number; // in Millimes (e.g. 5000 = 5 TND)
  successUrl: string;
  failUrl: string;
  orderId: string;
}

export async function createFlouciPayment(payload: FlouciPaymentPayload) {
  const appToken = process.env.FLOUCI_APP_TOKEN;
  const appSecret = process.env.FLOUCI_APP_SECRET;

  if (!appToken || !appSecret) {
    // Return mock sandbox payment session for testing
    return {
      success: true,
      paymentId: `flouci_demo_${Date.now()}`,
      paymentUrl: `https://sandbox.flouci.com/pay/${payload.orderId}?demo=true`,
      isMock: true,
    };
  }

  const response = await fetch("https://api.flouci.com/api/generate_payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      app_token: appToken,
      app_secret: appSecret,
      amount: payload.amount,
      accept_card: "true",
      session_timeout_secs: 1200,
      success_link: payload.successUrl,
      fail_link: payload.failUrl,
      developer_tracking_id: payload.orderId,
    }),
  });

  const data = await response.json();
  if (data.result && data.result.success) {
    return {
      success: true,
      paymentId: data.result.payment_id,
      paymentUrl: `https://app.flouci.com/payment/${data.result.payment_id}`,
      isMock: false,
    };
  } else {
    throw new Error(data.message || "Failed to initialize Flouci payment");
  }
}

export async function verifyFlouciPayment(paymentId: string) {
  const appToken = process.env.FLOUCI_APP_TOKEN;
  const appSecret = process.env.FLOUCI_APP_SECRET;

  if (!appToken || !appSecret) {
    return { success: true, verified: true, isMock: true };
  }

  const response = await fetch(`https://api.flouci.com/api/verify_payment/${paymentId}`, {
    headers: {
      "Content-Type": "application/json",
      "apppublic": appToken,
      "appsecret": appSecret,
    },
  });

  const data = await response.json();
  return data;
}
