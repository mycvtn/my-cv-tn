"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authenticateUser } from "@/lib/auth/authStore";
import { Lock, Mail, ArrowRight, Sparkles, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Veuillez saisir votre adresse email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "authenticate", email, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        authenticateUser(email, password);
        setLoading(false);
        if (data.user.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
        return;
      } else {
        setLoading(false);
        setError(data.error || "Compte introuvable ou supprimé.");
        return;
      }
    } catch (err) {
      const localRes = authenticateUser(email, password);
      setLoading(false);
      if (localRes.success) {
        if (localRes.user?.role === "admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        setError(localRes.error || "Compte introuvable ou supprimé.");
      }
    }
  };

  const handleQuickDemo = () => {
    setEmail("user@my-cv.ai");
    setPassword("password123");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-100 font-sans relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Logo */}
      <div className="text-center mb-6 z-10">
        <a href="/" className="inline-flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-rose-600/30">
            ⚡
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">
            MY-CV<span className="text-rose-500">.AI</span>
          </span>
        </a>
        <p className="text-xs text-slate-400">Plateforme Intelligente de Création de CV & Recrutement</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
        <div className="mb-6">
          <h1 className="text-xl font-extrabold text-white tracking-tight">Connexion à votre compte</h1>
          <p className="text-xs text-slate-400 mt-1">Accédez à votre tableau de bord, vos CVs et vos crédits IA</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Adresse Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre.email@exemple.com"
                required
                className="w-full text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-300">Mot de passe</label>
              <a href="#" className="text-[11px] text-rose-400 hover:underline">Mot de passe oublié ?</a>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            title="Se connecter à votre compte My-CV.AI"
            aria-label="Se connecter à votre compte My-CV.AI"
            className="w-full mt-2 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Connexion en cours...</span>
            ) : (
              <>
                <span>Se connecter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Link to Register */}
        <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          Pas encore de compte ?{" "}
          <a 
            href="/register" 
            title="Créer un compte et recevoir 5 crédits offerts"
            aria-label="Créer un compte et recevoir 5 crédits offerts"
            className="font-bold text-rose-400 hover:text-rose-300 transition"
          >
            Créer un compte (+5 Crédits Offerts)
          </a>
        </div>
      </div>
    </div>
  );
}
