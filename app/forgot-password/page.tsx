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
        // If placeholder project or local mode, handle gracefully
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

      {/* Main Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-3">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Mot de passe oublié ?</h1>
          <p className="text-xs text-slate-400 mt-1">
            Entrez votre adresse email pour recevoir un lien sécurisé de réinitialisation.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Email de réinitialisation envoyé !</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Si un compte est associé à <strong className="text-white">{email}</strong>, vous recevrez un email contenant les instructions pour réinitialiser votre mot de passe.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="w-full py-2.5 text-xs text-slate-400 hover:text-white font-semibold transition text-center"
            >
              Vous n'avez rien reçu ? Réessayer
            </button>

            <a
              href="/login"
              className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retour à la page de connexion</span>
            </a>
          </div>
        ) : (
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

            <button
              type="submit"
              disabled={loading}
              title="Envoyer le lien de réinitialisation"
              aria-label="Envoyer le lien de réinitialisation"
              className="w-full mt-2 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

            <div className="pt-2 text-center">
              <a
                href="/login"
                className="text-xs text-slate-400 hover:text-rose-400 transition inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Retour à la connexion</span>
              </a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
