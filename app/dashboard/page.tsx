"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserAccount } from "@/types/auth";
import { ResumeData, TemplateId } from "@/types/resume";
import { getCurrentUser, fetchServerUser, logoutUser, updateUserProfile } from "@/lib/auth/authStore";
import { INITIAL_RESUME_DATA } from "@/lib/sampleData";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { AccountModal } from "@/components/account/AccountModal";
import { CreditCalculatorModal } from "@/components/modals/CreditCalculatorModal";
import { getUserPaymentRequests, PaymentRequest } from "@/lib/payments/paymentStore";
import { 
  FileText, Plus, Sparkles, Ticket, User, LogOut, 
  Copy, Trash2, Edit3, ArrowRight, CheckCircle2, Shield, 
  Mail, Award, Zap, ChevronRight, Download, Eye, Clock, Layers, CreditCard, AlertCircle
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

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      router.push("/login");
      return;
    }
    setCurrentUser(user);
    setUserPayments(getUserPaymentRequests(user.id));

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
  }, [router]);

  // Live credit and payment status sync
  useEffect(() => {
    const handleSync = async () => {
      const u = getCurrentUser();
      if (u && u.email) {
        const serverUser = await fetchServerUser(u.email);
        if (serverUser) {
          setCurrentUser(serverUser);
          setUserPayments(getUserPaymentRequests(serverUser.id));
          return;
        }
        setCurrentUser(u);
        setUserPayments(getUserPaymentRequests(u.id));
      }
    };

    handleSync();
    window.addEventListener("user_credits_updated", handleSync);
    window.addEventListener("storage", handleSync);
    const interval = setInterval(handleSync, 1500);

    return () => {
      window.removeEventListener("user_credits_updated", handleSync);
      window.removeEventListener("storage", handleSync);
      clearInterval(interval);
    };
  }, []);

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

  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
        {/* Top Header Navigation */}
        <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-black text-white text-base shadow">
                ⚡
              </div>
              <span className="font-black text-base tracking-tight text-white hidden sm:inline">
                MY-CV<span className="text-rose-500">.AI</span>
              </span>
            </a>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1 ml-4 pl-4 border-l border-slate-800 text-xs font-semibold">
              <a href="/dashboard" className="px-3 py-1.5 bg-slate-800 text-white rounded-xl font-bold shadow-xs">
                Tableau de bord
              </a>
              <a href="/builder" className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition">
                Éditeur de CV
              </a>
              <a href="/cover-letter" className="px-3 py-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-xl transition">
                Lettre de motivation IA
              </a>
            </nav>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Credits Wallet */}
            <button
              onClick={() => setIsPricingOpen(true)}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-xl border border-slate-700 text-xs transition"
            >
              <Ticket className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-extrabold text-amber-400">{currentUser?.credits ?? 0}</span>
              <span className="text-[11px] text-slate-400">Crédits</span>
              <span className="text-[10px] bg-rose-600/30 text-rose-300 font-bold px-1.5 py-0.2 rounded border border-rose-500/40 ml-0.5">
                + Recharger
              </span>
            </button>

            {/* Profile Avatar Trigger */}
            <button
              onClick={() => setIsAccountOpen(true)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1.5 rounded-xl border border-slate-700 text-xs transition"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-rose-600 to-rose-700 flex items-center justify-center font-bold text-xs text-white shadow-xs">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="hidden sm:inline font-bold text-xs max-w-[120px] truncate">
                {currentUser?.name?.split(" ")[0]}
              </span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition"
              title="Déconnexion"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Dashboard Body */}
        <main className="flex-grow p-4 sm:p-8 max-w-7xl w-full mx-auto space-y-8">
          {/* Welcome Banner Hero */}
          <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <div className="absolute -right-16 -top-16 w-64 h-64 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                  <span>Espace Candidat Intelligent</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Bonjour, {currentUser?.name} ! 👋
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 max-w-xl">
                  Gérez vos différents CVs professionnels, optimisez votre score ATS et postulez avec des candidatures percutantes.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Créer un nouveau CV</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl">
                <FileText className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">CVs Enregistrés</div>
                <div className="text-2xl font-black text-white">{resumesList.length}</div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
                <Ticket className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Crédits IA Restants</div>
                <div className="text-2xl font-black text-amber-400">{currentUser?.credits ?? 0}</div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                <Layers className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Modèles Disponibles</div>
                <div className="text-2xl font-black text-white">3 <span className="text-xs font-normal text-slate-400">(Trilingue)</span></div>
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-sm flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                <Zap className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">IA Mode Pro</div>
                <div className="text-xl font-black text-white">Activé</div>
              </div>
            </div>
          </div>

          {/* Section: Mes Recharges & Paiements D17 / Flouci */}
          {userPayments.length > 0 && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  <span>Mes Demandes de Recharge D17 & Flouci</span>
                </h3>
                <span className="text-xs text-slate-400">{userPayments.length} demande(s)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {userPayments.map((p) => (
                  <div key={p.id} className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white uppercase">{p.method}</span>
                        <span className="text-xs font-black text-amber-400">+{p.credits} Crédits</span>
                        <span className="text-xs text-slate-400">({p.amountTND.toFixed(3)} DT)</span>
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Demandé le {new Date(p.createdAt).toLocaleDateString("fr-FR")}
                      </div>
                      {p.rejectionReason && (
                        <div className="text-[11px] text-rose-400 mt-1 font-semibold">
                          Motif : {p.rejectionReason}
                        </div>
                      )}
                    </div>

                    <div>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                        p.status === "approved"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                          : p.status === "rejected"
                          ? "bg-rose-950 text-rose-400 border border-rose-800/40"
                          : "bg-amber-950 text-amber-400 border border-amber-800/40 animate-pulse"
                      }`}>
                        {p.status === "approved" ? "Validé" : p.status === "rejected" ? "Refusé" : "En attente"}
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
                <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                  <span>Mes CVs Enregistrés</span>
                  <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">
                    {resumesList.length}
                  </span>
                </h2>
                <p className="text-xs text-slate-400">Cliquez sur un CV pour l'ouvrir dans l'éditeur intelligent</p>
              </div>

              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1 transition"
              >
                <span>+ Nouveau CV</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Grid of Resumes */}
            {resumesList.length === 0 ? (
              <div className="bg-slate-900/60 border border-slate-800 border-dashed rounded-3xl p-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">Aucun CV créé pour l'instant</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
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
                    className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-3xl p-5 shadow-xl transition flex flex-col justify-between group hover:shadow-2xl hover:shadow-rose-950/20"
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
                        <h3 className="text-base font-extrabold text-white tracking-tight group-hover:text-rose-400 transition">
                          {resume.title || "Mon CV"}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                          {resume.personalInfo.jobTitle || "Titre du poste non renseigné"}
                        </p>
                      </div>

                      {/* Brief overview badges */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-medium">
                          {resume.experiences.length} exp.
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-medium">
                          {resume.education.length} formations
                        </span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-medium">
                          {resume.skills.length} compétences
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => handleOpenBuilder(resume.id)}
                        className="flex-1 py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl transition shadow flex items-center justify-center gap-1.5"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>

                      <button
                        onClick={() => handleDuplicate(resume)}
                        className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition"
                        title="Dupliquer ce CV"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(resume.id || "", resume.title || "ce CV")}
                        className="p-2 bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl border border-slate-700 hover:border-rose-500/30 transition"
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
                  className="bg-slate-900/40 border-2 border-dashed border-slate-800 hover:border-rose-500/50 rounded-3xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition group min-h-[190px]"
                >
                  <div className="w-10 h-10 rounded-2xl bg-slate-800 group-hover:bg-rose-600/20 text-slate-400 group-hover:text-rose-400 flex items-center justify-center transition mb-2">
                    <Plus className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-300 group-hover:text-white transition">
                    Créer un nouveau CV
                  </span>
                  <span className="text-[10px] text-slate-500 mt-0.5">
                    Modèle Tunisien, Europass ou Canadien
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section: Boîte à Outils & Recrutement IA */}
          <div className="space-y-4">
            <h2 className="text-lg font-black text-white tracking-tight">Outils d'Impact & Recrutement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => router.push("/builder")}
                className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950/30 border border-slate-800 hover:border-indigo-500/40 rounded-3xl cursor-pointer transition group flex items-start gap-4"
              >
                <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl group-hover:scale-105 transition">
                  <Sparkles className="w-6 h-6 text-indigo-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition">
                    Optimiseur de CV & Scanner ATS
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Comparez votre CV à une offre d'emploi, détectez les mots-clés manquants et optimisez vos puces d'expérience en Mode Pro.
                  </p>
                </div>
              </div>

              <div 
                onClick={() => router.push("/cover-letter")}
                className="p-5 bg-gradient-to-r from-slate-900 to-rose-950/30 border border-slate-800 hover:border-rose-500/40 rounded-3xl cursor-pointer transition group flex items-start gap-4"
              >
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl group-hover:scale-105 transition">
                  <Mail className="w-6 h-6 text-rose-400" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition">
                    Générateur de Lettre de Motivation IA
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Rédigez une lettre de motivation ultra-personnalisée, alignée avec votre profil et l'entreprise ciblée en quelques secondes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Modal: Create New Resume */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 text-slate-100 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-rose-500" />
                  <span>Nouveau CV</span>
                </h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleCreateResume} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Titre du CV</label>
                  <input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: CV Développeur Web Fullstack"
                    required
                    className="w-full text-xs bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Modèle de départ</label>
                  
                  {/* Group 1: Pro ATS */}
                  <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider mb-1">
                    ⭐ Modèles Pro ATS (Recommandé) :
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setNewTemplate("canadian")}
                      className={`p-2 rounded-xl border text-center transition ${
                        newTemplate === "canadian"
                          ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
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
                          ? "bg-blue-500/20 border-blue-500 text-blue-300 font-bold"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
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
                          ? "bg-rose-500/20 border-rose-500 text-rose-300 font-bold"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="text-sm">🇹🇳</div>
                      <div className="text-[10px] mt-0.5">Tunisien</div>
                    </button>
                  </div>

                  {/* Group 2: Autres Modèles */}
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1">
                    ✨ Autres Modèles :
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setNewTemplate("modern_tech")}
                      className={`p-2 rounded-xl border text-center transition ${
                        newTemplate === "modern_tech"
                          ? "bg-sky-500/20 border-sky-500 text-sky-300 font-bold"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="text-sm">🚀</div>
                      <div className="text-[10px] mt-0.5">Tech Silicon</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewTemplate("executive_luxe")}
                      className={`p-2 rounded-xl border text-center transition ${
                        newTemplate === "executive_luxe"
                          ? "bg-slate-700 border-slate-500 text-white font-bold"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
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
                          ? "bg-purple-500/20 border-purple-500 text-purple-300 font-bold"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="text-sm">🎨</div>
                      <div className="text-[10px] mt-0.5">Sidebar</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewTemplate("compact_metro")}
                      className={`p-2 rounded-xl border text-center transition ${
                        newTemplate === "compact_metro"
                          ? "bg-indigo-500/20 border-indigo-500 text-indigo-300 font-bold"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="text-sm">🏙️</div>
                      <div className="text-[10px] mt-0.5">Compact</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewTemplate("gradient_header")}
                      className={`p-2 rounded-xl border text-center transition ${
                        newTemplate === "gradient_header"
                          ? "bg-pink-500/20 border-pink-500 text-pink-300 font-bold"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="text-sm">🌅</div>
                      <div className="text-[10px] mt-0.5">Gradient</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewTemplate("minimalist_clean")}
                      className={`p-2 rounded-xl border text-center transition ${
                        newTemplate === "minimalist_clean"
                          ? "bg-slate-800 border-slate-400 text-white font-bold"
                          : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
                      }`}
                    >
                      <div className="text-sm">📄</div>
                      <div className="text-[10px] mt-0.5">Minimaliste</div>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/30 transition flex items-center justify-center gap-2 cursor-pointer"
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
