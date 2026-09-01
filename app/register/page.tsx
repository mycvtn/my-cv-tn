"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registerNewUser } from "@/lib/auth/authStore";
import { Lock, Mail, User, ArrowRight, Gift } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
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

    setTimeout(() => {
      const res = registerNewUser(name, email, password);
      setLoading(false);
      if (res.success) {
        router.push("/dashboard");
      } else {
        setError(res.error || "Une erreur est survenue.");
      }
    }, 300);
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

      {/* Registration Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10">
        {/* Welcome Bonus Header Banner */}
        <div className="mb-5 p-3 bg-gradient-to-r from-rose-600/20 to-amber-500/20 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-rose-300">
          <div className="p-2 bg-rose-600/30 rounded-xl">
            <Gift className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">Offre de Bienvenue :</div>
            <div className="text-[11px] text-rose-200">5 Crédits IA offerts pour créer, scanner et exporter vos CVs !</div>
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-xl font-extrabold text-white tracking-tight">Créer un nouveau compte</h1>
          <p className="text-xs text-slate-400 mt-1">Créez et sauvegardez vos différents CVs en ligne</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs text-rose-300 flex items-center gap-2">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Nom et Prénom</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Yassine Ben Salem"
                required
                className="w-full text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Adresse Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yassine@example.com"
                required
                className="w-full text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
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
                placeholder="Minimum 6 caractères"
                required
                className="w-full text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Confirmer le mot de passe</label>
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
            title="Créer votre compte My-CV.AI et recevoir 5 crédits offerts"
            aria-label="Créer votre compte My-CV.AI et recevoir 5 crédits offerts"
            className="w-full mt-2 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            {loading ? (
              <span>Création du compte...</span>
            ) : (
              <>
                <span>Créer mon compte (+5 Crédits Offerts)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Link to Login */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Vous possédez déjà un compte ?{" "}
          <a 
            href="/login" 
            title="Se connecter à votre compte existant"
            aria-label="Se connecter à votre compte existant"
            className="font-bold text-rose-400 hover:text-rose-300 transition"
          >
            Se connecter
          </a>
        </div>
      </div>
    </div>
  );
}
