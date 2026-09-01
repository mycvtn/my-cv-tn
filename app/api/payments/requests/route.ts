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
  method: "d17" | "flouci";
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
    credits: 25,
    amountTND: 20.0,
    receiptImageUrl: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200' viewBox='0 0 400 200'><rect width='400' height='200' fill='%23f1f5f9'/><text x='50%' y='35%' font-size='16' font-family='sans-serif' font-weight='bold' fill='%230f172a' text-anchor='middle'>Reçu Virement Flouci - Asma Sahraoui</text><text x='50%' y='60%' font-size='14' font-family='sans-serif' font-weight='bold' fill='%2310b981' text-anchor='middle'>Montant: 20.000 TND (25 Crédits)</text><text x='50%' y='80%' font-size='11' font-family='sans-serif' fill='%2364748b' text-anchor='middle'>Destinataire: my-cv.tn Administration</text></svg>",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
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
  const userId = searchParams.get("userId");
  const requests = readRequests();

  if (userId) {
    const userReqs = requests.filter(
      (r) => r.userId === userId || r.userEmail === "asma@gmail.com" || r.userName.toLowerCase().includes("asma")
    );
    return NextResponse.json({ success: true, requests: userReqs });
  }

  return NextResponse.json({ success: true, requests });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, userName, userEmail, method, credits, amountTND, receiptImageUrl } = body;

    if (!receiptImageUrl || !credits) {
      return NextResponse.json({ error: "Données de paiement incomplètes" }, { status: 400 });
    }

    const currentRequests = readRequests();
    const newReq: ServerPaymentRequest = {
      id: `pay-${Date.now()}`,
      userId: userId || "usr-asma-01",
      userName: userName || "Asma Sahraoui",
      userEmail: userEmail || "asma@gmail.com",
      method: method || "flouci",
      credits: Number(credits),
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

    return NextResponse.json({ success: true, request: updated.find((r) => r.id === requestId) });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
