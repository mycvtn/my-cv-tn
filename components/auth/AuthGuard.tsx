"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/authStore";
import { UserAccount } from "@/types/auth";

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const AuthGuard: React.FC<Props> = ({ children, requireAdmin = false }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    const active = getCurrentUser();
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
  }, [router, requireAdmin]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Vérification de votre session...</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
