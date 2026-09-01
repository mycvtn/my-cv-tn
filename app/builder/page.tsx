"use client";

import { BuilderSplitView } from "@/components/builder/BuilderSplitView";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function BuilderPage() {
  return (
    <AuthGuard>
      <BuilderSplitView />
    </AuthGuard>
  );
}
