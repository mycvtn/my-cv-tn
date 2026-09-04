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
  
  // Instant synchronous initialization from local session (0ms delay)
  const [user, setUser] = useState<UserAccount | null>(() => {
    if (typeof window !== "undefined") {
      return getCurrentUser();
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const active = getCurrentUser();
      if (active) {
        if (requireAdmin) return active.role === "admin";
        return true;
      }
    }
    return false;
  });

  const [isChecking, setIsChecking] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const active = getCurrentUser();
      if (active) {
        if (requireAdmin) return active.role !== "admin";
        return false; // Already verified instantly!
      }
    }
    return true; // Only show spinner if no local session exists yet
  });

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      // 1. Check local session first (fastest)
      let active = getCurrentUser();

      if (active) {
        if (requireAdmin && active.role !== "admin") {
          router.push("/dashboard");
          return;
        }
        if (mounted) {
          setUser(active);
          setIsAuthenticated(true);
          setIsChecking(false);
        }
        return;
      }

      // 2. If no local session, check Supabase Auth session in background
      try {
        const { data: { user: supaUser } } = await supabase.auth.getUser();
        if (supaUser) {
          let creditBalance = 5;
          let role: "user" | "admin" = "user";
          let fullName = supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email?.split("@")[0] || "Utilisateur";

          try {
            const res: any = await supabase
              .from("profiles")
              .select("full_name, credit_balance, role, status")
              .eq("id", supaUser.id)
              .single();

            const profile = res?.data;
            if (profile) {
              creditBalance = profile.credit_balance ?? 5;
              role = profile.role ?? "user";
              fullName = profile.full_name || fullName;
            }
          } catch (pErr) {}

          const newAccount: UserAccount = {
            id: supaUser.id,
            name: fullName,
            email: supaUser.email || "",
            role: role,
            credits: creditBalance,
            status: "active",
            createdAt: supaUser.created_at || new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };

          setCurrentUser(newAccount);
          active = newAccount;
        }
      } catch (e) {}

      if (!mounted) return;

      if (!active) {
        router.push("/login");
        return;
      }

      if (requireAdmin && active.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      setUser(active);
      setIsAuthenticated(true);
      setIsChecking(false);
    };

    checkAuth();

    // Listen for auth state changes from Supabase (e.g. login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        setCurrentUser(null);
        if (mounted) {
          setIsAuthenticated(false);
          setIsChecking(false);
          router.push("/login");
        }
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [router, requireAdmin]);

  // If already authenticated with user, render immediately without any spinner delay
  if (isAuthenticated && user) {
    return <>{children}</>;
  }

  if (isChecking) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Vérification de votre session...</span>
        </div>
      </div>
    );
  }

  return null;
};
