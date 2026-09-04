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

      {/* Main Card */}
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-2xl">
            <KeyRound className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-950 tracking-tight">Mot de passe oublié</h1>
            <p className="text-xs text-slate-500 mt-0.5">Recevez un lien sécurisé de réinitialisation</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-2">
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
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
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
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">
                Nous vous enverrons un lien d'accès direct pour mettre à jour votre mot de passe.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              title="Envoyer le lien de réinitialisation"
              aria-label="Envoyer le lien de réinitialisation"
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
        <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Vous vous souvenez de votre mot de passe ?{" "}
          <a 
            href="/login" 
            title="Revenir à la page de connexion"
            aria-label="Revenir à la page de connexion"
            className="font-bold text-rose-600 hover:text-rose-700 transition"
          >
            Se connecter
          </a>
        </div>
      </div>
    </div>
  );
}
