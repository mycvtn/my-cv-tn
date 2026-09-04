"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticateUser } from "@/lib/auth/authStore";
import { Shield, Lock, Mail, ArrowRight, ShieldCheck, KeyRound, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      const res = authenticateUser(email.trim(), password);
      setLoading(false);
      if (res.success) {
        if (res.user?.role === "admin") {
          router.push("/admin");
        } else {
          setError("Accès refusé. Ce compte n'a pas les privilèges administrateur.");
        }
      } else {
        setError(res.error || "Identifiants administrateur incorrects.");
      }
    }, 400);
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
        <p className="text-xs text-slate-500 mt-1">Supervision globale, gestion des utilisateurs et des crédits</p>
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

        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          <a href="/login" className="text-slate-500 hover:text-slate-900 transition">
            ← Retour à l'espace candidat
          </a>
        </div>
      </div>
    </div>
  );
}
