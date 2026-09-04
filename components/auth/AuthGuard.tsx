"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/authStore";

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const AuthGuard: React.FC<Props> = ({ children, requireAdmin = false }) => {
  const router = useRouter();

  useEffect(() => {
    // Immediate non-blocking client validation
    const user = getCurrentUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    if (requireAdmin && user.role !== "admin") {
      router.replace("/dashboard");
      return;
    }
  }, [router, requireAdmin]);

  // Render children immediately (0ms delay, no blocking screen on refresh)
  return <>{children}</>;
};
