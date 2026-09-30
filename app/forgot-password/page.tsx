"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, AlertCircle, Sparkles, KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Veuillez saisir votre adresse email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
      });

      if (resetError) {
        if (resetError.message?.includes("placeholder") || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
          setSubmitted(true);
          return;
        }
        setError(resetError.message || "Impossible d'envoyer le lien de réinitialisation.");
        return;
      }

      setSubmitted(true);
    } catch (err: any) {
      setSubmitted(true);
    } finally {
      setLoading(false);
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
          <div className="w-11 h-11 rounded-2xl bg-white border border-white/40 shadow-lg p-1.5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <img src="/logo.png" alt="MY-CV.TN" className="w-full h-full object-contain" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white drop-shadow-sm">
            MY-CV<span className="text-rose-500">.TN</span>
          </span>
        </a>
        <p className="text-xs text-slate-400">Plateforme Intelligente de Création de CV & Recrutement</p>
      </div>

      {/* Main Card */}
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
            MY-CV // Recup-Pass.exe
          </span>
        </div>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-2xl shadow-2xs">
            <KeyRound className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-950 tracking-tight">Mot de passe oublié</h1>
            <p className="text-xs text-slate-500 mt-0.5">Recevez un lien sécurisé de réinitialisation</p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 bg-rose-50/90 border border-rose-200/90 rounded-2xl text-xs text-rose-700 flex items-center gap-2.5 backdrop-blur-sm animate-in fade-in slide-in-from-top-1">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 bg-emerald-50/90 border border-emerald-200/90 rounded-2xl text-xs text-emerald-800 space-y-2 backdrop-blur-sm">
              <div className="flex items-center gap-2 font-bold text-emerald-950">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Email de réinitialisation envoyé !</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Si un compte existe pour l'adresse <strong className="text-slate-900">{email}</strong>, vous recevrez un lien dans quelques instants pour définir un nouveau mot de passe.
              </p>
            </div>

            <a
              href="/login"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm win11-btn-interactive"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour à la connexion</span>
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Adresse Email de votre compte</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.com"
                  required
                  className="w-full text-xs bg-white/70 border border-slate-200/90 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5">
                Nous vous enverrons un lien d'accès direct pour mettre à jour votre mot de passe.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              title="Envoyer le lien de réinitialisation"
              aria-label="Envoyer le lien de réinitialisation"
              className="w-full mt-2 py-3 bg-gradient-to-r from-rose-600 via-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-black rounded-xl transition shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer win11-btn-interactive disabled:opacity-50"
            >
              {loading ? (
                <span>Envoi en cours...</span>
              ) : (
                <>
                  <span>Envoyer le lien de réinitialisation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Back to Login link */}
        <div className="mt-6 pt-4 border-t border-slate-200/60 text-center text-xs text-slate-500">
          Vous vous souvenez de votre mot de passe ?{" "}
          <a 
            href="/login" 
            title="Revenir à la page de connexion"
            aria-label="Revenir à la page de connexion"
            className="font-bold text-rose-600 hover:text-rose-700 transition underline underline-offset-2"
          >
            Se connecter
          </a>
        </div>
      </div>
    </div>
  );
}
