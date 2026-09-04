"use client";

import { adminUpdateUserCredits } from "@/lib/auth/authStore";

export type PaymentMethod = "d17" | "flouci" | string;
export type PaymentStatus = "pending" | "approved" | "rejected";

export interface CustomPaymentMethod {
  id: string;
  name: string;
  icon?: string;
  accountNumber: string;
  accountHolder: string;
  instructions: string;
  enabled: boolean;
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  method: PaymentMethod;
  credits: number;
  amountTND: number;
  receiptImageUrl: string;
  status: PaymentStatus;
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface PaymentSettings {
  d17PhoneNumber: string;
  d17AccountHolder: string;
  d17Instructions: string;
  d17Enabled?: boolean;
  flouciAccount: string;
  flouciAccountHolder: string;
  flouciInstructions: string;
  flouciEnabled?: boolean;
  customMethods?: CustomPaymentMethod[];
}

const DEFAULT_SETTINGS: PaymentSettings = {
  d17PhoneNumber: "98 123 456",
  d17AccountHolder: "my-cv.tn Administration",
  d17Instructions: "Effectuez le transfert vers ce numéro D17 puis téléversez la capture d'écran du reçu.",
  d17Enabled: true,
  flouciAccount: "flouci.me/mycv_tn / RIB: 08 000 000123456789 20",
  flouciAccountHolder: "MY-CV TUNISIE",
  flouciInstructions: "Envoyez le montant via l'application Flouci ou par virement bancaire puis attachez le justificatif.",
  flouciEnabled: true,
  customMethods: [
    {
      id: "meth-rib-01",
      name: "Virement Bancaire (RIB)",
      icon: "🏦",
      accountNumber: "RIB: 08 014 000123456789 54 (Attijari Bank)",
      accountHolder: "MY-CV TUNISIE SARL",
      instructions: "Effectuez un virement bancaire vers notre RIB, puis téléversez l'avis d'opération ou le reçu.",
      enabled: true,
    }
  ],
};

const PAYMENT_SETTINGS_KEY = "my_cv_payment_settings";
const PAYMENT_REQUESTS_KEY = "my_cv_payment_requests";

// Initial Seed Requests
const SEED_REQUESTS: PaymentRequest[] = [
  {
    id: "pay-asma-01",
    userId: "usr-asma-01",
    userName: "Asma Sahraoui",
    userEmail: "asma@gmail.com",
    method: "flouci",
    credits: 25,
    amountTND: 20.0,
    receiptImageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' fill='%23f1f5f9'/><text x='50%' y='35%' font-size='16' font-family='sans-serif' font-weight='bold' fill='%230f172a' text-anchor='middle'>Reçu Virement Flouci - Asma Sahraoui</text><text x='50%' y='60%' font-size='14' font-family='sans-serif' font-weight='bold' fill='%2310b981' text-anchor='middle'>Montant: 20.000 TND (25 Crédits)</text><text x='50%' y='80%' font-size='11' font-family='sans-serif' fill='%2364748b' text-anchor='middle'>Destinataire: my-cv.tn Administration</text></svg>",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
  },
  {
    id: "pay-1788201",
    userId: "usr-demo-02",
    userName: "Ahmed Mansour",
    userEmail: "ahmed@example.com",
    method: "d17",
    credits: 50,
    amountTND: 40.0,
    receiptImageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' fill='%23f1f5f9'/><text x='50%' y='40%' font-size='16' font-family='sans-serif' font-weight='bold' fill='%230f172a' text-anchor='middle'>Reçu Transaction D17 #D17-44019</text><text x='50%' y='60%' font-size='14' font-family='sans-serif' fill='%2310b981' text-anchor='middle'>Montant: 40.000 TND (Envoyé)</text><text x='50%' y='80%' font-size='11' font-family='sans-serif' fill='%2364748b' text-anchor='middle'>Vers: 98 123 456</text></svg>",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

export function getPaymentSettings(): PaymentSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(PAYMENT_SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return DEFAULT_SETTINGS;
}

export function savePaymentSettings(settings: PaymentSettings): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PAYMENT_SETTINGS_KEY, JSON.stringify(settings));
  try {
    fetch("/api/payments/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    }).catch(() => {});
  } catch (e) {}
}

export function getPaymentRequests(): PaymentRequest[] {
  if (typeof window === "undefined") return SEED_REQUESTS;
  try {
    const raw = localStorage.getItem(PAYMENT_REQUESTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    localStorage.setItem(PAYMENT_REQUESTS_KEY, JSON.stringify(SEED_REQUESTS));
    return SEED_REQUESTS;
  } catch (e) {}
  return SEED_REQUESTS;
}

export async function fetchServerPaymentRequests(): Promise<PaymentRequest[]> {
  try {
    const res = await fetch("/api/payments/requests", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.requests && Array.isArray(data.requests)) {
        if (typeof window !== "undefined") {
          localStorage.setItem(PAYMENT_REQUESTS_KEY, JSON.stringify(data.requests));
          window.dispatchEvent(new Event("payment_requests_updated"));
        }
        return data.requests;
      }
    }
  } catch (e) {}
  return getPaymentRequests();
}

export function savePaymentRequests(reqs: PaymentRequest[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PAYMENT_REQUESTS_KEY, JSON.stringify(reqs));
  try {
    window.dispatchEvent(new Event("payment_requests_updated"));
  } catch (e) {}
}

export function getUserPaymentRequests(userId: string, email?: string): PaymentRequest[] {
  if (!userId && !email) return [];
  const all = getPaymentRequests();
  const normalizedUserId = (userId || "").trim().toLowerCase();
  const normalizedEmail = (email || "").trim().toLowerCase();

  return all.filter((r) => {
    const matchId = normalizedUserId && r.userId && r.userId.toLowerCase() === normalizedUserId;
    const matchEmail = normalizedEmail && r.userEmail && r.userEmail.toLowerCase() === normalizedEmail;
    return matchId || matchEmail;
  });
}

export async function createPaymentRequest(
  userId: string,
  userName: string,
  userEmail: string,
  method: PaymentMethod,
  credits: number,
  amountTND: number,
  receiptImageUrl: string
): Promise<PaymentRequest> {
  const all = getPaymentRequests();
  const newReq: PaymentRequest = {
    id: `pay-${Date.now()}`,
    userId: userId || `usr-${Date.now()}`,
    userName: userName || "Utilisateur",
    userEmail: userEmail || "candidat@my-cv.tn",
    method,
    credits,
    amountTND,
    receiptImageUrl,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const updated = [newReq, ...all];
  savePaymentRequests(updated);

  // Send to server disk API
  try {
    await fetch("/api/payments/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newReq),
    });
  } catch (e) {}

  return newReq;
}

export async function approvePaymentRequest(requestId: string): Promise<{ success: boolean; request?: PaymentRequest; error?: string }> {
  const all = getPaymentRequests();
  const target = all.find((r) => r.id === requestId);

  if (!target) {
    return { success: false, error: "Demande introuvable" };
  }

  if (target.status === "approved") {
    return { success: false, error: "Cette demande est déjà validée" };
  }

  // 1. Credit the user account
  adminUpdateUserCredits(target.userId, target.credits, false);

  // 2. Mark request as approved
  const updatedList = all.map((r) => {
    if (r.id === requestId) {
      return {
        ...r,
        status: "approved" as PaymentStatus,
        reviewedAt: new Date().toISOString(),
      };
    }
    return r;
  });

  savePaymentRequests(updatedList);

  // Sync to server disk
  try {
    await fetch("/api/payments/requests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action: "approve" }),
    });
  } catch (e) {}

  return { success: true, request: updatedList.find((r) => r.id === requestId) };
}

export async function rejectPaymentRequest(requestId: string, reason: string): Promise<{ success: boolean; request?: PaymentRequest; error?: string }> {
  const all = getPaymentRequests();
  const target = all.find((r) => r.id === requestId);

  if (!target) {
    return { success: false, error: "Demande introuvable" };
  }

  const updatedList = all.map((r) => {
    if (r.id === requestId) {
      return {
        ...r,
        status: "rejected" as PaymentStatus,
        rejectionReason: reason || "Justificatif de paiement non valide ou introuvable.",
        reviewedAt: new Date().toISOString(),
      };
    }
    return r;
  });

  savePaymentRequests(updatedList);

  // Sync to server disk
  try {
    await fetch("/api/payments/requests", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action: "reject", reason }),
    });
  } catch (e) {}

  return { success: true, request: updatedList.find((r) => r.id === requestId) };
}
