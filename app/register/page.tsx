"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registerNewUser } from "@/lib/auth/authStore";
import { supabase } from "@/lib/supabase/client";
import { Lock, Mail, User, ArrowRight, Gift, AlertCircle, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "linkedin" | null>(null);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState<boolean>(false);

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
    if (!name.trim()) {
      setError("Veuillez renseigner votre nom complet.");
      return;
    }
    if (!email.trim()) {
      setError("Veuillez saisir votre adresse email.");
      return;
    }
    if (password.length < 6) {
      setError("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
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
        const redirectUrl = `${window.location.origin}/auth/callback`;
        const { data: supaData, error: supaErr } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: name.trim(),
            },
            emailRedirectTo: redirectUrl,
          },
        });

        if (supaErr) {
          if (!supaErr.message?.includes("fetch") && !supaErr.message?.includes("placeholder")) {
            setError(supaErr.message || "Erreur lors de la création du compte.");
            setLoading(false);
            return;
          }
        } else if (supaData?.user && !supaData.session) {
          setEmailConfirmationRequired(true);
          setLoading(false);
          return;
        }
      } catch (err: any) {
        console.warn("Supabase auth non joignable, enregistrement via le store local:", err);
      }
    }

    // Always register in local store & server API
    const res = registerNewUser(name.trim(), email.trim(), password);
    setLoading(false);
    if (res.success) {
      router.push("/dashboard");
    } else {
      setError(res.error || "Une erreur est survenue lors de la création du compte.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 text-slate-900 font-sans relative overflow-hidden">
      {/* Background Animated Aurora Glows (Windows 11 Bloom Style) */}
      <div className="absolute top-1/4 -left-32 w-[500px] h-[500px] bg-rose-500/20 rounded-full blur-3xl pointer-events-none animate-float-slow" />
      <div className="absolute bottom-1/4 -right-32 w-[550px] h-[550px] bg-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />

      {/* Subtle Grid pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      {/* Top Brand Logo */}
      <div className="text-center mb-6 z-10">
        <a href="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-rose-600/30 group-hover:scale-105 transition-transform duration-300">
            ⚡
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white drop-shadow-sm">
            MY-CV<span className="text-rose-500">.TN</span>
          </span>
        </a>
        <p className="text-xs text-slate-400">Plateforme Intelligente de Création de CV & Recrutement</p>
      </div>

      {/* Registration Card */}
      <div className="w-full max-w-md win11-acrylic-card win11-window-shadow border border-white/80 rounded-3xl p-7 sm:p-9 z-10 relative overflow-hidden transition-all duration-300">
        {/* Top Window Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-indigo-500 opacity-90" />
        
        {/* Simulated Window Control Bar */}
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-200/60">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-400/90 shadow-2xs hover:scale-110 transition cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-amber-400/90 shadow-2xs hover:scale-110 transition cursor-pointer" />
            <div className="w-3 h-3 rounded-full bg-emerald-400/90 shadow-2xs hover:scale-110 transition cursor-pointer" />
          </div>
          <span className="text-[10px] font-mono tracking-wider font-semibold text-slate-400 uppercase">
            MY-CV // Inscription.exe
          </span>
        </div>

        {/* Welcome Bonus Header Banner */}
        <div className="mb-5 p-3.5 bg-gradient-to-r from-rose-50/90 via-amber-50/90 to-rose-50/90 border border-rose-200/80 rounded-2xl flex items-center gap-3 text-rose-800 backdrop-blur-sm shadow-2xs">
          <div className="p-2 bg-rose-100/90 rounded-xl text-rose-600 shadow-2xs">
            <Gift className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Offre de Bienvenue :</div>
            <div className="text-[11px] text-rose-700 font-medium">5 Crédits IA offerts pour créer, scanner et exporter vos CVs !</div>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-black text-slate-950 tracking-tight">Créer un nouveau compte</h1>
          <p className="text-xs text-slate-500 mt-1">Créez et sauvegardez vos différents CVs en ligne</p>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50/90 border border-rose-200/90 rounded-2xl text-xs text-rose-700 flex items-center gap-2.5 backdrop-blur-sm animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {emailConfirmationRequired ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 bg-emerald-50/90 border border-emerald-200/90 rounded-2xl text-xs text-emerald-800 space-y-2 backdrop-blur-sm">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Vérifiez votre boîte de réception !</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Un lien de confirmation a été envoyé à l'adresse <strong className="text-slate-900">{email}</strong>. Cliquez sur ce lien pour activer votre compte et débloquer vos 5 crédits de bienvenue.
              </p>
            </div>

            <a
              href="/login"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm win11-btn-interactive"
            >
              <span>Aller à la page de connexion</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <>
            {/* OAuth Social Buttons (Google & LinkedIn) */}
            <div className="space-y-2.5 mb-5">
              <button
                type="button"
                onClick={() => handleOAuthLogin("google")}
                disabled={!!oauthLoading || loading}
                title="S'inscrire avec votre compte Google"
                aria-label="S'inscrire avec votre compte Google"
                className="w-full py-2.5 px-4 bg-white/90 hover:bg-white hover:border-slate-300 border border-slate-200/80 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 transition-all duration-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 win11-btn-interactive disabled:opacity-50"
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
                title="S'inscrire avec votre profil LinkedIn"
                aria-label="S'inscrire avec votre profil LinkedIn"
                className="w-full py-2.5 px-4 bg-sky-50/80 hover:bg-sky-50 hover:border-sky-300 border border-sky-200/80 text-sky-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2.5 transition-all duration-200 shadow-2xs hover:shadow-md hover:-translate-y-0.5 win11-btn-interactive disabled:opacity-50"
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
              <div className="border-t border-slate-200/70 w-full" />
              <span className="bg-transparent px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Ou avec votre email
              </span>
              <div className="border-t border-slate-200/70 w-full" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nom et Prénom</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Yassine Ben Salem"
                    required
                    className="w-full text-xs bg-white/70 border border-slate-200/90 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Adresse Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yassine@example.com"
                    required
                    className="w-full text-xs bg-white/70 border border-slate-200/90 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all"
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
                    placeholder="Au moins 6 caractères"
                    required
                    minLength={6}
                    className="w-full text-xs bg-white/70 border border-slate-200/90 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirmer le mot de passe</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Retapez votre mot de passe"
                    required
                    minLength={6}
                    className="w-full text-xs bg-white/70 border border-slate-200/90 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !!oauthLoading}
                title="Créer votre compte MY-CV.TN"
                aria-label="Créer votre compte MY-CV.TN"
                className="w-full mt-2 py-3 bg-gradient-to-r from-rose-600 via-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-black rounded-xl transition shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer win11-btn-interactive disabled:opacity-50"
              >
                {loading ? (
                  <span>Création du compte...</span>
                ) : (
                  <>
                    <span>S'inscrire & Récupérer 5 Crédits</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {/* Link to Login */}
        <div className="mt-6 pt-4 border-t border-slate-200/60 text-center text-xs text-slate-500">
          Vous avez déjà un compte ?{" "}
          <a 
            href="/login" 
            title="Se connecter à un compte existant"
            aria-label="Se connecter à un compte existant"
            className="font-bold text-rose-600 hover:text-rose-700 transition underline underline-offset-2"
          >
            Se connecter
          </a>
        </div>
      </div>
    </div>
  );
}
