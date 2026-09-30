"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserAccount } from "@/types/auth";
import { ResumeData, TemplateId } from "@/types/resume";
import { getCurrentUser, fetchServerUser, logoutUser, updateUserProfile, getUserSubscriptionInfo } from "@/lib/auth/authStore";
import { INITIAL_RESUME_DATA } from "@/lib/sampleData";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AccountModal } from "@/components/account/AccountModal";
import { CreditCalculatorModal } from "@/components/modals/CreditCalculatorModal";
import { getUserPaymentRequests, fetchServerPaymentRequests, PaymentRequest } from "@/lib/payments/paymentStore";
import { 
  FileText, Plus, Sparkles, User, LogOut, 
  Copy, Trash2, Edit3, ArrowRight, CheckCircle2, Shield, 
  Mail, Award, Zap, ChevronRight, Download, Eye, Clock, Layers, CreditCard, AlertCircle,
  Crown, Calendar, AlertTriangle, RefreshCw
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [resumesList, setResumesList] = useState<ResumeData[]>([]);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [isPricingOpen, setIsPricingOpen] = useState<boolean>(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [userPayments, setUserPayments] = useState<PaymentRequest[]>([]);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newTemplate, setNewTemplate] = useState<TemplateId>("tunisian");

  // Storage Keys per user
  const getUserStorageKeys = (user: UserAccount | null) => {
    const userId = user ? user.id : "guest";
    return {
      listKey: `my_cv_resumes_list_${userId}`,
      activeIdKey: `my_cv_active_resume_id_${userId}`,
    };
  };

  const syncUserData = async () => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }

    // 1. Instant local read
    setCurrentUser(user);
    setUserPayments(getUserPaymentRequests(user.id, user.email));

    // 2. Fetch fresh server data
    try {
      if (user.email) {
        const [freshUser, freshRequests] = await Promise.all([
          fetchServerUser(user.email),
          fetchServerPaymentRequests(),
        ]);
        if (freshUser) {
          setCurrentUser(freshUser);
          setUserPayments(getUserPaymentRequests(freshUser.id, freshUser.email));
        } else if (freshRequests) {
          setUserPayments(getUserPaymentRequests(user.id, user.email));
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }

    syncUserData();

    const { listKey } = getUserStorageKeys(user);
    const savedList = localStorage.getItem(listKey);
    if (savedList) {
      try {
        const parsed = JSON.parse(savedList);
        if (Array.isArray(parsed)) {
          setResumesList(parsed);
        }
      } catch (e) {}
    }

    const handleSync = () => {
      const u = getCurrentUser();
      if (u) {
        setCurrentUser(u);
        setUserPayments(getUserPaymentRequests(u.id, u.email));
      }
    };

    window.addEventListener("user_credits_updated", handleSync);
    window.addEventListener("payment_requests_updated", handleSync);
    window.addEventListener("storage", handleSync);

    // Light background sync every 15s (zero UI blocking)
    const interval = setInterval(syncUserData, 15000);

    return () => {
      window.removeEventListener("user_credits_updated", handleSync);
      window.removeEventListener("payment_requests_updated", handleSync);
      window.removeEventListener("storage", handleSync);
      clearInterval(interval);
    };
  }, [router]);

  const handleOpenBuilder = (resumeId?: string) => {
    if (resumeId) {
      const { activeIdKey } = getUserStorageKeys(currentUser);
      localStorage.setItem(activeIdKey, resumeId);
    }
    router.push("/builder");
  };

  const handleCreateResume = (e: React.FormEvent) => {
    e.preventDefault();
    const { listKey, activeIdKey } = getUserStorageKeys(currentUser);
    const newId = `cv-${currentUser?.id || "usr"}-${Date.now()}`;

    const newResume: ResumeData = {
      id: newId,
      title: newTitle.trim() || `Mon CV ${resumesList.length + 1}`,
      personalInfo: {
        fullName: currentUser?.name || "",
        jobTitle: "",
        email: currentUser?.email || "",
        phone: "",
        location: "",
        summary: "",
        photoUrl: "",
        linkedin: "",
        github: "",
        website: "",
        maritalStatus: undefined,
      },
      experiences: [],
      education: [],
      skills: [],
      languages: [],
      projects: [],
      certifications: [],
      settings: {
        template: newTemplate,
        primaryColor: "#e11d48",
        fontFamily: "sans",
        fontSize: "base",
        spacing: "normal",
        language: "fr",
        showPhoto: true,
        showMaritalStatus: false,
        showDrivingLicense: false,
        showBirthDate: false,
      },
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [newResume, ...resumesList];
    setResumesList(updatedList);
    localStorage.setItem(listKey, JSON.stringify(updatedList));
    localStorage.setItem(activeIdKey, newId);

    setIsCreateModalOpen(false);
    setNewTitle("");
    router.push("/builder");
  };

  const handleDuplicate = (resume: ResumeData) => {
    const { listKey, activeIdKey } = getUserStorageKeys(currentUser);
    const newId = `cv-${currentUser?.id || "usr"}-${Date.now()}`;
    const duplicated: ResumeData = {
      ...JSON.parse(JSON.stringify(resume)),
      id: newId,
      title: `${resume.title || "CV"} (Copie)`,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [duplicated, ...resumesList];
    setResumesList(updatedList);
    localStorage.setItem(listKey, JSON.stringify(updatedList));
    localStorage.setItem(activeIdKey, newId);
  };

  const handleDelete = (id: string, title: string) => {
    if (confirm(`Confirmez-vous la suppression du CV "${title}" ?`)) {
      const { listKey, activeIdKey } = getUserStorageKeys(currentUser);
      const remaining = resumesList.filter((r) => r.id !== id);
      setResumesList(remaining);
      localStorage.setItem(listKey, JSON.stringify(remaining));

      const savedActive = localStorage.getItem(activeIdKey);
      if (savedActive === id) {
        if (remaining.length > 0) {
          localStorage.setItem(activeIdKey, remaining[0].id || "");
        } else {
          localStorage.removeItem(activeIdKey);
        }
      }
    }
  };

  const handleCreditRecharge = (addedCredits: number) => {
    if (currentUser) {
      const updated = updateUserProfile(currentUser.id, {
        credits: currentUser.credits + addedCredits,
      });
      if (updated) setCurrentUser(updated);
    }
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  const getTemplateBadge = (tpl?: string) => {
    switch (tpl) {
      case "canadian":
        return <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">🍁 Canadien ATS</span>;
      case "europass":
        return <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">🇪🇺 Europass ATS</span>;
      case "modern_tech":
        return <span className="text-[10px] font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded-full border border-sky-500/30">🚀 Moderne Tech</span>;
      case "executive_luxe":
        return <span className="text-[10px] font-bold bg-slate-700 text-slate-200 px-2 py-0.5 rounded-full border border-slate-600">💎 Executive Luxe</span>;
      case "creative_sidebar":
        return <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">🎨 Créatif Sidebar</span>;
      case "compact_metro":
        return <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">🏙️ Compact Metro</span>;
      case "gradient_header":
        return <span className="text-[10px] font-bold bg-pink-500/20 text-pink-300 px-2 py-0.5 rounded-full border border-pink-500/30">🌅 Gradient Header</span>;
      case "minimalist_clean":
        return <span className="text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">📄 Minimaliste Clean</span>;
      case "tunisian":
      default:
        return <span className="text-[10px] font-bold bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/30">🇹🇳 Tunisien Pro</span>;
    }
  };

  const subInfo = getUserSubscriptionInfo(currentUser);
  const daysRemaining = subInfo.expiresAt
    ? Math.ceil((new Date(subInfo.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const isExpiringSoon = subInfo.isSubscribed && daysRemaining !== null && daysRemaining <= 7 && daysRemaining >= 0;
  const isExpired = subInfo.status === "expired" || (daysRemaining !== null && daysRemaining < 0);

    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#f8fafc] text-slate-900 font-sans flex flex-col relative overflow-x-hidden selection:bg-indigo-500 selection:text-white">
          {/* Windows 11 Aurora Ambient Glows */}
          <div className="win11-aurora top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-300/20 via-indigo-300/25 to-rose-300/20" />
          <div className="win11-aurora top-[400px] -left-32 w-[500px] h-[400px] bg-sky-200/25" />

          {/* Windows 11 Mica Acrylic Top Header Navigation */}
          <header className="bg-white/80 backdrop-blur-2xl border-b border-slate-200/70 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30 shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
            <div className="flex items-center gap-3">
              <a href="/dashboard" className="flex items-center gap-2.5 group">
                <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 shadow-2xs p-0.5 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                  <img src="/logo.png" alt="MY-CV.TN" className="w-full h-full object-contain rounded-lg" />
                </div>
                <span className="font-black text-base tracking-tight text-slate-950 hidden sm:inline">
                  MY-CV<span className="bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">.TN</span>
                </span>
              </a>

              {/* Navigation Tabs */}
              <nav className="hidden md:flex items-center gap-1.5 ml-4 pl-4 border-l border-slate-200/80 text-xs font-semibold">
                <a href="/dashboard" className="win11-btn-interactive px-3.5 py-1.5 bg-white text-slate-950 border border-slate-200/90 rounded-xl font-bold shadow-2xs">
                  Tableau de bord
                </a>
                <a href="/builder" className="win11-btn-interactive px-3.5 py-1.5 text-slate-600 hover:text-slate-950 hover:bg-white/80 rounded-xl transition">
                  Éditeur de CV
                </a>
                <a href="/cover-letter" className="win11-btn-interactive px-3.5 py-1.5 text-slate-600 hover:text-slate-950 hover:bg-white/80 rounded-xl transition">
                  Lettre de motivation IA
                </a>
              </nav>
            </div>

            {/* Right Header Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Subscription Status Button */}
              <button
                onClick={() => setIsPricingOpen(true)}
                className={`win11-btn-interactive flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold shadow-2xs cursor-pointer ${
                  subInfo.isSubscribed
                    ? subInfo.tier === "annual"
                      ? "bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300"
                      : "bg-blue-50 hover:bg-blue-100 text-blue-950 border-blue-300"
                    : "bg-white/80 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border-slate-200 hover:border-rose-300 backdrop-blur-md"
                }`}
              >
                {subInfo.isSubscribed ? (
                  <>
                    {subInfo.tier === "annual" ? (
                      <Crown className="w-3.5 h-3.5 text-amber-600" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    <span>{subInfo.tier === "annual" ? "👑 Pass Annuel" : "✨ Pass Semestriel"}</span>
                    <span className="text-[10px] bg-white/90 text-emerald-800 px-2 py-0.5 rounded border border-slate-200 font-bold ml-0.5">
                      ✨ Illimité
                    </span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                    <span>Pass Pro (Abonnement)</span>
                    <span className="text-[10px] bg-rose-600 text-white font-black px-1.5 py-0.5 rounded shadow-xs ml-0.5">
                      S'abonner
                    </span>
                  </>
                )}
              </button>

              {/* Profile Avatar Trigger */}
              <button
                onClick={() => setIsAccountOpen(true)}
                className="win11-btn-interactive flex items-center gap-2 bg-white/80 hover:bg-white text-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs shadow-2xs backdrop-blur-md cursor-pointer"
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center font-bold text-xs text-white shadow-xs">
                  {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
                </div>
                <span className="hidden sm:inline font-bold text-xs max-w-[120px] truncate text-slate-900">
                  {currentUser?.name?.split(" ")[0]}
                </span>
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="win11-btn-interactive p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                title="Déconnexion"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Main Dashboard Body */}
          <main className="flex-grow p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-6 relative z-10">
            
            {/* ALERTE EXPIRATION ABONNEMENT (1 SEMAINE AVANT LA FIN OU EXPIRE) */}
            {isExpiringSoon && (
              <div className="p-4 bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-amber-500/15 border-2 border-amber-400 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black flex-shrink-0 shadow-sm">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                      <span>Rappel : Votre abonnement expire bientôt !</span>
                      <span className="text-[10px] bg-amber-200 text-amber-950 px-2 py-0.5 rounded-full font-black uppercase">
                        {daysRemaining === 0 ? "Aujourd'hui" : daysRemaining === 1 ? "Dans 1 jour" : `Dans ${daysRemaining} jours`}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Votre <strong>{subInfo.tier === "annual" ? "Pass Annuel" : "Pass Semestriel"}</strong> arrive à expiration le <strong>{subInfo.expiresAt ? new Date(subInfo.expiresAt).toLocaleDateString("fr-FR") : ""}</strong>. Pensez à renouveler dès maintenant pour continuer à profiter de vos téléchargements sans filigrane.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsPricingOpen(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow transition cursor-pointer flex-shrink-0"
                >
                  Renouveler mon Pass Pro
                </button>
              </div>
            )}

            {isExpired && (
              <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black flex-shrink-0">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-rose-950">
                      Votre abonnement Pro a expiré
                    </h3>
                    <p className="text-xs text-rose-700 mt-0.5">
                      Vous êtes actuellement sur la version gratuite avec filigrane. Réactivez votre Pass pour télécharger à nouveau vos CVs professionnels sans filigrane.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsPricingOpen(true)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow transition cursor-pointer flex-shrink-0"
                >
                  Réactiver mon Abonnement
                </button>
              </div>
            )}

            {/* Welcome Banner Hero */}
            <div className="relative overflow-hidden win11-acrylic-card rounded-3xl p-6 sm:p-8 shadow-fluent bg-gradient-to-r from-indigo-50/70 via-white to-blue-50/70 border border-slate-200/90 backdrop-blur-xl">
              <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-200/30 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200/60">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Espace Candidat Intelligent</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                    Bonjour, {currentUser?.name} ! 👋
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                    Gérez vos différents CVs professionnels, optimisez votre score ATS et téléchargez vos candidatures en haute définition.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="win11-btn-interactive win11-shimmer-btn w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:opacity-95 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-indigo-600/25 border border-indigo-400/40 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Créer un nouveau CV</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="win11-acrylic-card rounded-3xl p-5 shadow-fluent border border-slate-200/90 flex items-center gap-4">
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">CVs Enregistrés</div>
                  <div className="text-2xl font-black text-slate-950">{resumesList.length}</div>
                </div>
              </div>

              <div 
                onClick={() => setIsPricingOpen(true)}
                className="win11-acrylic-card rounded-3xl p-5 shadow-fluent border border-slate-200/90 hover:border-amber-400 flex items-center gap-4 cursor-pointer"
              >
                <div className={`p-3 rounded-2xl border ${subInfo.isSubscribed ? "bg-amber-50 border-amber-200 text-amber-600" : "bg-slate-100 border-slate-200 text-slate-600"}`}>
                  {subInfo.tier === "annual" ? <Crown className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Abonnement Pro</div>
                  <div className="text-base font-black text-slate-950 flex items-center gap-1">
                    {subInfo.isSubscribed ? (
                      <span className="text-emerald-700">{subInfo.tier === "annual" ? "👑 Pass Annuel" : "✨ Pass Semestriel"}</span>
                    ) : (
                      <span className="text-slate-600 text-xs font-bold">Non abonné (Gratuit)</span>
                    )}
                  </div>
                  {subInfo.expiresAt && (
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Jusqu'au {new Date(subInfo.expiresAt).toLocaleDateString("fr-FR")}
                    </div>
                  )}
                </div>
              </div>

              <div className="win11-acrylic-card rounded-3xl p-5 shadow-fluent border border-slate-200/90 flex items-center gap-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <Download className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Téléchargements CV Pro</div>
                  <div className="text-2xl font-black text-emerald-600">
                    {subInfo.isSubscribed ? "Illimités ✨" : "Filigrane Gratuit"}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {subInfo.isSubscribed ? "Téléchargements sans filigrane à volonté" : "Abonnement requis pour le sans filigrane"}
                  </div>
                </div>
              </div>

              <div className="win11-acrylic-card rounded-3xl p-5 shadow-fluent border border-slate-200/90 flex items-center gap-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
                  <Layers className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-slate-500 font-medium">Modèles & ATS</div>
                  <div className="text-xl font-black text-slate-950">11 Modèles</div>
                  <div className="text-[10px] text-slate-400">Trilingue (FR, EN, AR)</div>
                </div>
              </div>
            </div>

            {/* Section: Mes Demandes d'Abonnement (D17, Flouci & Virement) */}
            {userPayments.length > 0 && (
              <div className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-600" />
                    <span>Mes Demandes d'Abonnement (D17, Flouci & Virement)</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-bold">{userPayments.length} demande(s)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {userPayments.map((p) => (
                    <div key={p.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-black text-slate-950">
                            {p.planType === "annual" ? "👑 Pass Annuel (12 Mois)" : p.planType === "semi_annual" ? "✨ Pass Semestriel (6 Mois)" : "Pass Pro"}
                          </span>
                          <span className="text-[11px] font-bold bg-slate-200/80 text-slate-700 px-2 py-0.2 rounded uppercase">
                            {p.method}
                          </span>
                          <span className="text-xs font-extrabold text-emerald-700">
                            {p.amountTND.toFixed(3)} DT
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Envoyée le {new Date(p.createdAt).toLocaleDateString("fr-FR")} à {new Date(p.createdAt).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
                        </div>
                        {p.rejectionReason && (
                          <div className="text-[11px] text-rose-600 font-semibold bg-rose-50 p-1.5 rounded-lg border border-rose-200">
                            Motif du refus : {p.rejectionReason}
                          </div>
                        )}
                      </div>

                      <div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                          p.status === "approved"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                            : p.status === "rejected"
                            ? "bg-rose-100 text-rose-800 border border-rose-300"
                            : "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                        }`}>
                          {p.status === "approved" ? "✓ Validé & Actif" : p.status === "rejected" ? "✕ Refusé" : "⏳ En attente validation"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Section: Mes CVs Enregistrés */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-950 tracking-tight flex items-center gap-2">
                  <span>Mes CVs Enregistrés</span>
                  <span className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full font-bold">
                    {resumesList.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-500">Cliquez sur un CV pour l'ouvrir dans l'éditeur intelligent</p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 transition"
              >
                <span>+ Nouveau CV</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Grid of Resumes */}
            {resumesList.length === 0 ? (
              <div className="bg-white border border-slate-200 border-dashed rounded-3xl p-8 text-center space-y-4 shadow-2xs">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 mx-auto flex items-center justify-center text-slate-500">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Aucun CV créé pour l'instant</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Démarrez avec notre éditeur moderne et créez votre premier CV optimisé pour décrocher des entretiens.
                  </p>
                </div>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow transition"
                >
                  + Créer mon premier CV
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {resumesList.map((resume) => (
                  <div
                    key={resume.id}
                    className="win11-acrylic-card rounded-3xl p-5 shadow-fluent border border-slate-200/90 hover:border-indigo-400 flex flex-col justify-between group hover:shadow-fluent-hover transition duration-300"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        {getTemplateBadge(resume.settings?.template)}
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{resume.updatedAt ? new Date(resume.updatedAt).toLocaleDateString() : "Récent"}</span>
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-extrabold text-slate-950 tracking-tight group-hover:text-indigo-600 transition">
                          {resume.title || "Mon CV"}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {resume.personalInfo.jobTitle || "Titre du poste non renseigné"}
                        </p>
                      </div>

                      {/* Brief overview badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-medium border border-slate-200/60">
                          {resume.experiences.length} exp.
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-medium border border-slate-200/60">
                          {resume.education.length} formations
                        </span>
                        <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg font-medium border border-slate-200/60">
                          {resume.skills.length} compétences
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenBuilder(resume.id)}
                        className="win11-btn-interactive flex-1 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>

                      <button
                        onClick={() => handleDuplicate(resume)}
                        className="win11-btn-interactive p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition cursor-pointer"
                        title="Dupliquer ce CV"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(resume.id || "", resume.title || "ce CV")}
                        className="win11-btn-interactive p-2 bg-slate-100 hover:bg-rose-100 text-slate-500 hover:text-rose-700 rounded-xl border border-slate-200 hover:border-rose-300 transition cursor-pointer"
                        title="Supprimer ce CV"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {/* + New Card */}
                <div
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-white border-2 border-dashed border-slate-300 hover:border-rose-400 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition group min-h-[190px] shadow-2xs"
                >
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 group-hover:bg-rose-100 text-slate-600 group-hover:text-rose-600 flex items-center justify-center transition mb-2">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-800 group-hover:text-rose-600 transition">
                    Créer un nouveau CV
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    11 modèles disponibles (Tunisien, Europass, Canadien...)
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section: Boîte à Outils & Recrutement IA */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-slate-950 tracking-tight">Outils d'Impact & Recrutement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => router.push("/builder")}
                className="p-5 bg-white border border-slate-200/90 hover:border-indigo-300 rounded-3xl cursor-pointer transition group flex items-start gap-4 shadow-2xs hover:shadow-xs"
              >
                <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl group-hover:scale-105 transition">
                  <Sparkles className="w-6 h-6 text-indigo-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-950 group-hover:text-indigo-600 transition">
                    Optimiseur de CV & Scanner ATS
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Comparez votre CV à une offre d'emploi, détectez les mots-clés manquants et optimisez vos puces d'expérience en Mode Pro.
                  </p>
                </div>
              </div>

              <div 
                onClick={() => router.push("/cover-letter")}
                className="p-5 bg-white border border-slate-200/90 hover:border-rose-300 rounded-3xl cursor-pointer transition group flex items-start gap-4 shadow-2xs hover:shadow-xs"
              >
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl group-hover:scale-105 transition">
                  <Mail className="w-6 h-6 text-rose-600" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-950 group-hover:text-rose-600 transition">
                    Générateur de Lettre de Motivation IA
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Rédigez une lettre de motivation ultra-personnalisée, alignée avec votre profil et l'entreprise ciblée en quelques secondes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Modal: Create New Resume */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 text-slate-900 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-rose-600" />
                  <span>Nouveau CV</span>
                </h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-slate-700">✕</button>
              </div>

              <form onSubmit={handleCreateResume} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Titre du CV</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: CV Développeur Web Fullstack"
                    required
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Modèle de départ</label>
                  
                  {/* Group 1: Pro ATS */}
                  <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                    ⭐ Modèles Pro ATS (Recommandé) :
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setNewTemplate("canadian")}
                      className={`p-2 rounded-xl border text-center transition ${
                        newTemplate === "canadian"
                          ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-sm">🍁</div>
                      <div className="text-[10px] mt-0.5">Canadien ATS</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewTemplate("europass")}
                      className={`p-2 rounded-xl border text-center transition ${
                        newTemplate === "europass"
                          ? "bg-blue-50 border-blue-500 text-blue-800 font-bold shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-sm">🇪🇺</div>
                      <div className="text-[10px] mt-0.5">Europass</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewTemplate("tunisian")}
                      className={`p-2 rounded-xl border text-center transition ${
                        newTemplate === "tunisian"
                          ? "bg-rose-50 border-rose-500 text-rose-800 font-bold shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-sm">🇹🇳</div>
                      <div className="text-[10px] mt-0.5">Tunisien</div>
                    </button>
                  </div>

                  {/* Group 2: Autres Modèles */}
                  <div className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider mb-1">
                    ✨ Autres Modèles :
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewTemplate("modern_tech")}
                      className={`p-2 rounded-xl border text-center transition ${
                        newTemplate === "modern_tech"
                          ? "bg-sky-50 border-sky-500 text-sky-800 font-bold shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-sm">🚀</div>
                      <div className="text-[10px] mt-0.5">Tech Silicon</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewTemplate("nordic_light")}
                      className={`p-2 rounded-xl border text-center transition ${
                        newTemplate === "nordic_light"
                          ? "bg-blue-50 border-blue-500 text-blue-800 font-bold shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-sm">❄️</div>
                      <div className="text-[10px] mt-0.5">Nordique Clair</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewTemplate("classic_raw")}
                      className={`p-2 rounded-xl border text-center transition ${
                        newTemplate === "classic_raw"
                          ? "bg-slate-100 border-slate-900 text-slate-950 font-bold shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-sm">📝</div>
                      <div className="text-[10px] mt-0.5">Sans Design</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewTemplate("executive_luxe")}
                      className={`p-2 rounded-xl border text-center transition ${
                        newTemplate === "executive_luxe"
                          ? "bg-slate-100 border-slate-700 text-slate-900 font-bold shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-sm">💎</div>
                      <div className="text-[10px] mt-0.5">Executive</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewTemplate("creative_sidebar")}
                      className={`p-2 rounded-xl border text-center transition ${
                        newTemplate === "creative_sidebar"
                          ? "bg-purple-50 border-purple-500 text-purple-800 font-bold shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-sm">🎨</div>
                      <div className="text-[10px] mt-0.5">Sidebar</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewTemplate("minimalist_clean")}
                      className={`p-2 rounded-xl border text-center transition ${
                        newTemplate === "minimalist_clean"
                          ? "bg-slate-100 border-slate-800 text-slate-950 font-bold shadow-2xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-sm">📄</div>
                      <div className="text-[10px] mt-0.5">Minimaliste</div>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Créer et Ouvrir dans l'Éditeur</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Profile & Account Modal */}
        <AccountModal
          isOpen={isAccountOpen}
          onClose={() => setIsAccountOpen(false)}
          currentUser={currentUser}
          onUserUpdated={(u) => setCurrentUser(u)}
          onOpenPricing={() => setIsPricingOpen(true)}
        />

        {/* Credit Calculator & D17 / Flouci Modal */}
        <CreditCalculatorModal
          isOpen={isPricingOpen}
          onClose={() => {
            setIsPricingOpen(false);
            if (currentUser) {
              setUserPayments(getUserPaymentRequests(currentUser.id));
            }
          }}
          currentBalance={currentUser?.credits ?? 0}
          onSelectPlan={() => {
            if (currentUser) {
              setUserPayments(getUserPaymentRequests(currentUser.id));
            }
          }}
        />
      </div>
    </AuthGuard>
  );
}
