import { UserAccount, AuthState, UserRole } from "@/types/auth";
import { supabase } from "@/lib/supabase/client";

const USERS_STORAGE_KEY = "my_cv_all_users_list";
const ACTIVE_USER_STORAGE_KEY = "my_cv_current_active_user";

const DEFAULT_ADMIN: UserAccount = {
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

const SEED_USERS: UserAccount[] = [
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

export function getStoredUsers(): UserAccount[] {
  if (typeof window === "undefined") return SEED_USERS;
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      let parsed: UserAccount[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let needsSave = false;
        parsed = parsed.map((u) => {
          if (u.email.toLowerCase() === "admin@my-cv.ai") {
            needsSave = true;
            return { ...u, email: "admin@my-cv.tn", name: "Administrateur MY-CV TN" };
          }
          if (u.email.toLowerCase() === "user@my-cv.ai") {
            needsSave = true;
            return { ...u, email: "user@my-cv.tn" };
          }
          return u;
        });

        // Ensure default admin account is always present if no admin exists
        if (!parsed.some((u) => u.role === "admin" || u.email.toLowerCase() === "admin@my-cv.tn")) {
          parsed = [DEFAULT_ADMIN, ...parsed];
          needsSave = true;
        }

        if (needsSave) {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(parsed));
        }
        return parsed;
      }
    }
    // Only initialize once if completely uninitialized
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(SEED_USERS));
    return SEED_USERS;
  } catch (e) {
    return [DEFAULT_ADMIN];
  }
}

export async function fetchServerUsers(): Promise<UserAccount[]> {
  try {
    const res = await fetch("/api/users", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.users && Array.isArray(data.users)) {
        if (typeof window !== "undefined") {
          localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(data.users));
          window.dispatchEvent(new Event("storage"));
        }
        return data.users;
      }
    }
  } catch (e) {}
  return getStoredUsers();
}

