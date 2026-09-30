"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/authStore";
import { UserAccount } from "@/types/auth";
import { 
  Sparkles, FileText, CheckCircle2, ArrowRight, 
  Globe, Target, Zap, ChevronRight, User, LogIn, 
  LayoutDashboard, ShieldCheck, Download, Check, Star,
  Laptop, Cpu, Award, HelpCircle, ChevronDown, CheckCheck,
  Flame, Clock, Lock
} from "lucide-react";

export default function LandingPage() {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<"tunisian" | "europass" | "canadian">("tunisian");
  const [isAiOptimized, setIsAiOptimized] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [paymentTab, setPaymentTab] = useState<"d17" | "flouci">("d17");
  const [d17Phone, setD17Phone] = useState("52 897 726");

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    fetch("/api/payments/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.settings?.d17PhoneNumber) {
          const raw = String(data.settings.d17PhoneNumber).replace(/\s+/g, "");
          const formatted = raw.length === 8 ? raw.replace(/(\d{2})(\d{3})(\d{3})/, "$1 $2 $3") : data.settings.d17PhoneNumber;
          setD17Phone(formatted);
        }
      })
      .catch(() => {});
  }, []);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const templatesInfo = {
    tunisian: {
      name: "Format Tunisien Pro",
      flag: "🇹🇳",
      desc: "Norme nationale standard avec photo professionnelle, état civil et diplômes d'État (INSAT, ESPRIT, ENIT...).",
      accent: "from-rose-500 to-red-600",
      pillBg: "bg-rose-50 text-rose-700 border-rose-200",
      photo: true,
      tag: "100% Recommandé pour la Tunisie",
      score: "99%",
    },
    europass: {
      name: "Europass Pro Europe",
      flag: "🇪🇺",
      desc: "Format officiel Union Européenne (France, Allemagne, Belgique). Grille de compétences linguistiques CECRL.",
      accent: "from-blue-600 to-indigo-600",
      pillBg: "bg-blue-50 text-blue-700 border-blue-200",
      photo: true,
      tag: "Reconnaissance Officielle UE",
      score: "98%",
    },
    canadian: {
      name: "Canadien ATS Strict",
      flag: "🍁",
      desc: "Format nord-américain 100% textuel sans photo anti-discrimination, optimisé pour passer tous les filtres ATS.",
      accent: "from-emerald-600 to-teal-600",
      pillBg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      photo: false,
      tag: "Zéro Rejet par les Robots ATS",
      score: "100%",
    },
  };

  const currentTpl = templatesInfo[selectedTemplate];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-indigo-600 selection:text-white font-sans relative overflow-x-hidden">
      {/* Dynamic Windows 11 Aurora Glowing Orbs */}
      <div className="win11-aurora top-[-140px] left-1/2 -translate-x-1/2 w-[850px] h-[500px] bg-gradient-to-tr from-blue-400/25 via-indigo-400/20 to-rose-400/25 animate-pulse-glow" />
      <div className="win11-aurora top-[35%] -left-40 w-[600px] h-[500px] bg-sky-300/25" />
      <div className="win11-aurora top-[50%] -right-40 w-[650px] h-[550px] bg-indigo-300/20" />
      <div className="win11-aurora bottom-[5%] left-1/3 w-[700px] h-[400px] bg-rose-200/20" />

      {/* Top Windows 11 Announcement Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-blue-600 to-rose-600 py-2.5 px-4 text-center text-xs font-bold text-white shadow-xs relative z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2 flex-wrap">
          <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-extrabold">
            Mise à jour 2026
          </span>
          <span>Plateforme IA n°1 en Tunisie : Formats Tunisien Pro, Europass UE & Canadien ATS sans abonnement obligatoire !</span>
          <Link href="/builder" className="underline hover:text-indigo-100 font-black ml-1 inline-flex items-center gap-0.5">
            Créer mon CV <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Windows 11 Mica Glass Floating Navigation Dock */}
      <header className="sticky top-3 z-40 px-4 sm:px-6 max-w-7xl w-full mx-auto">
        <nav className="win11-dock rounded-2xl px-5 py-3 flex items-center justify-between transition-all duration-300">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-md shadow-indigo-500/10 p-1 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              <img src="/logo.png" alt="MY-CV.TN Logo" className="w-full h-full object-contain rounded-xl" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-slate-950 flex items-center gap-1">
                MY-CV<span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">.TN</span>
                <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">(سيرتي)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-semibold block -mt-1">CV & Recrutement IA Pro</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 text-xs font-bold text-slate-600">
            <a href="#templates" className="hover:text-indigo-600 transition-colors">Modèles Internationaux</a>
            <a href="#demo" className="hover:text-indigo-600 transition-colors">Démonstration Live</a>
            <a href="#features" className="hover:text-indigo-600 transition-colors">Outils IA & ATS</a>
            <a href="#payments" className="hover:text-indigo-600 transition-colors">Recharge D17 / Flouci</a>
            <a href="#faq" className="hover:text-indigo-600 transition-colors">FAQ</a>
          </div>

          {/* User Auth / CTA Button */}
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
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="win11-btn-interactive px-3.5 py-2 bg-white/80 hover:bg-white text-slate-700 font-bold text-xs rounded-xl border border-slate-200/90 shadow-2xs backdrop-blur-md"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="win11-btn-interactive px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 border border-indigo-400/30 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
                  <span>Commencer</span>
                </Link>
              </div>
            )}
          </div>
        </nav>
      </header>

      {/* ===================== HERO SECTION ===================== */}
      <section className="max-w-7xl w-full mx-auto px-6 pt-12 pb-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Text & CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-indigo-100 text-xs font-bold text-indigo-700 shadow-xs backdrop-blur-md">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <span>Propulsé par Google Gemini IA & Algorithme ATS 2026</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-950 leading-[1.12]">
              Votre CV <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-rose-600 bg-clip-text text-transparent">Ultra-Performant</span> pour Décrocher l'Emploi Idéal.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Conçu spécifiquement pour le marché <strong>Tunisien</strong>, les opportunités en <strong>Europe (Europass)</strong> et l'immigration au <strong>Canada (Anti-rejet ATS)</strong>. Rédaction assistée par l'IA et export vectoriel immédiat.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/builder"
                className="win11-btn-interactive win11-shimmer-btn px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:opacity-95 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-indigo-600/25 border border-indigo-400/40 flex items-center gap-2.5"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Créer mon CV Maintenant</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
              <Link
                href="/cover-letter"
                className="win11-btn-interactive px-5 py-3.5 bg-white/90 hover:bg-white border border-slate-200 text-slate-800 font-bold text-sm rounded-2xl shadow-xs backdrop-blur-md flex items-center gap-2"
              >
                <FileText className="w-4 h-4 text-indigo-600" />
                <span>Générer Lettre de Motivation</span>
              </Link>
            </div>

            {/* Social Proof Stats */}
            <div className="pt-6 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-left">
              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">+18,500</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">CVs créés en Tunisie</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">99.4%</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Score Compatibilité ATS</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black text-indigo-600 tracking-tight">0% Rejet</div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">Format Vectoriel Conforme</div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive 3D Windows 11 App Window Mockup */}
          <div className="lg:col-span-6 relative">
            
            {/* Floating Live Badge 1: ATS Score */}
            <div className="absolute -top-6 -right-2 z-30 animate-float-slow hidden sm:flex items-center gap-3 bg-white/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-emerald-200/80 shadow-lg shadow-emerald-600/10">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-black text-sm">
                98%
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Score ATS Validé</div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCheck className="w-3 h-3" /> Compatible Workday & Taleo
                </div>
              </div>
            </div>

            {/* Floating Live Badge 2: AI Gemini Powered */}
            <div className="absolute -bottom-6 -left-4 z-30 animate-float-delayed hidden sm:flex items-center gap-3 bg-white/90 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-indigo-200/80 shadow-lg shadow-indigo-600/10">
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">IA Gemini Intégrée</div>
                <div className="text-[10px] text-indigo-600 font-semibold">
                  Reformulation des réalisations
                </div>
              </div>
            </div>

            {/* Windows 11 App Window Frame */}
            <div className="win11-window-shadow rounded-3xl bg-white/85 backdrop-blur-2xl border border-slate-200/90 overflow-hidden transition-all duration-300">
              
              {/* Window Header (Titlebar) */}
              <div className="bg-slate-100/90 border-b border-slate-200/80 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 cursor-pointer transition" />
                    <div className="w-3 h-3 rounded-full bg-amber-400/80 hover:bg-amber-400 cursor-pointer transition" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 cursor-pointer transition" />
                  </div>
                  <span className="text-slate-300 mx-2">|</span>
                  <div className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-indigo-600" />
                    <span>MY-CV-STUDIO.exe</span>
                    <span className="text-slate-400 text-[10px]">[{currentTpl.name}]</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping mr-1" />
                  Prêt à exporter
                </div>
              </div>

              {/* Template Switcher Tabs inside Mockup */}
              <div className="p-3 bg-slate-50/80 border-b border-slate-200/70 flex items-center gap-2 overflow-x-auto">
                <button
                  onClick={() => setSelectedTemplate("tunisian")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedTemplate === "tunisian"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <span>🇹🇳 Tunisien Pro</span>
                </button>
                <button
                  onClick={() => setSelectedTemplate("europass")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedTemplate === "europass"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <span>🇪🇺 Europass UE</span>
                </button>
                <button
                  onClick={() => setSelectedTemplate("canadian")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    selectedTemplate === "canadian"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  <span>🍁 Canadien ATS</span>
                </button>
              </div>

              {/* Inside Live Simulated CV Preview */}
              <div className="p-6 bg-white min-h-[440px] text-left space-y-5">
                {/* CV Header */}
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="text-xl font-extrabold text-slate-950">Yassine Mansour</div>
                    <div className="text-xs font-bold text-indigo-600">Ingénieur d'État en Génie Logiciel & Cloud</div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1">
                      <span>📍 Tunis, Tunisie</span>
                      <span>✉️ yassine.mansour@insat.tn</span>
                      <span>📞 +216 {d17Phone || "52 897 726"}</span>
                    </div>
                  </div>

                  {currentTpl.photo ? (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-300 border-2 border-white shadow-sm flex items-center justify-center font-bold text-slate-600 text-base flex-shrink-0">
                      YM
                    </div>
                  ) : (
                    <div className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-lg text-center flex-shrink-0">
                      🍁 Sans Photo<br />Norme ATS
                    </div>
                  )}
                </div>

                {/* CV Summary */}
                <div className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                  <strong className="text-slate-800">Profil :</strong> Ingénieur diplômé de l'INSAT avec 4+ années d'expérience dans la conception d'architectures SaaS résilientes et le déploiement de microservices sous Docker & AWS.
                </div>

                {/* Experience Item */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <strong className="font-bold text-slate-900">Lead Developer Full Stack — NovaTech Tunisie</strong>
                    <span className="text-slate-500 font-medium">2022 – Présent</span>
                  </div>
                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc list-inside">
                    <li>Conception et déploiement de la nouvelle architecture microservices pour 120 000 utilisateurs actifs.</li>
                    <li>Optimisation des temps de réponse d'API de <strong>42%</strong> grâce à l'implémentation de Redis & Next.js.</li>
                  </ul>
                </div>

                {/* Skills tags */}
                <div className="pt-2">
                  <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Compétences Clés :</div>
                  <div className="flex flex-wrap gap-1.5">
                    {["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Docker", "AWS", "CI/CD"].map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Bottom Interactive Trigger Bar */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Aperçu interactif : <strong>{currentTpl.tag}</strong>
                  </div>
                  <Link
                    href="/builder"
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    Personnaliser ce modèle <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== INTERACTIVE AI DEMO SECTION ===================== */}
      <section id="demo" className="max-w-6xl w-full mx-auto px-6 py-16 text-center">
        <div className="mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-200">
            Technologie Gemini IA
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-950 mt-3 tracking-tight">
            Regardez l'IA transformer une phrase banale en réussite percutante
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            Les recruteurs et les logiciels ATS éliminent les descriptions vagues. Cliquez ci-dessous pour tester l'optimisation en direct.
          </p>
        </div>

        {/* Live Interactive Before / After Box */}
        <div className="win11-acrylic-card rounded-3xl p-6 sm:p-8 max-w-3xl mx-auto text-left space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Before (Boring bullet) */}
            <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                <span>❌</span> Avant (À Éviter - Trop vague)
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-mono">
                "J'ai travaillé sur le développement du site web et j'ai corrigé quelques bugs pour les clients."
              </p>
              <div className="text-[10px] text-rose-600 font-semibold pt-1">
                Score ATS : 42/100 (Rejet probable)
              </div>
            </div>

            {/* After (Optimized by Gemini) */}
            <div className={`p-5 rounded-2xl border transition-all duration-500 space-y-2 ${
              isAiOptimized 
                ? "bg-emerald-50/90 border-emerald-300 shadow-md shadow-emerald-500/10" 
                : "bg-slate-50 border-slate-200 opacity-60"
            }`}>
              <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <span>✨</span> Après optimisation IA Gemini
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-semibold">
                {isAiOptimized 
                  ? "« Concevoir et déployer une plateforme e-commerce haute performance sous Next.js, réduisant le taux d'erreur de 35% et accélérant le chargement de 1.8s. »"
                  : "Cliquez sur le bouton ci-dessous pour lancer l'IA..."}
              </p>
              <div className="text-[10px] text-emerald-600 font-bold pt-1">
                Score ATS : 98/100 (Entretien garanti)
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              onClick={() => setIsAiOptimized(!isAiOptimized)}
              className="win11-btn-interactive px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/20 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>{isAiOptimized ? "Réinitialiser la phrase" : "Optimiser avec l'IA en 1 clic"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ===================== THREE SPECIALIZED STANDARDS ===================== */}
      <section id="templates" className="max-w-6xl w-full mx-auto px-6 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-200/60">
            Standards Internationaux
          </span>
          <h2 className="text-3xl font-black text-slate-950 mt-3 tracking-tight">3 Formats Conçus pour Vos Ambitions</h2>
          <p className="text-xs text-slate-600 mt-2">Chaque marché de l'emploi possède ses propres critères stricts.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Tunisien */}
          <div className="win11-acrylic-card rounded-3xl p-7 space-y-4 hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-2xl shadow-xs">
              🇹🇳
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-950">Modèle Tunisien Pro</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Idéal pour les entreprises tunisiennes, les ministères et les concours nationaux. Intègre la photo, l'état civil et le permis de conduire.
              </p>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 pt-3 border-t border-slate-100 font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-600 font-bold" /> Photo de profil professionnelle
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-600 font-bold" /> Mention des diplômes d'État (INSAT, ESPRIT...)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-rose-600 font-bold" /> Support Arabe & Bilingue RTL
              </li>
            </ul>
            <div className="pt-2">
              <Link
                href="/builder"
                className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1"
              >
                Utiliser ce modèle <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Europass */}
          <div className="win11-acrylic-card rounded-3xl p-7 space-y-4 hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-2xl shadow-xs">
              🇪🇺
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-950">Europass Pro Europe</h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                Conforme aux exigences officielles de l'Union Européenne (France, Allemagne, Belgique). Grille de compétences linguistiques CECRL.
              </p>
            </div>
            <ul className="text-xs text-slate-600 space-y-2 pt-3 border-t border-slate-100 font-medium">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 font-bold" /> Niveaux de langue CECRL (A1 à C2)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 font-bold" /> Reconnaissance universelle en UE
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-blue-600 font-bold" /> Structure officielle et claire
              </li>
            </ul>
            <div className="pt-2">
              <Link
                href="/builder"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                Utiliser ce modèle <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Canadien ATS */}
          <div className="win11-acrylic-card rounded-3xl p-7 space-y-4 hover:-translate-y-1 transition duration-300">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shadow-xs">
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
                <Check className="w-4 h-4 text-emerald-600 font-bold" /> Score de compatibilité ATS maximal
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 font-bold" /> Respect strict des normes canadiennes
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 font-bold" /> Zéro tableau pour lecture automatique
              </li>
            </ul>
            <div className="pt-2">
              <Link
                href="/builder"
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"
              >
                Utiliser ce modèle <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== LOCAL PAYMENT SECTION (D17 & FLOUCI) ===================== */}
      <section id="payments" className="max-w-6xl w-full mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/70 border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-fluent backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-4 max-w-xl text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold">
                <span>💳 Paiement 100% Local & Sécurisé</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-snug">
                Rechargez en Dinars Tunisiens par <span className="text-rose-600">D17</span> & <span className="text-indigo-600">Flouci</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Pas besoin de carte bancaire internationale. Rechargez instantanément vos crédits IA via la Poste Tunisienne (D17) ou l'application Flouci avec vérification express.
              </p>
              
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Sans frais cachés
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Validation rapide
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Support WhatsApp direct
                </div>
              </div>
            </div>

            {/* Payment Box */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-md w-full max-w-sm space-y-4">
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  onClick={() => setPaymentTab("d17")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    paymentTab === "d17"
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  📮 Poste D17
                </button>
                <button
                  onClick={() => setPaymentTab("flouci")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                    paymentTab === "flouci"
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  ⚡ Flouci
                </button>
              </div>

              {paymentTab === "d17" ? (
                <div className="text-left space-y-2 text-xs">
                  <div className="p-3 bg-rose-50/70 border border-rose-100 rounded-xl space-y-1">
                    <div className="text-[10px] text-rose-600 font-bold uppercase">Numéro D17 Officiel</div>
                    <div className="text-base font-black text-rose-900 tracking-wider">{d17Phone}</div>
                    <div className="text-[10px] text-slate-500">Titulaire : my-cv.tn Administration</div>
                  </div>
                  <p className="text-[11px] text-slate-500">Envoyez le montant souhaité via l'application D17 puis téléversez votre reçu.</p>
                </div>
              ) : (
                <div className="text-left space-y-2 text-xs">
                  <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl space-y-1">
                    <div className="text-[10px] text-indigo-600 font-bold uppercase">Compte Flouci / RIB</div>
                    <div className="text-sm font-black text-indigo-900">flouci.me/mycv_tn</div>
                    <div className="text-[10px] text-slate-500">Destinataire : MY-CV TUNISIE</div>
                  </div>
                  <p className="text-[11px] text-slate-500">Transfert instantané depuis votre compte Flouci sans aucune commission.</p>
                </div>
              )}

              <Link
                href="/builder"
                className="w-full win11-btn-interactive py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
              >
                <span>Accéder à l'Éditeur & Recharger</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FAQ ACCORDION ===================== */}
      <section id="faq" className="max-w-4xl w-full mx-auto px-6 py-16 text-left">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3.5 py-1.5 rounded-full border border-indigo-200">
            Questions Fréquentes
          </span>
          <h2 className="text-3xl font-black text-slate-950 mt-3 tracking-tight">Tout ce que vous devez savoir</h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: "Puis-je télécharger mon CV gratuitement ?",
              a: "Oui, vous pouvez exporter votre CV gratuitement à tout moment avec le filigrane officiel my-cv.tn. Si vous souhaitez un CV haute résolution sans aucun filigrane, vous pouvez opter pour un Pass Pro avec téléchargements illimités."
            },
            {
              q: "Comment fonctionne le générateur de lettre de motivation IA ?",
              a: "Le générateur se connecte automatiquement aux données de votre CV enregistré. Vous collez la description du poste recherché, et l'IA analyse les exigences pour rédiger une lettre complète, convaincante et personnalisée prête à envoyer."
            },
            {
              q: "Pourquoi utiliser le modèle Canadien ATS plutôt qu'un CV classique ?",
              a: "Au Canada et en Amérique du Nord, les cabinets de recrutement et les plateformes RH utilisent des filtres ATS automatiques qui rejettent systématiquement les CVs avec photo, colonnes complexes ou tableaux. Notre modèle Canadien respecte scrupuleusement ces normes pour garantir que votre candidature arrive sur le bureau du recruteur."
            },
            {
              q: "Comment régler avec D17 ou Flouci ?",
              a: "Depuis votre tableau de bord ou l'éditeur, sélectionnez votre formule puis effectuez le virement vers notre numéro D17 ou compte Flouci. Vous téléversez la capture d'écran de votre reçu et vos accès sont activés dès vérification."
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="win11-acrylic-card rounded-2xl overflow-hidden transition-all duration-200"
            >
              <button
                type="button"
                onClick={() => toggleFaq(idx)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-900 gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-indigo-600 flex-shrink-0 transition-transform duration-300 ${openFaqIndex === idx ? "rotate-180" : ""}`} />
              </button>
              {openFaqIndex === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ===================== FINAL CALL TO ACTION ===================== */}
      <section className="max-w-6xl w-full mx-auto px-6 py-16 text-center">
        <div className="win11-window-shadow rounded-3xl p-8 sm:p-14 bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 text-white relative overflow-hidden">
          <div className="win11-aurora -top-20 -right-20 w-80 h-80 bg-indigo-500/20" />
          <div className="win11-aurora -bottom-20 -left-20 w-80 h-80 bg-rose-500/20" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-5">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" /> Commencez en 2 minutes
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
              Prêt à propulser votre carrière au niveau supérieur ?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Rejoignez plus de 18 500 candidats qui ont fait confiance à MY-CV.TN pour leurs candidatures en Tunisie, en Europe et au Canada.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-4">
              <Link
                href="/builder"
                className="win11-btn-interactive px-8 py-3.5 bg-gradient-to-r from-indigo-500 to-blue-500 hover:opacity-90 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-xl shadow-indigo-500/25 flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-white" />
                <span>Ouvrir l'Éditeur Gratuitement</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER ===================== */}
      <footer className="border-t border-slate-200/60 bg-white/80 backdrop-blur-xl py-10 mt-auto text-xs text-slate-500">
        <div className="max-w-6xl w-full mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-2xs p-1 flex items-center justify-center">
              <img src="/logo.png" alt="MY-CV.TN Logo" className="w-full h-full object-contain rounded-lg" />
            </div>
            <div>
              <div className="font-extrabold text-slate-800 text-xs">MY-CV.TN (سيرتي)</div>
              <div className="text-[10px] text-slate-400">Plateforme de CV & Recrutement IA — Tunisie, Europe & Canada</div>
            </div>
          </div>

          <div className="flex items-center gap-6 font-semibold text-slate-600">
            <Link href="/builder" className="hover:text-indigo-600 transition">Éditeur de CV</Link>
            <Link href="/cover-letter" className="hover:text-indigo-600 transition">Lettre de Motivation</Link>
            <Link href="/login" className="hover:text-indigo-600 transition">Connexion</Link>
          </div>

          <div>© {new Date().getFullYear()} MY-CV.TN. Tous droits réservés.</div>
        </div>
      </footer>
    </div>
  );
}
