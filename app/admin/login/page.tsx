"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticateUser } from "@/lib/auth/authStore";
import { Shield, Lock, Mail, ArrowRight, ShieldCheck, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("admin@my-cv.ai");
  const [password, setPassword] = useState<string>("admin123");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    setTimeout(() => {
      const res = authenticateUser(email, password);
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
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100 font-sans relative overflow-hidden">
      {/* Golden/Amber glow for Admin security atmosphere */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Admin Logo Badge */}
      <div className="text-center mb-6 z-10">
        <div className="inline-flex items-center gap-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-3 text-amber-300 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Espace Restreint — Administration Système</span>
        </div>
        <h1 className="text-2xl font-black text-white tracking-tight">Portail Administrateur</h1>
        <p className="text-xs text-slate-400 mt-1">Supervision globale, gestion des utilisateurs et des crédits</p>
      </div>

      {/* Admin Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Email Administrateur</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full text-xs bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Mot de passe</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full text-xs bg-slate-800/80 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Authentification...</span>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>Accéder au Panneau d'Administration</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
          <a href="/login" className="text-slate-400 hover:text-white transition">
            ← Retour à l'espace candidat
          </a>
        </div>
      </div>
    </div>
  );
}
