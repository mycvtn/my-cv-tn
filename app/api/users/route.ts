import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

export interface ServerUserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: "user" | "admin";
  credits: number;
  status: "active" | "suspended";
  createdAt: string;
  lastLoginAt: string;
}

const DEFAULT_ADMIN: ServerUserAccount = {
  id: "usr-admin-01",
  name: "Administrateur MY-CV TN",
  email: "admin@my-cv.tn",
  password: "admin123",
  role: "admin",
  credits: 999,
  status: "active",
  createdAt: "2026-01-01T00:00:00.000Z",
  lastLoginAt: "2026-09-01T01:00:00.000Z",
};

const SEED_USERS: ServerUserAccount[] = [
  DEFAULT_ADMIN,
  {
    id: "usr-demo-02",
    name: "Yassine Ben Salem",
    email: "user@my-cv.tn",
    password: "password123",
    role: "user",
    credits: 280,
    status: "active",
    createdAt: "2026-08-15T10:30:00.000Z",
    lastLoginAt: "2026-09-01T20:00:00.000Z",
  },
  {
    id: "usr-asma-01",
    name: "Asma Sahraoui",
    email: "asma@gmail.com",
    password: "password123",
    role: "user",
    credits: 35,
    status: "active",
    createdAt: "2026-09-01T10:00:00.000Z",
    lastLoginAt: "2026-09-01T20:00:00.000Z",
  },
];

function readUsers(): ServerUserAccount[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, "utf-8");
      const list = JSON.parse(data);
      if (Array.isArray(list)) return list;
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(SEED_USERS, null, 2), "utf-8");
    return SEED_USERS;
  } catch (e) {
    return [DEFAULT_ADMIN];
  }
}

function writeUsers(users: ServerUserAccount[]): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
  } catch (e) {}
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.toLowerCase().trim();
  const id = searchParams.get("id");
  const users = readUsers();

  if (email || id) {
    const found = users.find(
      (u) =>
        (email && u.email.toLowerCase() === email) ||
        (id && u.id === id)
    );
    if (found) {
      return NextResponse.json({ success: true, user: found });
    }
    return NextResponse.json({ success: false, error: "Utilisateur non trouvé" }, { status: 404 });
  }

  return NextResponse.json({ success: true, users });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const users = readUsers();

    if (action === "authenticate") {
      const { email, password } = body;
      const normalizedEmail = (email || "").trim().toLowerCase();
      const found = users.find((u) => u.email.toLowerCase() === normalizedEmail);

      if (!found) {
        return NextResponse.json({ success: false, error: "Aucun compte trouvé avec cette adresse email." }, { status: 404 });
      }

      if (password && found.password && found.password !== password) {
        return NextResponse.json({ success: false, error: "Mot de passe incorrect." }, { status: 401 });
      }

      if (found.status === "suspended") {
        return NextResponse.json({ success: false, error: "Ce compte a été suspendu par un administrateur." }, { status: 403 });
      }

      return NextResponse.json({ success: true, user: found });
    }

    if (action === "update-credits") {
      const { userId, deltaOrExact, isExact } = body;
      const lookup = (userId || "").toString().trim().toLowerCase();

      let updatedTarget: ServerUserAccount | null = null;
      const updatedList = users.map((u) => {
        const matchId = u.id.toLowerCase() === lookup;
        const matchEmail = u.email.toLowerCase() === lookup;

        if (matchId || matchEmail) {
          const newCredits = isExact ? Math.max(0, deltaOrExact) : Math.max(0, (u.credits || 0) + deltaOrExact);
          updatedTarget = { ...u, credits: newCredits };
          return updatedTarget;
        }
        return u;
      });

      writeUsers(updatedList);
      return NextResponse.json({ success: true, user: updatedTarget, users: updatedList });
    }

    if (action === "register") {
      const { name, email, password } = body;
      const normalizedEmail = (email || "").trim().toLowerCase();

      if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
        return NextResponse.json({ error: "Email déjà utilisé" }, { status: 400 });
      }

      const newUser: ServerUserAccount = {
        id: `usr-${Date.now()}`,
        name: name.trim() || "Nouvel Utilisateur",
        email: normalizedEmail,
        password: password || "password123",
        role: "user",
        credits: 5,
        status: "active",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const updatedList = [newUser, ...users];
      writeUsers(updatedList);
      return NextResponse.json({ success: true, user: newUser });
    }

    if (action === "admin-create") {
      const { user } = body;
      if (!user || !user.email) {
        return NextResponse.json({ error: "Données incomplètes" }, { status: 400 });
      }
      const normalizedEmail = (user.email || "").trim().toLowerCase();
      if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
        return NextResponse.json({ error: "Email déjà utilisé" }, { status: 400 });
      }
      const updatedList = [user, ...users];
      writeUsers(updatedList);
      return NextResponse.json({ success: true, user });
    }

    if (action === "toggle-status") {
      const { userId } = body;
      const updatedList = users.map((u) => {
        if (u.id === userId || u.email.toLowerCase() === userId.toLowerCase()) {
          return { ...u, status: (u.status === "active" ? "suspended" : "active") as any };
        }
        return u;
      });
      writeUsers(updatedList);
      return NextResponse.json({ success: true, users: updatedList });
    }

    if (action === "delete") {
      const { userId } = body;
      const lookup = (userId || "").toString().trim().toLowerCase();
      const updatedList = users.filter((u) => u.id !== userId && u.email.toLowerCase() !== lookup);
      writeUsers(updatedList);
      return NextResponse.json({ success: true, users: updatedList });
    }

    if (action === "delete-all-users") {
      // Retain only administrator accounts
      const updatedList = users.filter((u) => u.role === "admin");
      writeUsers(updatedList);
      return NextResponse.json({ success: true, users: updatedList });
    }

    return NextResponse.json({ error: "Action inconnue" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
