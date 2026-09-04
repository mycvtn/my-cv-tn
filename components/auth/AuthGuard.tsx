"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser, setCurrentUser } from "@/lib/auth/authStore";
import { supabase } from "@/lib/supabase/client";
import { UserAccount } from "@/types/auth";

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const AuthGuard: React.FC<Props> = ({ children, requireAdmin = false }) => {
  const router = useRouter();
  
  // 1. Instant check on mount
  const [authorized, setAuthorized] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const active = getCurrentUser();
      if (active) {
        if (requireAdmin) return active.role === "admin";
        return true;
      }
    }
    return false;
  });

  const [checking, setChecking] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const active = getCurrentUser();
      if (active) {
        if (requireAdmin) return active.role !== "admin";
        return false; // Verified instantly!
      }
    }
    return true;
  });

  useEffect(() => {
    // 1. Fast local verification (0ms synchronous)
    const active = getCurrentUser();
    if (active) {
      if (requireAdmin && active.role !== "admin") {
        router.replace("/dashboard");
        return;
      }
      setAuthorized(true);
      setChecking(false);
      return;
    }

    // 2. Only if no local user exists, check Supabase with a quick 500ms timeout
    let cancelled = false;
    const checkRemote = async () => {
      try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject("timeout"), 500));
        const req = supabase.auth.getUser();
        const res: any = await Promise.race([req, timeout]);
        
        if (res?.data?.user && !cancelled) {
          const supaUser = res.data.user;
          const newAccount: UserAccount = {
            id: supaUser.id,
            name: supaUser.user_metadata?.full_name || supaUser.email?.split("@")[0] || "Utilisateur",
            email: supaUser.email || "",
            role: "user",
            credits: 5,
            status: "active",
            createdAt: supaUser.created_at || new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
          setCurrentUser(newAccount);
          setAuthorized(true);
          setChecking(false);
          return;
        }
      } catch (e) {}

      if (!cancelled) {
        setChecking(false);
        router.replace("/login");
      }
    };

    checkRemote();

    return () => {
      cancelled = true;
    };
  }, [router, requireAdmin]);

  // If authorized, render children instantly
  if (authorized) {
    return <>{children}</>;
  }

  // Only show loading if actively resolving an unknown session
  if (checking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Chargement...</span>
        </div>
      </div>
    );
  }

  return null;
};
