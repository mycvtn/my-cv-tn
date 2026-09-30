"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authenticateUser, setCurrentUser } from "@/lib/auth/authStore";
import { supabase } from "@/lib/supabase/client";
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles, CheckCircle2, ShieldCheck, FileCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "auth_callback_failed") {
      setError("La connexion a échoué. Veuillez vérifier vos identifiants et réessayer.");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Veuillez saisir votre adresse email.");
      return;
    }

    setLoading(true);
    setError("");

    const isSupabaseConfigured =
      typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
      process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

    if (isSupabaseConfigured) {
      try {
        const { data: supaAuth, error: supaErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });

        if (!supaErr && supaAuth?.user) {
          const isAdm = supaAuth.user.email === "ramigouader@gmail.com" || supaAuth.user.email === "admin@my-cv.tn";
          const userAccount = {
            id: supaAuth.user.id,
            name: supaAuth.user.user_metadata?.full_name || supaAuth.user.email?.split("@")[0] || "Utilisateur",
            email: supaAuth.user.email || email.trim(),
            role: (isAdm ? "admin" : "user") as any,
            credits: isAdm ? 999 : 10,
            status: "active" as const,
            createdAt: supaAuth.user.created_at || new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
          setCurrentUser(userAccount);
          setLoading(false);
          if (userAccount.role === "admin") {
            router.replace("/admin");
          } else {
            router.replace("/dashboard");
          }
          return;
        }
      } catch (e) {}
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "authenticate", email: email.trim(), password }),
      });
      const data = await res.json();
      
      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        authenticateUser(email.trim(), password);
        setLoading(false);
        if (data.user.role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }
        return;
      } else {
        // Fallback to local store
        const localRes = authenticateUser(email.trim(), password);
        if (localRes.success && localRes.user) {
          setCurrentUser(localRes.user);
          setLoading(false);
          if (localRes.user.role === "admin") {
            router.replace("/admin");
          } else {
            router.replace("/dashboard");
          }
          return;
        }

        setError(data?.error || localRes?.error || "Identifiants incorrects. Veuillez vérifier votre email et mot de passe.");
        setLoading(false);
      }
    } catch (err) {
      const localRes = authenticateUser(email.trim(), password);
      setLoading(false);
      if (localRes.success && localRes.user) {
        setCurrentUser(localRes.user);
        if (localRes.user.role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }
      } else {
        setError(localRes.error || "Compte introuvable ou mot de passe incorrect.");
      }
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      {/* Outer Glow Animated Border Container */}
      <div className="p-[1.5px] rounded-[28px] bg-gradient-to-r from-rose-500 via-amber-400 to-indigo-500 animate-border-flow shadow-2xl shadow-rose-950/40">
        <div className="bg-white/95 backdrop-blur-2xl rounded-[26.5px] p-6 sm:p-8 text-slate-900 border border-white/60 relative overflow-hidden">
          {/* Subtle Top Inner Refraction Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 opacity-90" />

          {/* Navigation Switcher Tabs (Connexion / Inscription) */}
          <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl mb-6 border border-slate-200/80 shadow-inner">
            <button
              type="button"
              className="flex-1 py-2 text-xs font-black rounded-xl bg-white text-slate-950 shadow-sm transition-all duration-200 text-center"
            >
              Connexion
            </button>
            <Link
              href="/register"
              className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 rounded-xl transition-all duration-200 text-center"
            >
              Inscription
            </Link>
          </div>

          <div className="mb-6 text-center sm:text-left">
            <h1 className="text-2xl font-black text-slate-950 tracking-tight flex items-center justify-center sm:justify-start gap-2">
              <span>Bienvenue sur MY-CV</span>
              <span className="inline-block animate-bounce">👋</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Connectez-vous pour accéder à vos CVs professionnels et lettres de motivation
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2.5 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
              <span className="font-semibold">{error}</span>
            </div>
          )}
          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Adresse Email</label>
              <div className="relative group">
                <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-rose-500 absolute left-3.5 top-3 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.com"
                  required
                  className="w-full text-xs bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Mot de passe</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline font-bold transition"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-rose-500 absolute left-3.5 top-3 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full text-xs bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-xs font-black rounded-xl transition-all duration-200 shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 flex items-center justify-center gap-2 cursor-pointer win11-shimmer-btn disabled:opacity-50"
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

          {/* Footer Navigation */}
          <div className="mt-6 pt-4 border-t border-slate-200/80 text-center text-xs text-slate-500">
            Pas encore de compte ?{" "}
            <Link
              href="/register"
              className="font-bold text-rose-600 hover:text-rose-700 transition underline underline-offset-2"
            >
              Créer un compte gratuitement
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center items-center p-4 text-slate-900 font-sans relative overflow-hidden">
      {/* Background Animated Dynamic Aurora Glows */}
      <div className="absolute top-1/4 -left-36 w-[550px] h-[550px] bg-rose-600/25 rounded-full blur-[110px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-1/4 -right-36 w-[600px] h-[600px] bg-indigo-600/25 rounded-full blur-[120px] pointer-events-none animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-amber-500/15 rounded-full blur-[130px] pointer-events-none animate-pulse-glow" />

      {/* Orbiting Subtle Glow Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] border border-white/5 rounded-full pointer-events-none animate-spin-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] border border-rose-500/10 rounded-full pointer-events-none animate-spin-slow [animation-direction:reverse]" />

      {/* Subtle High-Tech Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      {/* Left Animated Floating Feature Badge (Desktop) */}
      <div className="hidden lg:flex items-center gap-3 absolute left-12 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-3 rounded-2xl shadow-2xl text-white animate-float-badge-left pointer-events-none max-w-xs">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-md">
          <FileCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-xs font-black">Score ATS Garanti</div>
          <div className="text-[11px] text-slate-300">Optimisé pour franchir les filtres RH</div>
        </div>
      </div>

      {/* Right Animated Floating Feature Badge (Desktop) */}
      <div className="hidden lg:flex items-center gap-3 absolute right-12 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-3 rounded-2xl shadow-2xl text-white animate-float-badge-right pointer-events-none max-w-xs">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center shadow-md">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-xs font-black">Lettre IA Intelligente</div>
          <div className="text-[11px] text-slate-300">Rédigée sur-mesure pour chaque offre</div>
        </div>
      </div>

      {/* Brand Header */}
      <div className="text-center mb-6 z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-rose-600/40 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-300">
            ⚡
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white drop-shadow-md">
            MY-CV<span className="text-rose-500">.TN</span>
          </span>
        </Link>
        <p className="text-xs text-slate-400 font-medium">Plateforme Intelligente de Création de CV & Recrutement</p>
      </div>

      {/* Login Card */}
      <Suspense fallback={
        <div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 text-center text-xs text-slate-400">
          Chargement de la connexion...
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