export async function fetchServerUser(emailOrId: string): Promise<UserAccount | null> {
  try {
    const param = emailOrId.includes("@") ? `email=${encodeURIComponent(emailOrId)}` : `id=${encodeURIComponent(emailOrId)}`;
    const res = await fetch(`/api/users?${param}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        if (typeof window !== "undefined") {
          const current = getCurrentUser();
          if (current && (current.id === data.user.id || current.email.toLowerCase() === data.user.email.toLowerCase())) {
            localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(data.user));
            window.dispatchEvent(new CustomEvent("user_credits_updated", { detail: data.user }));
          }
        }
        return data.user;
      }
    } else if (res.status === 404) {
      // User was deleted on server! Invalidate local session if active
      if (typeof window !== "undefined") {
        const current = getCurrentUser();
        if (current && (current.id === emailOrId || current.email.toLowerCase() === emailOrId.toLowerCase())) {
          setCurrentUser(null);
        }
      }
    }
  } catch (e) {}
  return null;
}

export function saveStoredUsers(users: UserAccount[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {}
}

export function getCurrentUser(): UserAccount | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
    if (!raw) return null;

    const active: UserAccount = JSON.parse(raw);
    if (!active || !active.email) return null;

    // Check with users list (Source of Truth)
    const allUsers = getStoredUsers();
    const match = allUsers.find(
      (u) => u.id === active.id || u.email.toLowerCase() === active.email.toLowerCase()
    );

    // If user was deleted from the system, destroy session!
    if (!match) {
      localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
      return null;
    }

    if (match.credits !== active.credits || match.status !== active.status || match.name !== active.name) {
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(match));
    }
    return match;
  } catch (e) {
    return null;
  }
}

export function setCurrentUser(user: UserAccount | null): void {
  if (typeof window === "undefined") return;
  try {
    if (user) {
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(user));

      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      let usersList: UserAccount[] = raw ? JSON.parse(raw) : [];
      const index = usersList.findIndex(
        (u) => u.email.toLowerCase() === user.email.toLowerCase() || u.id === user.id
      );
      if (index >= 0) {
        usersList[index] = { ...usersList[index], name: user.name, role: user.role, status: user.status };
      } else {
        usersList = [user, ...usersList];
      }
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersList));
    } else {
      localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
    }
  } catch (e) {}
}

export function authenticateUser(email: string, password?: string): { success: boolean; user?: UserAccount; error?: string } {
  const users = getStoredUsers();
  const normalized = email.trim().toLowerCase();
  
  let found = users.find(
    (u) =>
      u.email.toLowerCase() === normalized ||
      (normalized === "admin@my-cv.tn" && u.email.toLowerCase() === "admin@my-cv.ai") ||
      (normalized === "admin@my-cv.ai" && u.email.toLowerCase() === "admin@my-cv.tn")
  );

  // Fallback for default administrator if omitted from array
  if (!found && (normalized === "admin@my-cv.tn" || normalized === "admin@my-cv.ai")) {
    found = DEFAULT_ADMIN;
  }

  if (!found) {
    return { success: false, error: "Compte introuvable ou supprimé." };
  }

  if (password && found.password && found.password !== password) {
    return { success: false, error: "Mot de passe incorrect." };
  }

  if (found.status === "suspended") {
    return { success: false, error: "Ce compte a été suspendu par un administrateur." };
  }

  const updatedUser: UserAccount = {
    ...found,
    lastLoginAt: new Date().toISOString(),
  };

  const updatedList = users.some((u) => u.id === found.id)
    ? users.map((u) => (u.id === found.id ? updatedUser : u))
    : [updatedUser, ...users];

  saveStoredUsers(updatedList);
  setCurrentUser(updatedUser);

  return { success: true, user: updatedUser };
}

export function registerNewUser(name: string, email: string, password?: string): { success: boolean; user?: UserAccount; error?: string } {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, error: "Cette adresse email est déjà associée à un compte." };
  }

  const newUser: UserAccount = {
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
  saveStoredUsers(updatedList);
  setCurrentUser(newUser);

  // Sync to server API
  try {
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", name, email: normalizedEmail, password }),
    }).catch(() => {});
  } catch (e) {}

  return { success: true, user: newUser };
}

export function logoutUser(): void {
  setCurrentUser(null);
  try {
    supabase.auth.signOut().catch(() => {});
  } catch (e) {}
}

export function adminCreateUser(
  name: string,
  email: string,
  password?: string,
  role: UserRole = "user",
  initialCredits = 5
): { success: boolean; user?: UserAccount; error?: string } {
  const users = getStoredUsers();
  const normalizedEmail = email.trim().toLowerCase();

  if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
    return { success: false, error: "Cette adresse email est déjà associée à un compte." };
  }

  const newUser: UserAccount = {
    id: `usr-${Date.now()}`,
    name: name.trim() || (role === "admin" ? "Administrateur" : "Nouvel Utilisateur"),
    email: normalizedEmail,
    password: password || "password123",
    role: role,
    credits: role === "admin" ? 999 : initialCredits,
    status: "active",
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
  };

  const updatedList = [newUser, ...users];
  saveStoredUsers(updatedList);

  // Sync to server API in background
  try {
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "admin-create", user: newUser }),
    }).catch(() => {});
  } catch (e) {}

  return { success: true, user: newUser };
}

// Admin Operations
export function adminUpdateUserCredits(userIdOrEmail: string, deltaOrExact: number, isExact = false): UserAccount | null {
  const users = getStoredUsers();
  let updatedTarget: UserAccount | null = null;
  const lookup = (userIdOrEmail || "").trim().toLowerCase();

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

  saveStoredUsers(updatedList);

  const current = getCurrentUser();
  if (current) {
    const isCurrent = current.id.toLowerCase() === lookup || current.email.toLowerCase() === lookup;
    if (isCurrent && updatedTarget) {
      localStorage.setItem(ACTIVE_USER_STORAGE_KEY, JSON.stringify(updatedTarget));
    }
  }

  // Push to server API in background
  try {
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update-credits", userId: userIdOrEmail, deltaOrExact, isExact }),
    }).catch(() => {});
  } catch (e) {}

  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("user_credits_updated", { detail: updatedTarget }));
      window.dispatchEvent(new Event("storage"));
    }
  } catch (e) {}

  return updatedTarget;
}

export function adminToggleUserStatus(userId: string): UserAccount | null {
  const users = getStoredUsers();
  let updatedTarget: UserAccount | null = null;

  const updatedList = users.map((u) => {
    if (u.id === userId || u.email.toLowerCase() === userId.toLowerCase()) {
      const newStatus = u.status === "active" ? "suspended" : "active";
      updatedTarget = { ...u, status: newStatus };
      return updatedTarget;
    }
    return u;
  });

  saveStoredUsers(updatedList);

  try {
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "toggle-status", userId }),
    }).catch(() => {});
  } catch (e) {}

  return updatedTarget;
}

export function adminDeleteUser(userId: string): boolean {
  const users = getStoredUsers();
  const lookup = (userId || "").trim().toLowerCase();
  const remaining = users.filter((u) => u.id !== userId && u.email.toLowerCase() !== lookup);
  saveStoredUsers(remaining);

  // If the currently active user was deleted, logout immediately
  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
    if (raw) {
      try {
        const active = JSON.parse(raw);
        if (active.id === userId || active.email.toLowerCase() === lookup) {
          localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
        }
      } catch (e) {}
    }
    window.dispatchEvent(new Event("storage"));
  }

  try {
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", userId }),
    }).catch(() => {});
  } catch (e) {}

  return true;
}

export function adminDeleteAllUsers(): boolean {
  const users = getStoredUsers();
  const remaining = users.filter((u) => u.role === "admin");
  saveStoredUsers(remaining);

  if (typeof window !== "undefined") {
    const raw = localStorage.getItem(ACTIVE_USER_STORAGE_KEY);
    if (raw) {
      try {
        const active = JSON.parse(raw);
        if (active.role !== "admin") {
          localStorage.removeItem(ACTIVE_USER_STORAGE_KEY);
        }
      } catch (e) {}
    }
    window.dispatchEvent(new Event("storage"));
  }

  try {
    fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete-all-users" }),
    }).catch(() => {});
  } catch (e) {}

  return true;
}

export function updateUserProfile(userId: string, updates: Partial<UserAccount>): UserAccount | null {
  const users = getStoredUsers();
  let updatedTarget: UserAccount | null = null;

  const updatedList = users.map((u) => {
    if (u.id === userId || u.email.toLowerCase() === userId.toLowerCase()) {
      updatedTarget = { ...u, ...updates };
      return updatedTarget;
    }
    return u;
  });

  saveStoredUsers(updatedList);
  if (updatedTarget) {
    setCurrentUser(updatedTarget);
  }
  return updatedTarget;
}
