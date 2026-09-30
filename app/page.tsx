"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/authStore";
import { UserAccount } from "@/types/auth";
import { 
  Sparkles, FileText, CheckCircle2, ArrowRight, 
  Globe, Target, Zap, ChevronRight, User, LogIn, LayoutDashboard, ShieldCheck, Download
} from "lucide-react";

export default function LandingPage() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white font-sans relative overflow-x-hidden">
      {/* Windows 11 Aurora Bloom Glows */}
      <div className="win11-aurora top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-blue-400/20 via-indigo-300/25 to-rose-300/20" />
      <div className="win11-aurora top-[350px] left-[-150px] w-[500px] h-[400px] bg-sky-200/30" />
      <div className="win11-aurora top-[450px] right-[-150px] w-[500px] h-[400px] bg-violet-200/25" />

      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-rose-600 py-2 px-4 text-center text-xs font-bold text-white shadow-xs">
        <span className="inline-flex items-center gap-2">
          <span>✨</span>
          <span>Conçu pour la Tunisie & l'International — Formats Tunisien Pro, Europass, Canadien ATS & 10 Modèles Inclus !</span>
        </span>
      </div>

      {/* Windows 11 Mica Glass Navbar */}
      <nav className="max-w-7xl w-full mx-auto px-6 py-3.5 flex items-center justify-between border-b border-slate-200/60 bg-white/75 backdrop-blur-2xl sticky top-0 z-30 shadow-[0_4px_20px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center font-black text-white text-lg shadow-md shadow-indigo-500/20 transition-transform duration-300 hover:scale-105">
            ⚡
          </div>
          <span className="font-black text-xl tracking-tight text-slate-950">
            MY-CV<span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">.TN</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
          <a href="#templates" className="hover:text-indigo-600 transition-colors">Modèles de CV</a>
          <a href="#features" className="hover:text-indigo-600 transition-colors">Outils & Scanner ATS</a>
          <a href="#payments" className="hover:text-indigo-600 transition-colors">Recharge D17 / Flouci</a>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <Link
              href="/dashboard"
              className="win11-btn-interactive px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 flex items-center gap-2 border border-indigo-400/30"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Mon Espace Candidat</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/login"
                className="win11-btn-interactive px-4 py-2 bg-white/80 hover:bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-200/90 shadow-2xs backdrop-blur-md"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="win11-btn-interactive px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 border border-indigo-400/30"
              >
                Créer un compte (+5 Crédits)
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl w-full mx-auto px-6 pt-16 pb-20 text-center flex flex-col items-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 border border-indigo-100 text-xs font-bold text-indigo-700 mb-6 shadow-xs backdrop-blur-md">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          <span>Créateur de CV Intelligent & Optimisation ATS en Tunisie</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 max-w-4xl leading-[1.15]">
          Votre CV d'Excellence pour la <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-rose-600 bg-clip-text text-transparent">Tunisie, l'Europe & le Canada</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mt-5 font-normal leading-relaxed">
          Générez un CV professionnel avec 11 modèles spécialisés, optimisez vos réalisations avec l'IA et maximisez vos chances d'obtenir des entretiens.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Link
            href={currentUser ? "/dashboard" : "/register"}
            className="win11-btn-interactive px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:opacity-95 text-white font-bold text-sm rounded-2xl shadow-xl shadow-indigo-600/20 border border-indigo-400/40 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>{currentUser ? "Accéder à mon Tableau de Bord" : "Commencer Gratuitement (+5 Crédits Offerts)"}</span>
          </Link>
          <Link
            href="/builder"
            className="win11-btn-interactive px-6 py-3.5 bg-white/90 hover:bg-white border border-slate-200 text-slate-800 font-bold text-sm rounded-2xl shadow-xs backdrop-blur-md flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-indigo-600" />
            <span>Ouvrir l'Éditeur Direct</span>
          </Link>
        </div>

        {/* Feature Pills (Fluent Glass Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-14 max-w-3xl w-full text-xs font-semibold text-slate-700">
          <div className="p-3.5 bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/70 shadow-xs flex items-center gap-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-fluent hover:border-slate-300">
            <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span>Format Tunisien National</span>
          </div>
          <div className="p-3.5 bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/70 shadow-xs flex items-center gap-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-fluent hover:border-slate-300">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>Europass & Canadien ATS</span>
          </div>
          <div className="p-3.5 bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/70 shadow-xs flex items-center gap-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-fluent hover:border-slate-300">
            <CheckCircle2 className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>Support Arabe (RTL)</span>
          </div>
          <div className="p-3.5 bg-white/80 backdrop-blur-xl rounded-2xl border border-slate-200/70 shadow-xs flex items-center gap-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-fluent hover:border-slate-300">
            <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Recharge D17 & Flouci</span>
          </div>
        </div>
      </section>

      {/* Three Primary Standards Section */}
      <section id="templates" className="max-w-6xl w-full mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50/80 px-3.5 py-1.5 rounded-full border border-indigo-200/60 backdrop-blur-md">
            Standards Internationaux
          </span>
          <h2 className="text-3xl font-black text-slate-950 mt-3 tracking-tight">3 Formats Spécialisés pour Vos Candidatures</h2>
          <p className="text-xs text-slate-600 mt-2">Chaque marché possède ses propres exigences de recrutement.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Tunisien */}
          <div className="win11-acrylic-card rounded-3xl p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-50 to-rose-100/80 border border-rose-200/60 flex items-center justify-center text-2xl shadow-xs">
              🇹🇳
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-950">Modèle Tunisien Pro</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Idéal pour les entreprises locales, les ministères et les concours en Tunisie. Intègre la photo, le statut civil et le permis de conduire.
              </p>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 pt-3 border-t border-slate-100 font-medium">
              <li className="flex items-center gap-2">
                <span className="text-rose-600 font-bold">✓</span> Photo de profil professionnelle
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-600 font-bold">✓</span> Mention des diplômes d'État (INSAT, ESPRIT...)
              </li>
            </ul>
          </div>

          {/* Card 2: Europass */}
          <div className="win11-acrylic-card rounded-3xl p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-50 to-blue-100/80 border border-blue-200/60 flex items-center justify-center text-2xl shadow-xs">
              🇪🇺
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-950">Europass Pro Europe</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Conforme aux standards de l'Union Européenne (France, Allemagne, Belgique). Grille de langues CECRL et mise en page structurée.
              </p>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 pt-3 border-t border-slate-100 font-medium">
              <li className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span> Niveaux de langue CECRL (A1 à C2)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span> Reconnaissance universelle en UE
              </li>
            </ul>
          </div>

          {/* Card 3: Canadien ATS */}
          <div className="win11-acrylic-card rounded-3xl p-7 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-50 to-emerald-100/80 border border-emerald-200/60 flex items-center justify-center text-2xl shadow-xs">
              🍁
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-950">Modèle Canadien ATS</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Optimisé pour le marché canadien et nord-américain. Format 100% textuel sans photo anti-discrimination, prêt pour les filtres ATS.
              </p>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 pt-3 border-t border-slate-100 font-medium">
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> Score de compatibilité ATS maximal
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-600 font-bold">✓</span> Respect des normes canadiennes
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Local Payment Section */}
      <section id="payments" className="max-w-6xl w-full mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/70 border border-slate-200/80 rounded-3xl p-8 sm:p-12 shadow-fluent flex flex-col md:flex-row items-center justify-between gap-8 backdrop-blur-xl">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
              <span>💳 Paiement 100% Local</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
              Rechargez vos crédits en Dinars Tunisiens par <span className="text-rose-600">D17</span> & <span className="text-indigo-600">Flouci</span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pas besoin de carte bancaire internationale. Rechargez instantanément vos crédits IA via la Poste Tunisienne (D17) ou l'application Flouci.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/builder"
              className="win11-btn-interactive px-6 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition text-center"
            >
              Accéder à l'Éditeur
            </Link>
            <Link
              href="/register"
              className="win11-btn-interactive px-6 py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 border border-indigo-400/30 transition text-center"
            >
              Créer mon compte (+5 Crédits)
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white/80 backdrop-blur-xl py-8 mt-auto">
        <div className="max-w-6xl w-full mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <span>⚡ MY-CV.TN</span>
            <span>—</span>
            <span className="font-normal text-slate-500">Plateforme de CV & Recrutement IA</span>
          </div>
          <div>© {new Date().getFullYear()} MY-CV.TN. Tous droits réservés.</div>
        </div>
      </footer>
    </div>
  );
}
