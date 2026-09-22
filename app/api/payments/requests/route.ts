import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const REQUESTS_FILE = path.join(DATA_DIR, "payment_requests.json");
const USERS_FILE = path.join(DATA_DIR, "users.json");

export interface ServerPaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  method: "d17" | "flouci" | string;
  planType?: "semi_annual" | "annual";
  credits: number;
  amountTND: number;
  receiptImageUrl: string;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string;
  reviewedAt?: string;
}

const SEED_REQUESTS: ServerPaymentRequest[] = [
  {
    id: "pay-asma-01",
    userId: "usr-asma-01",
    userName: "Asma Sahraoui",
    userEmail: "asma@gmail.com",
    method: "flouci",
    planType: "semi_annual",
    credits: 18,
    amountTND: 15.0,
    receiptImageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' fill='%23f1f5f9'/><text x='50%' y='35%' font-size='16' font-family='sans-serif' font-weight='bold' fill='%230f172a' text-anchor='middle'>Reçu Virement Flouci - Asma Sahraoui</text><text x='50%' y='60%' font-size='14' font-family='sans-serif' font-weight='bold' fill='%2310b981' text-anchor='middle'>Pass Semestriel - 15.000 TND</text><text x='50%' y='80%' font-size='11' font-family='sans-serif' fill='%2364748b' text-anchor='middle'>Destinataire: my-cv.tn Administration</text></svg>",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "pay-1788201",
    userId: "usr-demo-02",
    userName: "Ahmed Mansour",
    userEmail: "ahmed@example.com",
    method: "d17",
    planType: "annual",
    credits: 36,
    amountTND: 25.0,
    receiptImageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' fill='%23f1f5f9'/><text x='50%' y='40%' font-size='16' font-family='sans-serif' font-weight='bold' fill='%230f172a' text-anchor='middle'>Reçu Transaction D17 #D17-44019</text><text x='50%' y='60%' font-size='14' font-family='sans-serif' fill='%2310b981' text-anchor='middle'>Pass Annuel - 25.000 TND</text><text x='50%' y='80%' font-size='11' font-family='sans-serif' fill='%2364748b' text-anchor='middle'>Vers: 98 123 456</text></svg>",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];

function readRequests(): ServerPaymentRequest[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(REQUESTS_FILE)) {
      const data = fs.readFileSync(REQUESTS_FILE, "utf-8");
      return JSON.parse(data);
    }
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(SEED_REQUESTS, null, 2), "utf-8");
    return SEED_REQUESTS;
  } catch (e) {
    return SEED_REQUESTS;
  }
}

function writeRequests(reqs: ServerPaymentRequest[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(reqs, null, 2), "utf-8");
  } catch (e) {}
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId")?.toLowerCase().trim();
  const email = searchParams.get("email")?.toLowerCase().trim();
  const requests = readRequests();

  if (userId || email) {
    const userReqs = requests.filter(
      (r) =>
        (userId && r.userId && r.userId.toLowerCase() === userId) ||
        (email && r.userEmail && r.userEmail.toLowerCase() === email)
    );
    return NextResponse.json({ success: true, requests: userReqs });
  }

  return NextResponse.json({ success: true, requests });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userName, userEmail, method, planType, credits, amountTND, receiptImageUrl } = body;

    if (!receiptImageUrl) {
      return NextResponse.json({ error: "Données de paiement incomplètes" }, { status: 400 });
    }

    const currentRequests = readRequests();
    const chosenPlan = planType || (Number(amountTND) >= 40 ? "annual" : "semi_annual");
    const newReq: ServerPaymentRequest = {
      id: `pay-${Date.now()}`,
      userId: userId || `usr-${Date.now()}`,
      userName: userName || "Utilisateur",
      userEmail: userEmail || "candidat@my-cv.tn",
      method: method || "flouci",
      planType: chosenPlan,
      credits: Number(credits) || (chosenPlan === "annual" ? 36 : 18),
      amountTND: Number(amountTND),
      receiptImageUrl,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const updated = [newReq, ...currentRequests];
    writeRequests(updated);

    return NextResponse.json({ success: true, request: newReq });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { requestId, action, reason } = body; // action: "approve" | "reject"

    const currentRequests = readRequests();
    const target = currentRequests.find((r) => r.id === requestId);

    if (!target) {
      return NextResponse.json({ error: "Demande introuvable" }, { status: 404 });
    }

    const updated = currentRequests.map((r) => {
      if (r.id === requestId) {
        if (action === "approve") {
          return {
            ...r,
            status: "approved" as const,
            reviewedAt: new Date().toISOString(),
          };
        } else {
          return {
            ...r,
            status: "rejected" as const,
            rejectionReason: reason || "Justificatif de paiement non conforme ou virement non reçu.",
            reviewedAt: new Date().toISOString(),
          };
        }
      }
      return r;
    });

    writeRequests(updated);

    // If approved, update user subscription directly in users.json on server disk
    if (action === "approve") {
      try {
        if (fs.existsSync(USERS_FILE)) {
          const usersRaw = fs.readFileSync(USERS_FILE, "utf-8");
          const usersList = JSON.parse(usersRaw);
          if (Array.isArray(usersList)) {
            const plan = target.planType || (target.amountTND >= 40 ? "annual" : "semi_annual");
            const duration = plan === "annual" ? 12 : 6;
            const expiry = new Date();
            expiry.setMonth(expiry.getMonth() + duration);
            const nextReset = new Date();
            nextReset.setMonth(nextReset.getMonth() + 1);

            const userLookup = (target.userId || target.userEmail || "").toLowerCase().trim();
            const updatedUsers = usersList.map((u: any) => {
              if (
                (u.id && u.id.toLowerCase() === userLookup) ||
                (u.email && u.email.toLowerCase() === target.userEmail.toLowerCase().trim())
              ) {
                return {
                  ...u,
                  subscriptionTier: plan,
                  subscriptionStatus: "active",
                  subscriptionExpiresAt: expiry.toISOString(),
                  monthlyDownloadsUsed: 0,
                  downloadsResetDate: nextReset.toISOString(),
                };
              }
              return u;
            });
            fs.writeFileSync(USERS_FILE, JSON.stringify(updatedUsers, null, 2), "utf-8");
          }
        }
      } catch (e) {}
    }

    return NextResponse.json({ success: true, request: updated.find((r) => r.id === requestId) });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
