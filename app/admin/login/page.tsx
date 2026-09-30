"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticateUser, setCurrentUser } from "@/lib/auth/authStore";
import { ShieldCheck, Lock, Mail, KeyRound, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 1. Try server API first (reads from data/users.json on disk — always up-to-date)
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "authenticate", email: email.trim(), password }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.user) {
        if (data.user.role !== "admin") {
          setError("Accès refusé. Ce compte n'a pas les privilèges administrateur.");
          setLoading(false);
          return;
        }
        setCurrentUser(data.user);
        setLoading(false);
        router.push("/admin");
        return;
      }

      // 2. Fallback: local store / localStorage (works offline / cold start)
      const localRes = authenticateUser(email.trim(), password);
      setLoading(false);
      if (localRes.success && localRes.user) {
        if (localRes.user.role !== "admin") {
          setError("Accès refusé. Ce compte n'a pas les privilèges administrateur.");
          return;
        }
        router.push("/admin");
        return;
      }

      setError(data?.error || localRes?.error || "Identifiants administrateur incorrects.");
    } catch (err) {
      // Network error → try local only
      const localRes = authenticateUser(email.trim(), password);
      setLoading(false);
      if (localRes.success && localRes.user) {
        if (localRes.user.role !== "admin") {
          setError("Accès refusé. Ce compte n'a pas les privilèges administrateur.");
          return;
        }
        router.push("/admin");
        return;
      }
      setError(localRes?.error || "Erreur de connexion. Veuillez réessayer.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-900 font-sans relative overflow-hidden">
      {/* Background Animated Aurora Glows (Windows 11 Bloom Style) */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-3xl pointer-events-none animate-float-slow" />
      <div className="absolute bottom-1/4 -right-32 w-[550px] h-[550px] bg-rose-500/20 rounded-full blur-3xl pointer-events-none animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      {/* Subtle Grid pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Admin Header Logo */}
      <div className="text-center mb-6 z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-3 text-amber-300 text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Espace Restreint — Administration Système</span>
        </div>
        <h1 className="text-3xl font-black text-white tracking-tight drop-shadow-sm">Portail Administrateur</h1>
        <p className="text-xs text-slate-400 mt-1">Supervision globale, gestion des utilisateurs et des abonnements</p>
      </div>

      {/* Admin Login Card */}
      <div className="w-full max-w-md win11-acrylic-card win11-window-shadow border border-white/80 rounded-3xl p-7 sm:p-9 z-10 relative overflow-hidden transition-all duration-300">
        {/* Top Window Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-400 opacity-90" />
        
        {/* Simulated Window Control Bar */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200/60">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-400/90 shadow-2xs hover:scale-110 transition cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-amber-400/90 shadow-2xs hover:scale-110 transition cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/90 shadow-2xs hover:scale-110 transition cursor-pointer" />
          </div>
          <span className="text-[10px] font-mono tracking-wider font-semibold text-slate-400 uppercase">
            MY-CV // Admin-Auth.exe
          </span>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50/90 border border-rose-200/90 rounded-2xl text-xs text-rose-700 flex items-center gap-2.5 backdrop-blur-sm animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Administrateur</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@my-cv.tn"
                autoComplete="email"
                required
                className="w-full text-xs bg-white/70 border border-slate-200/90 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Mot de passe</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                required
                className="w-full text-xs bg-white/70 border border-slate-200/90 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl transition shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 cursor-pointer win11-btn-interactive disabled:opacity-50"
          >
            {loading ? (
              <span>Authentification...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4 text-slate-950" />
                <span>Accéder au Panneau d'Administration</span>
              </>
            )}
          </button>
        </form>

        {/* Credentials hint */}
        <div className="mt-5 p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl text-xs text-amber-900 space-y-1.5 backdrop-blur-sm">
          <div className="font-bold flex items-center gap-1.5 text-amber-950">🔑 Comptes administrateurs autorisés :</div>
          <div className="text-[11px]">• <strong>admin@my-cv.tn</strong> → mot de passe : <code className="bg-amber-100/90 px-1.5 py-0.5 rounded font-mono text-amber-950">admin123</code></div>
          <div className="text-[11px]">• <strong>ramigouader@gmail.com</strong> → mot de passe : <code className="bg-amber-100/90 px-1.5 py-0.5 rounded font-mono text-amber-950">R@mail1603</code></div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200/60 text-center text-xs text-slate-500">
          <a href="/login" className="text-slate-500 hover:text-slate-900 transition flex items-center justify-center gap-1">
            <span>←</span>
            <span>Retour à l'espace candidat</span>
          </a>
        </div>
      </div>
    </div>
  );
}
