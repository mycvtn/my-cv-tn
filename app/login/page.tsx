"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authenticateUser, setCurrentUser } from "@/lib/auth/authStore";
import { supabase } from "@/lib/supabase/client";
import { Lock, Mail, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "linkedin" | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam === "auth_callback_failed") {
      setError("La connexion via le fournisseur d'authentification a échoué. Veuillez réessayer.");
    }
  }, [searchParams]);

  const handleOAuthLogin = async (provider: "google" | "linkedin_oidc") => {
    setError("");
    setOauthLoading(provider === "google" ? "google" : "linkedin");
    try {
      const isSupabaseConfigured =
        typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
        process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

      if (!isSupabaseConfigured) {
        setError("La connexion OAuth requiert la configuration des clés Supabase dans les variables d'environnement.");
        setOauthLoading(null);
        return;
      }

      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      if (oauthErr) {
        setError(oauthErr.message || `Impossible de se connecter avec ${provider === "google" ? "Google" : "LinkedIn"}.`);
        setOauthLoading(null);
      }
    } catch (err: any) {
      setError(err.message || "Erreur lors de la connexion sociale.");
      setOauthLoading(null);
    }
  };

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
    <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl z-10">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-slate-950 tracking-tight">Connexion à votre compte</h1>
        <p className="text-xs text-slate-500 mt-1">Accédez à vos CVs, candidatures et crédits IA</p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* OAuth Social Buttons (Google & LinkedIn) */}
      <div className="space-y-2.5 mb-5">
        <button
          type="button"
          onClick={() => handleOAuthLogin("google")}
          disabled={!!oauthLoading || loading}
          title="Se connecter avec votre compte Google"
          aria-label="Se connecter avec votre compte Google"
          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 hover:border-slate-300 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition shadow-2xs disabled:opacity-50"
        >
          {oauthLoading === "google" ? (
            <span>Redirection Google...</span>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continuer avec Google</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={() => handleOAuthLogin("linkedin_oidc")}
          disabled={!!oauthLoading || loading}
          title="Se connecter avec votre profil LinkedIn"
          aria-label="Se connecter avec votre profil LinkedIn"
          className="w-full py-2.5 px-4 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-sky-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition shadow-2xs disabled:opacity-50"
        >
          {oauthLoading === "linkedin" ? (
            <span>Redirection LinkedIn...</span>
          ) : (
            <>
              <svg className="w-4 h-4 fill-[#0A66C2]" viewBox="0 0 24 24">
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
              </svg>
              <span>Continuer avec LinkedIn</span>
            </>
          )}
        </button>
      </div>

      {/* Separator */}
      <div className="relative flex items-center justify-center mb-5">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
          Ou avec votre email
        </span>
        <div className="border-t border-slate-200 w-full" />
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Adresse Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre.email@exemple.com"
              required
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-700">Mot de passe</label>
            <a 
              href="/forgot-password" 
              title="Réinitialiser votre mot de passe oublié"
              className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline font-semibold"
            >
              Mot de passe oublié ?
            </a>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !!oauthLoading}
          title="Se connecter à votre compte MY-CV.TN"
          aria-label="Se connecter à votre compte MY-CV.TN"
          className="w-full mt-2 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
      <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
        Pas encore de compte ?{" "}
        <a 
          href="/register" 
          title="Créer un compte et recevoir 5 crédits offerts"
          aria-label="Créer un compte et recevoir 5 crédits offerts"
          className="font-bold text-rose-600 hover:text-rose-700 transition"
        >
          Créer un compte (+5 Crédits Offerts)
        </a>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 text-slate-900 font-sans relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Logo */}
      <div className="text-center mb-6 z-10">
        <a href="/" className="inline-flex items-center gap-2.5 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-black text-white text-lg shadow-md shadow-rose-600/20">
            ⚡
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-slate-950">
            MY-CV<span className="text-rose-600">.TN</span>
          </span>
        </a>
        <p className="text-xs text-slate-500">Plateforme Intelligente de Création de CV & Recrutement</p>
      </div>

      <Suspense fallback={
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 text-center text-xs text-slate-500">
          Chargement du formulaire...
        </div>
      }>
        <LoginForm />
      </Suspense>
    </div>
  );
}
