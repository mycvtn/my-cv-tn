"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/authStore";
import { UserAccount } from "@/types/auth";
import { 
  Sparkles, FileText, CheckCircle2, ArrowRight, 
  Globe, Target, Zap, ChevronRight, User, LogIn, LayoutDashboard
} from "lucide-react";

export default function LandingPage() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-rose-600 selection:text-white">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-rose-600 to-amber-600 py-1.5 px-4 text-center text-xs font-semibold text-white">
        🚀 Conçu pour la Tunisie & l'International — Formats Tunisien, Europass & Canadien ATS disponibles !
      </div>

      {/* Navigation */}
      <nav className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-black text-white text-lg shadow-lg">
            ⚡
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            MY-CV<span className="text-rose-500">.AI</span>
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#templates" className="hover:text-white transition">Modèles</a>
          <a href="#features" className="hover:text-white transition">Outils IA</a>
          <a href="#payments" className="hover:text-white transition">Paiement Local</a>
        </div>

        <div className="flex items-center gap-3">
          {currentUser ? (
            <Link
              href="/dashboard"
              className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-lg transition transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Mon Tableau de Bord</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-lg transition"
              >
                S'inscrire (+10 Crédits)
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl w-full mx-auto px-6 pt-16 pb-20 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-medium text-rose-400 mb-6 shadow-inner">
          <Sparkles className="w-3.5 h-3.5 text-rose-400" />
          <span>Propulsé par Google Gemini & Optimisation ATS</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl leading-tight">
          Votre CV d'Excellence pour la <span className="bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 bg-clip-text text-transparent">Tunisie, l'Europe & le Canada</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mt-5 font-normal leading-relaxed">
          Générez un CV percutant avec 3 moteurs de modèles spécialisés, optimisez vos puces de réalisations avec l'IA et débloquez plus d'entretiens.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          <Link
            href={currentUser ? "/dashboard" : "/register"}
            className="px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-rose-600/30 transition transform hover:scale-105 flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            <span>{currentUser ? "Accéder à mon Tableau de Bord" : "Commencer Gratuitement (+10 Crédits)"}</span>
          </Link>
        </div>

        {/* Feature Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-14 max-w-3xl w-full text-xs text-slate-300">
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Format Tunisien Complet</span>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Format Canadien Anti-Biais</span>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Europass 100% Conforme</span>
          </div>
          <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Paiement Flouci & D17</span>
          </div>
        </div>
      </section>

      {/* 3 Template Modes Section */}
      <section id="templates" className="bg-slate-900 py-20 border-y border-slate-800">
        <div className="max-w-6xl w-full mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              3 Moteurs de Modèles Dédiés à Chaque Marché
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Un recruteur tunisien, français ou canadien n'a pas les mêmes critères. My-CV AI adapte automatiquement la structure.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Format Tunisien */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-rose-500/50 transition flex flex-col justify-between">
              <div>
                <div className="text-2xl mb-3">🇹🇳</div>
                <h3 className="text-lg font-bold text-white mb-2">Format Tunisien & Maghreb</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Idéal pour postuler dans les entreprises locales, banques et ministères. Intègre la photo, la situation matrimoniale, le permis B, et le détail académique (Bac, Licence, Diplôme National d'Ingénieur).
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 mb-6">
                  <li className="flex items-center gap-2">✓ Photo & Permis de conduire</li>
                  <li className="flex items-center gap-2">✓ Établissements (INSAT, ESPRIT, ENIT...)</li>
                  <li className="flex items-center gap-2">✓ Cursus bilingue Français / Arabe</li>
                </ul>
              </div>
              <Link href={currentUser ? "/dashboard" : "/login"} className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1">
                Utiliser ce modèle <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 2. Format Europass */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-blue-500/50 transition flex flex-col justify-between">
              <div>
                <div className="text-2xl mb-3">🇪🇺</div>
                <h3 className="text-lg font-bold text-white mb-2">Format Europass (Union Européenne)</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Structure européenne normalisée pour postuler en France, Allemagne ou Belgique. Agencement deux colonnes avec grille des langues standard CECRL (A1 à C2).
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 mb-6">
                  <li className="flex items-center gap-2">✓ Grille CECRL pour les langues</li>
                  <li className="flex items-center gap-2">✓ Taxonomie des compétences numériques</li>
                  <li className="flex items-center gap-2">✓ 100% conforme aux recruteurs de l'UE</li>
                </ul>
              </div>
              <Link href={currentUser ? "/dashboard" : "/login"} className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                Utiliser ce modèle <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* 3. Format Canadien */}
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/50 transition flex flex-col justify-between">
              <div>
                <div className="text-2xl mb-3">🇨🇦</div>
                <h3 className="text-lg font-bold text-white mb-2">Format Canadien Anti-Biais (ATS)</h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Conçu selon les normes strictes de la charte des droits et libertés au Canada (sans photo, sans âge, sans état civil) avec des puces axées sur les résultats chiffrés.
                </p>
                <ul className="text-xs text-slate-300 space-y-1.5 mb-6">
                  <li className="flex items-center gap-2">✓ Zéro photo ni données discriminatoires</li>
                  <li className="flex items-center gap-2">✓ Méthode CAR (Challenge Action Result)</li>
                  <li className="flex items-center gap-2">✓ Optimisé pour Job Bank et Indeed Canada</li>
                </ul>
              </div>
              <Link href={currentUser ? "/dashboard" : "/login"} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
                Utiliser ce modèle <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section id="features" className="py-20 max-w-6xl w-full mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs uppercase font-bold text-rose-500 tracking-wider">Intelligence Artificielle</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            Propulsé par Google Gemini 2.5
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Magic Polish de Puces</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transforme vos phrases simples en déclarations d'impact avec verbes d'action et métriques quantifiées.
            </p>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Scanner ATS d'Offre d'Emploi</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Collez n'importe quelle annonce de recrutement pour calculer votre score de compatibilité et découvrir les mots-clés manquants.
            </p>
          </div>

          <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">Lettre de Motivation Ciblée</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Rédige une lettre de motivation sur mesure en français, anglais ou arabe synchronisée avec votre profil et le poste ciblé.
            </p>
          </div>
        </div>
      </section>

      {/* Local Payment Section */}
      <section id="payments" className="bg-slate-900 py-16 border-t border-slate-800">
        <div className="max-w-4xl w-full mx-auto px-6 text-center">
          <h2 className="text-2xl font-extrabold text-white">
            Monétisation & Moyens de Paiement 100% Tunisiens
          </h2>
          <p className="text-xs text-slate-400 mt-2 max-w-xl mx-auto">
            Pas besoin de carte internationale. Payez en dinars tunisiens (TND) avec vos solutions habituelles.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="font-bold text-sm text-white">Flouci</div>
              <div className="text-[11px] text-slate-400 mt-1">Paiement instantané par wallet ou carte bancaire</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="font-bold text-sm text-white">Konnect</div>
              <div className="text-[11px] text-slate-400 mt-1">Cartes nationales, e-DINAR de la Poste Tunisienne</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
              <div className="font-bold text-sm text-white">Codes Recharge D17</div>
              <div className="text-[11px] text-slate-400 mt-1">Recharge par ticket ou code promo pour étudiants</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 text-center text-xs text-slate-500 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            © {new Date().getFullYear()} My-CV AI (سيرتي). Tous droits réservés.
          </div>
          <div className="flex gap-4">
            <Link href={currentUser ? "/dashboard" : "/login"} className="hover:text-slate-300">Tableau de bord</Link>
            <Link href={currentUser ? "/builder" : "/login"} className="hover:text-slate-300">Éditeur de CV</Link>
            <Link href={currentUser ? "/cover-letter" : "/login"} className="hover:text-slate-300">Lettre de Motivation</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
