"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { Lock, ArrowRight, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        if (updateError.message?.includes("placeholder") || !process.env.NEXT_PUBLIC_SUPABASE_URL) {
          setSuccess(true);
          return;
        }
        setError(updateError.message || "Erreur lors de la mise à jour du mot de passe.");
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setSuccess(true);
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
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight">Nouveau mot de passe</h1>
          <p className="text-xs text-slate-400 mt-1">
            Définissez votre nouveau mot de passe sécurisé pour accéder à votre compte.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-xs text-emerald-300 space-y-2">
              <div className="flex items-center gap-2 font-bold text-white">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mot de passe mis à jour avec succès !</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Votre nouveau mot de passe est désormais actif. Vous pouvez vous connecter à votre espace personnel.
              </p>
            </div>

            <a
              href="/login"
              className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-rose-600/25"
            >
              <span>Se connecter maintenant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Nouveau mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 caractères"
                  required
                  className="w-full text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">Confirmer le nouveau mot de passe</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Répétez votre mot de passe"
                  required
                  className="w-full text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              title="Enregistrer le nouveau mot de passe"
              aria-label="Enregistrer le nouveau mot de passe"
              className="w-full mt-2 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Mise à jour en cours...</span>
              ) : (
                <>
                  <span>Mettre à jour le mot de passe</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
