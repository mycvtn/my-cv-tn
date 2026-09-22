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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 text-slate-900 font-sans relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Admin Header Logo */}
      <div className="text-center mb-6 z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-2xl mb-3 text-amber-800 text-xs font-bold uppercase tracking-wider shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-amber-600" />
          <span>Espace Restreint — Administration Système</span>
        </div>
        <h1 className="text-2xl font-black text-slate-950 tracking-tight">Portail Administrateur</h1>
        <p className="text-xs text-slate-500 mt-1">Supervision globale, gestion des utilisateurs et des abonnements</p>
      </div>

      {/* Admin Login Card */}
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl z-10">
        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{error}</span>
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
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 transition"
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
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
        <div className="mt-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 space-y-1">
          <div className="font-bold text-amber-900 flex items-center gap-1.5">🔑 Comptes administrateurs disponibles :</div>
          <div>• <strong>admin@my-cv.tn</strong> → mot de passe : <code className="bg-amber-100 px-1 rounded">admin123</code></div>
          <div>• <strong>ramigouader@gmail.com</strong> → mot de passe : <code className="bg-amber-100 px-1 rounded">R@mail1603</code></div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          <a href="/login" className="text-slate-500 hover:text-slate-900 transition">
            ← Retour à l'espace candidat
          </a>
        </div>
      </div>
    </div>
  );
}
