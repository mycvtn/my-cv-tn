import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

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
    id: "usr-admin-02",
    name: "Rami GOUADER",
    email: "ramigouader@gmail.com",
    password: "R@mail1603",
    role: "admin",
    credits: 999,
    status: "active",
    createdAt: "2026-09-04T15:46:58.019Z",
    lastLoginAt: "2026-09-04T15:46:58.019Z",
  },
];

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("placeholder")) return null;
  try {
    return createClient(url, key, { auth: { persistSession: false } });
  } catch (e) {
    return null;
  }
}

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
    return SEED_USERS;
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
  const localUsers = readUsers();

  const supabase = getSupabase();
  let supabaseUsers: ServerUserAccount[] = [];

  if (supabase) {
    try {
      const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (data && Array.isArray(data)) {
        supabaseUsers = data.map((p: any) => ({
          id: p.id,
          name: p.full_name || p.email?.split("@")[0] || "Utilisateur",
          email: p.email,
          role: (p.email === "ramigouader@gmail.com" || p.email === "admin@my-cv.tn" || p.role === "admin") ? "admin" : "user",
          credits: p.credit_balance !== undefined ? p.credit_balance : 10,
          status: p.status || "active",
          createdAt: p.created_at || new Date().toISOString(),
          lastLoginAt: p.updated_at || p.created_at || new Date().toISOString(),
        }));
      }
    } catch (e) {}
  }

  // Merge Supabase + Local files
  const mergedMap = new Map<string, ServerUserAccount>();
  localUsers.forEach((u) => mergedMap.set(u.email.toLowerCase(), u));
  supabaseUsers.forEach((u) => mergedMap.set(u.email.toLowerCase(), u));
  const allUsers = Array.from(mergedMap.values());

  if (email || id) {
    const found = allUsers.find(
      (u) =>
        (email && u.email.toLowerCase() === email) ||
        (id && u.id === id)
    );
    if (found) {
      return NextResponse.json({ success: true, user: found });
    }
    return NextResponse.json({ success: false, error: "Utilisateur non trouvé" }, { status: 404 });
  }

  return NextResponse.json({ success: true, users: allUsers });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const users = readUsers();
    const supabase = getSupabase();

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

      if (supabase) {
        try {
          const { data: prof } = await supabase.from("profiles").select("id, credit_balance").or(`id.eq.${userId},email.eq.${lookup}`).maybeSingle();
          if (prof) {
            const newCreds = isExact ? Math.max(0, deltaOrExact) : Math.max(0, (prof.credit_balance || 0) + deltaOrExact);
            await supabase.from("profiles").update({ credit_balance: newCreds, updated_at: new Date().toISOString() }).eq("id", prof.id);
          }
        } catch (e) {}
      }

      return NextResponse.json({ success: true, user: updatedTarget, users: updatedList });
    }

    if (action === "register" || action === "admin-create") {
      const userObj = body.user || {
        id: `usr-${Date.now()}`,
        name: body.name?.trim() || "Nouvel Utilisateur",
        email: body.email?.trim().toLowerCase(),
        password: body.password || "password123",
        role: body.role || "user",
        credits: body.credits !== undefined ? body.credits : 10,
        status: body.status || "active",
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
      };

      const normalizedEmail = (userObj.email || "").trim().toLowerCase();
      const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);
      let updatedList = users;

      if (existing) {
        updatedList = users.map((u) => u.email.toLowerCase() === normalizedEmail ? { ...u, ...userObj } : u);
      } else {
        updatedList = [userObj, ...users];
      }

      writeUsers(updatedList);

      if (supabase) {
        try {
          await supabase.from("profiles").upsert({
            email: normalizedEmail,
            full_name: userObj.name,
            credit_balance: userObj.credits,
            updated_at: new Date().toISOString(),
          }, { onConflict: "email" });
        } catch (e) {}
      }

      return NextResponse.json({ success: true, user: userObj, users: updatedList });
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

      if (supabase) {
        try {
          const { data: prof } = await supabase.from("profiles").select("id, status").or(`id.eq.${userId},email.eq.${userId}`).maybeSingle();
          if (prof) {
            const nextStatus = prof.status === "active" ? "suspended" : "active";
            await supabase.from("profiles").update({ status: nextStatus }).eq("id", prof.id);
          }
        } catch (e) {}
      }

      return NextResponse.json({ success: true, users: updatedList });
    }

    if (action === "delete") {
      const { userId } = body;
      const lookup = (userId || "").toString().trim().toLowerCase();
      const updatedList = users.filter((u) => u.id !== userId && u.email.toLowerCase() !== lookup);
      writeUsers(updatedList);

      if (supabase) {
        try {
          await supabase.from("profiles").delete().or(`id.eq.${userId},email.eq.${lookup}`);
        } catch (e) {}
      }

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
