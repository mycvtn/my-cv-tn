"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { registerNewUser } from "@/lib/auth/authStore";
import { supabase } from "@/lib/supabase/client";
import { Lock, Mail, User, ArrowRight, Sparkles, AlertCircle, CheckCircle2, ShieldCheck, FileCheck, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [emailConfirmationRequired, setEmailConfirmationRequired] = useState<boolean>(false);

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
    <div className="min-h-screen bg-[#070b14] flex flex-col justify-center items-center p-4 text-slate-900 font-sans relative overflow-hidden">
      {/* Background Animated Dynamic Aurora Glows */}
      <div className="absolute top-1/4 -left-36 w-[550px] h-[550px] bg-rose-600/25 rounded-full blur-[110px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-1/4 -right-36 w-[600px] h-[600px] bg-indigo-600/25 rounded-full blur-[120px] pointer-events-none animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-amber-500/15 rounded-full blur-[130px] pointer-events-none animate-pulse-glow" />

      {/* Orbiting Subtle Glow Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[850px] h-[850px] border border-white/5 rounded-full pointer-events-none animate-spin-slow" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] border border-rose-500/10 rounded-full pointer-events-none animate-spin-slow [animation-direction:reverse]" />

      {/* High-Tech Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:28px_28px] pointer-events-none" />

      {/* Left Animated Floating Feature Badge (Desktop) */}
      <div className="hidden lg:flex items-center gap-3 absolute left-12 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-3 rounded-2xl shadow-2xl text-white animate-float-badge-left pointer-events-none max-w-xs">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-md">
          <FileCheck className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-xs font-black">Score ATS Garanti</div>
          <div className="text-[11px] text-slate-300">Modèles validés par les recruteurs</div>
        </div>
      </div>

      {/* Right Animated Floating Feature Badge (Desktop) */}
      <div className="hidden lg:flex items-center gap-3 absolute right-12 top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-3 rounded-2xl shadow-2xl text-white animate-float-badge-right pointer-events-none max-w-xs">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center shadow-md">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-xs font-black">Export PDF Instantané</div>
          <div className="text-[11px] text-slate-300">Prêt à postuler en quelques clics</div>
        </div>
      </div>

      {/* Brand Header */}
      <div className="text-center mb-6 z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-2 group">
          <div className="w-12 h-12 rounded-2xl bg-white border border-white/40 shadow-xl p-1.5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <img src="/logo.png" alt="MY-CV.TN" className="w-full h-full object-contain" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white drop-shadow-md">
            MY-CV<span className="text-rose-500">.TN</span>
          </span>
        </Link>
        <p className="text-xs text-slate-400 font-medium">Plateforme Intelligente de Création de CV & Recrutement</p>
      </div>

      {/* Registration Card */}
      <div className="w-full max-w-md relative z-10">
        <div className="p-[1.5px] rounded-[28px] bg-gradient-to-r from-rose-500 via-amber-400 to-indigo-500 animate-border-flow shadow-2xl shadow-rose-950/40">
          <div className="bg-white/95 backdrop-blur-2xl rounded-[26.5px] p-6 sm:p-8 text-slate-900 border border-white/60 relative overflow-hidden">
            {/* Top Accent Refraction Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 opacity-90" />

            {/* Navigation Switcher Tabs (Connexion / Inscription) */}
            <div className="flex items-center p-1 bg-slate-100/90 rounded-2xl mb-6 border border-slate-200/80 shadow-inner">
              <Link
                href="/login"
                className="flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 rounded-xl transition-all duration-200 text-center"
              >
                Connexion
              </Link>
              <button
                type="button"
                className="flex-1 py-2 text-xs font-black rounded-xl bg-white text-slate-950 shadow-sm transition-all duration-200 text-center"
              >
                Inscription
              </button>
            </div>

            {/* Feature Banner (Zero credits mention) */}
            <div className="mb-5 p-3.5 bg-gradient-to-r from-rose-50/90 via-amber-50/80 to-rose-50/90 border border-rose-200/80 rounded-2xl flex items-center gap-3 text-rose-900 backdrop-blur-sm shadow-2xs">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="text-xs leading-snug">
                <span className="font-extrabold text-slate-950">Inscription Gratuite : </span>
                <span className="text-slate-600 font-medium">Créez votre CV professionnel et boostez vos chances d'embauche !</span>
              </div>
            </div>

            <div className="mb-6 text-center sm:text-left">
              <h1 className="text-2xl font-black text-slate-950 tracking-tight">Créer un compte</h1>
              <p className="text-xs text-slate-500 mt-1">Rejoignez des milliers de candidats qui recrutent plus vite</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2.5 backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {emailConfirmationRequired ? (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-2 backdrop-blur-sm">
                  <div className="flex items-center gap-2 font-bold text-emerald-950">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span className="text-sm font-black">Vérifiez votre boîte de réception !</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Un lien de confirmation a été envoyé à l'adresse <strong className="text-slate-900">{email}</strong>. Cliquez sur ce lien pour activer votre compte.
                  </p>
                </div>

                <Link
                  href="/login"
                  className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-sm win11-btn-interactive"
                >
                  <span>Aller à la page de connexion</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Nom et Prénom</label>
                  <div className="relative group">
                    <User className="w-4 h-4 text-slate-400 group-focus-within:text-rose-500 absolute left-3.5 top-3 transition-colors" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Yassine Ben Salem"
                      required
                      className="w-full text-xs bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Adresse Email</label>
                  <div className="relative group">
                    <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-rose-500 absolute left-3.5 top-3 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="yassine@example.com"
                      required
                      className="w-full text-xs bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Mot de passe</label>
                  <div className="relative group">
                    <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-rose-500 absolute left-3.5 top-3 transition-colors" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Au moins 6 caractères"
                      required
                      minLength={6}
                      className="w-full text-xs bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/15 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirmer le mot de passe</label>
                  <div className="relative group">
                    <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-rose-500 absolute left-3.5 top-3 transition-colors" />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Retapez votre mot de passe"
                      required
                      minLength={6}
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
                      <span>Création de votre compte...</span>
                    ) : (
                      <>
                        <span>Créer mon compte gratuitement</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
            )}

            {/* Footer Navigation */}
            <div className="mt-6 pt-4 border-t border-slate-200/80 text-center text-xs text-slate-500">
              Vous avez déjà un compte ?{" "}
              <Link
                href="/login"
                className="font-bold text-rose-600 hover:text-rose-700 transition underline underline-offset-2"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
