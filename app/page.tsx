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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-rose-600 selection:text-white font-sans">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 py-2 px-4 text-center text-xs font-bold text-white shadow-xs">
        🚀 Conçu pour la Tunisie & l'International — Formats Tunisien Pro, Europass, Canadien ATS & 10 Modèles Inclus !
      </div>

      {/* Navigation */}
      <nav className="max-w-7xl w-full mx-auto px-6 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-black text-white text-lg shadow-md shadow-rose-500/20">
            ⚡
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-950">
            MY-CV<span className="text-rose-600">.AI</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600">
          <a href="#templates" className="hover:text-rose-600 transition">Modèles de CV</a>
          <a href="#features" className="hover:text-rose-600 transition">Outils & Scanner ATS</a>
          <a href="#payments" className="hover:text-rose-600 transition">Recharge D17 / Flouci</a>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Mon Espace Candidat</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 shadow-2xs transition"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition"
              >
                Créer un compte (+5 Crédits)
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl w-full mx-auto px-6 pt-16 pb-20 text-center flex flex-col items-center relative overflow-hidden">
        {/* Soft Ambient Light Glows */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-rose-200 text-xs font-bold text-rose-700 mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-rose-500" />
          <span>Créateur de CV Intelligent & Optimisation ATS en Tunisie</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 max-w-4xl leading-tight">
          Votre CV d'Excellence pour la <span className="bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 bg-clip-text text-transparent">Tunisie, l'Europe & le Canada</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mt-5 font-normal leading-relaxed">
          Générez un CV professionnel avec 11 modèles spécialisés, optimisez vos réalisations avec l'IA et maximisez vos chances d'obtenir des entretiens.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Link
            href={currentUser ? "/dashboard" : "/register"}
            className="px-6 py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-sm rounded-xl shadow-xl shadow-rose-600/25 transition transform hover:scale-105 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>{currentUser ? "Accéder à mon Tableau de Bord" : "Commencer Gratuitement (+5 Crédits Offerts)"}</span>
          </Link>
          <Link
            href="/builder"
            className="px-6 py-3.5 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-sm rounded-xl shadow-xs transition flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Ouvrir l'Éditeur Direct</span>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-14 max-w-3xl w-full text-xs font-semibold text-slate-700">
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Format Tunisien National</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>Europass & Canadien ATS</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>Support Arabe (RTL)</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Recharge D17 & Flouci</span>
          </div>
        </div>
      </section>

      {/* Three Primary Standards Section */}
      <section id="templates" className="max-w-6xl w-full mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
            Standards Internationaux
          </span>
          <h2 className="text-3xl font-extrabold text-slate-950 mt-3">3 Formats Spécialisés pour Vos Candidatures</h2>
          <p className="text-xs text-slate-600 mt-2">Chaque marché possède ses propres exigences de recrutement.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Tunisien */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-rose-300 transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-2xl">
              🇹🇳
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950">Modèle Tunisien Pro</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Idéal pour les entreprises locales, les ministères et les concours en Tunisie. Intègre la photo, le statut civil et le permis de conduire.
              </p>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100 font-medium">
              <li className="flex items-center gap-2">
                <span className="text-rose-600 font-bold">✓</span> Photo de profil professionnelle
              </li>
              <li className="flex items-center gap-2">
                <span className="text-rose-600 font-bold">✓</span> Mention des diplômes d'État (INSAT, ESPRIT...)
              </li>
            </ul>
          </div>

          {/* Card 2: Europass */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl">
              🇪🇺
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950">Europass Pro Europe</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Conforme aux standards de l'Union Européenne (France, Allemagne, Belgique). Grille de langues CECRL et mise en page structurée.
              </p>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100 font-medium">
              <li className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span> Niveaux de langue CECRL (A1 à C2)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600 font-bold">✓</span> Reconnaissance universelle en UE
              </li>
            </ul>
          </div>

          {/* Card 3: Canadien ATS */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl">
              🍁
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-950">Modèle Canadien ATS</h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Optimisé pour le marché canadien et nord-américain. Format 100% textuel sans photo anti-discrimination, prêt pour les filtres ATS.
              </p>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100 font-medium">
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
        <div className="bg-gradient-to-r from-rose-50 via-white to-amber-50 border border-rose-200/80 rounded-3xl p-8 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">
              <span>💳 Paiement 100% Local</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              Rechargez vos crédits en Dinars Tunisiens par <span className="text-rose-600">D17</span> & <span className="text-indigo-600">Flouci</span>
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Pas besoin de carte bancaire internationale. Rechargez instantanément vos crédits IA via la Poste Tunisienne (D17) ou l'application Flouci.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/builder"
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition text-center"
            >
              Accéder à l'Éditeur
            </Link>
            <Link
              href="/register"
              className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-600/20 transition text-center"
            >
              Créer mon compte (+5 Crédits)
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-8 mt-auto">
        <div className="max-w-6xl w-full mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <span>⚡ MY-CV.AI</span>
            <span>—</span>
            <span className="font-normal text-slate-500">Plateforme de CV & Recrutement IA</span>
          </div>
          <div>© {new Date().getFullYear()} MY-CV.AI. Tous droits réservés.</div>
        </div>
      </footer>
    </div>
  );
}
