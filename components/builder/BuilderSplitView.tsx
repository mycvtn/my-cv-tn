"use client";

import React, { useState, useEffect } from "react";
import { ResumeData, TemplateId } from "@/types/resume";
import { UserAccount } from "@/types/auth";
import { getCurrentUser, getStoredUsers, fetchServerUser, updateUserProfile } from "@/lib/auth/authStore";
import { INITIAL_RESUME_DATA } from "@/lib/sampleData";
import { ResumeForm } from "./ResumeForm";
import { TemplateRenderer } from "../templates/TemplateRenderer";
import { ATSScoreModal } from "./ATSScoreModal";
import { CoverLetterModal } from "./CoverLetterModal";
import { PricingModal } from "../pricing/PricingModal";
import { ExportButton } from "../pdf/ExportButton";
import { ResumeManagerModal } from "./ResumeManagerModal";
import { AccountModal } from "../account/AccountModal";
import { DualActionBar } from "./DualActionBar";
import { CreditCalculatorModal } from "../modals/CreditCalculatorModal";
import { 
  ZoomIn, ZoomOut, Maximize2, Ticket, Eye, 
  FolderOpen, Plus, Check, ChevronDown, Sparkles, Languages,
  User, Shield, LogIn, FilePlus, FileText, PlusCircle
} from "lucide-react";

export const BuilderSplitView: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [resumesList, setResumesList] = useState<ResumeData[]>([]);
  const [activeResumeId, setActiveResumeId] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const [zoom, setZoom] = useState<number>(0.85);
  const [isATSOpen, setIsATSOpen] = useState<boolean>(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState<boolean>(false);
  const [isPricingOpen, setIsPricingOpen] = useState<boolean>(false);
  const [isCreditCalculatorOpen, setIsCreditCalculatorOpen] = useState<boolean>(false);
  const [isManagerOpen, setIsManagerOpen] = useState<boolean>(false);
  const [isAccountOpen, setIsAccountOpen] = useState<boolean>(false);
  const [activeTabMobile, setActiveTabMobile] = useState<"editor" | "preview">("editor");
  const [savedToast, setSavedToast] = useState<boolean>(false);

  // Helper to get storage keys isolated by User ID
  const getUserStorageKeys = (user: UserAccount | null) => {
    const userId = user ? user.id : "guest";
    return {
      listKey: `my_cv_resumes_list_${userId}`,
      activeIdKey: `my_cv_active_resume_id_${userId}`,
    };
  };

  // Load User and their private Multi-CVs list from LocalStorage
  useEffect(() => {
    try {
      const user = getCurrentUser();
      setCurrentUser(user);

      const { listKey, activeIdKey } = getUserStorageKeys(user);
      const savedList = localStorage.getItem(listKey);
      const savedActiveId = localStorage.getItem(activeIdKey);

      if (savedList) {
        const parsedList: ResumeData[] = JSON.parse(savedList);
        if (Array.isArray(parsedList) && parsedList.length > 0) {
          setResumesList(parsedList);
          if (savedActiveId && parsedList.some((r) => r.id === savedActiveId)) {
            setActiveResumeId(savedActiveId);
          } else {
            setActiveResumeId(parsedList[0].id || "");
          }
          setIsLoaded(true);
          return;
        }
      }

      // For brand new accounts: Keep resumes list completely empty (0 CVs)
      setResumesList([]);
      setActiveResumeId("");
      setIsLoaded(true);
    } catch (e) {
      console.error("Error loading isolated user resume list:", e);
      setResumesList([]);
      setIsLoaded(true);
    }
  }, []);

  // Live credit sync across admin validation, server API & multi-tabs
  useEffect(() => {
    const handleSyncCredits = async () => {
      const active = getCurrentUser();
      if (active && active.email) {
        const serverUser = await fetchServerUser(active.email);
        if (serverUser) {
          setCurrentUser(serverUser);
          return;
        }
        const all = getStoredUsers();
        const found = all.find((u) => u.email === active.email || u.id === active.id);
        if (found) {
          setCurrentUser(found);
        }
      }
    };

    handleSyncCredits();
    window.addEventListener("user_credits_updated", handleSyncCredits);
    window.addEventListener("storage", handleSyncCredits);
    const interval = setInterval(handleSyncCredits, 1500);

    return () => {
      window.removeEventListener("user_credits_updated", handleSyncCredits);
      window.removeEventListener("storage", handleSyncCredits);
      clearInterval(interval);
    };
  }, []);

  const activeResume: ResumeData | null =
    resumesList.find((r) => r.id === activeResumeId) ||
    (resumesList.length > 0 ? resumesList[0] : null);

  const handleDataChange = (updated: ResumeData) => {
    if (!activeResume) return;
    const { listKey, activeIdKey } = getUserStorageKeys(currentUser);

    const updatedWithMeta = {
      ...updated,
      id: activeResumeId,
      title: activeResume.title || updated.title || "Mon CV",
      updatedAt: new Date().toISOString(),
    };

    const newList = resumesList.map((r) => (r.id === activeResumeId ? updatedWithMeta : r));
    setResumesList(newList);

    try {
      localStorage.setItem(listKey, JSON.stringify(newList));
      localStorage.setItem(activeIdKey, activeResumeId);
      setSavedToast(true);
      setTimeout(() => setSavedToast(false), 2000);
    } catch (e) {}
  };

  const handleTemplateSwitch = (t: TemplateId) => {
    if (!activeResume) return;
    handleDataChange({
      ...activeResume,
      settings: { ...activeResume.settings, template: t },
    });
  };

  const handleLanguageSwitch = (lang: "fr" | "en" | "ar") => {
    if (!activeResume) return;
    handleDataChange({
      ...activeResume,
      settings: { ...activeResume.settings, language: lang },
    });
  };

  const handleApplySummary = (newSummary: string) => {
    if (!activeResume) return;
    handleDataChange({
      ...activeResume,
      personalInfo: { ...activeResume.personalInfo, summary: newSummary },
    });
  };

  const handleSelectResume = (id: string) => {
    const { activeIdKey } = getUserStorageKeys(currentUser);
    setActiveResumeId(id);
    localStorage.setItem(activeIdKey, id);
  };

  const handleCreateResume = (
    title: string,
    template: TemplateId = "tunisian",
    mode: "blank" | "sample" | "duplicate" = "blank"
  ) => {
    const { listKey, activeIdKey } = getUserStorageKeys(currentUser);
    const newId = `cv-${currentUser?.id || "usr"}-${Date.now()}`;
    let baseData: ResumeData;

    if (mode === "duplicate" && activeResume) {
      baseData = JSON.parse(JSON.stringify(activeResume));
      baseData.id = newId;
      baseData.title = title || `${activeResume.title} (Copie)`;
    } else if (mode === "sample") {
      baseData = {
        ...INITIAL_RESUME_DATA,
        id: newId,
        title: title || "Exemple de CV",
        personalInfo: {
          ...INITIAL_RESUME_DATA.personalInfo,
          fullName: currentUser?.name || INITIAL_RESUME_DATA.personalInfo.fullName,
          email: currentUser?.email || INITIAL_RESUME_DATA.personalInfo.email,
        },
      };
    } else {
      // 100% Clean Blank CV (Empty fields)
      baseData = {
        id: newId,
        title: title || "Nouveau CV",
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
          template,
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
    }

    const newResume: ResumeData = {
      ...baseData,
      id: newId,
      title: title || `CV ${resumesList.length + 1}`,
      updatedAt: new Date().toISOString(),
      settings: {
        ...baseData.settings,
        template,
      },
    };

    const updatedList = [...resumesList, newResume];
    setResumesList(updatedList);
    setActiveResumeId(newId);

    try {
      localStorage.setItem(listKey, JSON.stringify(updatedList));
      localStorage.setItem(activeIdKey, newId);
    } catch (e) {}
  };

  const handleRenameResume = (id: string, newTitle: string) => {
    const { listKey } = getUserStorageKeys(currentUser);
    const updatedList = resumesList.map((r) => (r.id === id ? { ...r, title: newTitle } : r));
    setResumesList(updatedList);
    try {
      localStorage.setItem(listKey, JSON.stringify(updatedList));
    } catch (e) {}
  };

  const handleDuplicateResume = (id: string) => {
    const target = resumesList.find((r) => r.id === id);
    if (!target) return;

    const { listKey, activeIdKey } = getUserStorageKeys(currentUser);
    const newId = `cv-${currentUser?.id || "usr"}-${Date.now()}`;
    const duplicated: ResumeData = {
      ...JSON.parse(JSON.stringify(target)),
      id: newId,
      title: `${target.title || "CV"} (Copie)`,
      updatedAt: new Date().toISOString(),
    };

    const updatedList = [...resumesList, duplicated];
    setResumesList(updatedList);
    setActiveResumeId(newId);

    try {
      localStorage.setItem(listKey, JSON.stringify(updatedList));
      localStorage.setItem(activeIdKey, newId);
    } catch (e) {}
  };

  const handleDeleteResume = (id: string) => {
    const { listKey, activeIdKey } = getUserStorageKeys(currentUser);
    const remaining = resumesList.filter((r) => r.id !== id);
    setResumesList(remaining);

    if (remaining.length > 0) {
      if (activeResumeId === id) {
        const nextActiveId = remaining[0].id || "";
        setActiveResumeId(nextActiveId);
        localStorage.setItem(activeIdKey, nextActiveId);
      }
    } else {
      setActiveResumeId("");
      localStorage.removeItem(activeIdKey);
    }
    localStorage.setItem(listKey, JSON.stringify(remaining));
  };

  const handleCreditRecharge = (addedCredits: number) => {
    if (currentUser) {
      const updated = updateUserProfile(currentUser.id, {
        credits: currentUser.credits + addedCredits,
      });
      if (updated) setCurrentUser(updated);
    }
  };

  const getResumeFullText = () => {
    if (!activeResume) return "";
    return `${activeResume.personalInfo.fullName} - ${activeResume.personalInfo.jobTitle}
${activeResume.personalInfo.summary}
Compétences: ${activeResume.skills.map((s) => s.name).join(", ")}
Expériences: ${activeResume.experiences.map((e) => `${e.title} chez ${e.company}: ${e.bulletPoints.join(" ")}`).join(" | ")}
Formation: ${activeResume.education.map((ed) => `${ed.degree} (${ed.institution})`).join(", ")}`;
  };

  const userCredits = currentUser?.credits ?? 10;

  if (!isLoaded) {
    return (
      <div className="h-screen bg-slate-950 flex items-center justify-center text-slate-400 font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium">Chargement de votre espace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Top Main Navigation Header (Clean Light Theme) */}
      <header className="bg-white/95 backdrop-blur-md text-slate-900 px-3 sm:px-4 py-2.5 flex items-center justify-between border-b border-slate-200/90 flex-shrink-0 z-20 shadow-2xs">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <a href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-black text-white text-base shadow-sm">
              ⚡
            </div>
            <div className="hidden sm:block">
              <span className="font-extrabold text-sm tracking-tight text-slate-950">MY-CV<span className="text-rose-600">.TN</span></span>
              <span className="text-[10px] text-slate-500 block -mt-1 font-medium">Plateforme Trilingue Pro</span>
            </div>
          </a>

          {/* Multi-Resume Selector & Manager Trigger */}
          <div className="flex items-center gap-1.5 ml-1 sm:ml-2">
            <button
              onClick={() => setIsManagerOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 bg-slate-100 hover:bg-slate-200/80 text-slate-800 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold transition group shadow-2xs"
              title="Gérer, dupliquer ou créer une nouvelle version de vos CVs"
              aria-label="Gérer, dupliquer ou créer une nouvelle version de vos CVs"
            >
              <FolderOpen className="w-3.5 h-3.5 text-rose-600 group-hover:scale-110 transition" />
              <span className="max-w-[100px] sm:max-w-[160px] truncate font-bold text-slate-900">
                {activeResume ? (activeResume.title || "Mon CV") : "Aucun CV"}
              </span>
              <span className="text-[10px] bg-white text-slate-700 border border-slate-200 px-1.5 py-0.2 rounded-full font-bold">
                {resumesList.length}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>
          </div>

          {/* Fast Language Switcher (FR / EN / AR) - Visible when CV exists */}
          {activeResume && (
            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => handleLanguageSwitch("fr")}
                title="Afficher et éditer le CV en langue Française"
                aria-label="Afficher et éditer le CV en langue Française"
                className={`px-2 py-1 text-xs font-bold rounded-lg transition ${
                  activeResume.settings.language === "fr" || !activeResume.settings.language
                    ? "bg-white text-slate-950 shadow-xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                🇫🇷 FR
              </button>
              <button
                onClick={() => handleLanguageSwitch("en")}
                title="Afficher et éditer le CV en langue Anglaise (English)"
                aria-label="Afficher et éditer le CV en langue Anglaise (English)"
                className={`px-2 py-1 text-xs font-bold rounded-lg transition ${
                  activeResume.settings.language === "en"
                    ? "bg-white text-slate-950 shadow-xs border border-slate-200/60"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                🇬🇧 EN
              </button>
              <button
                onClick={() => handleLanguageSwitch("ar")}
                title="Afficher et éditer le CV en langue Arabe (العربية avec support RTL)"
                aria-label="Afficher et éditer le CV en langue Arabe (العربية avec support RTL)"
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition font-sans ${
                  activeResume.settings.language === "ar"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-950"
                }`}
              >
                🇸🇦 العربية
              </button>
            </div>
          )}

          {/* Template Fast Switcher Badges */}
          {activeResume && (
            <div className="hidden xl:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => handleTemplateSwitch("tunisian")}
                title="Bascule vers le Modèle Tunisien Pro (Format standard national)"
                aria-label="Bascule vers le Modèle Tunisien Pro"
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  activeResume.settings.template === "tunisian"
                    ? "bg-rose-600 text-white shadow-xs font-bold"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                🇹🇳 Tunisien
              </button>
              <button
                onClick={() => handleTemplateSwitch("europass")}
                title="Bascule vers le Modèle Europass Pro (Format Union Européenne)"
                aria-label="Bascule vers le Modèle Europass Pro"
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  activeResume.settings.template === "europass"
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                🇪🇺 Europass
              </button>
              <button
                onClick={() => handleTemplateSwitch("canadian")}
                title="Bascule vers le Modèle Canadien ATS (Format Amérique du Nord optimisé ATS)"
                aria-label="Bascule vers le Modèle Canadien ATS"
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition ${
                  activeResume.settings.template === "canadian"
                    ? "bg-emerald-600 text-white shadow-xs font-bold"
                    : "text-slate-700 hover:text-slate-950"
                }`}
              >
                🍁 Canadien ATS
              </button>
            </div>
          )}
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2">
          {/* Credit Wallet Button (my-cv.tn) */}
          <button
            onClick={() => setIsCreditCalculatorOpen(true)}
            title="Calculateur et recharge de crédits IA par D17 / Flouci"
            aria-label="Calculateur et recharge de crédits IA par D17 / Flouci"
            className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-950 px-2.5 sm:px-3 py-1.5 rounded-xl border border-amber-200 text-xs transition shadow-2xs"
          >
            <Ticket className="w-3.5 h-3.5 text-amber-600" />
            <span className="font-bold text-amber-900">{userCredits}</span>
            <span className="hidden sm:inline text-[11px] text-amber-800">Crédits</span>
            <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded shadow-xs ml-0.5">
              + Recharger
            </span>
          </button>

          {/* User Account / Auth Avatar Button */}
          {currentUser ? (
            <button
              onClick={() => setIsAccountOpen(true)}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs transition"
              title="Gérer votre compte"
            >
              <div className="w-5 h-5 rounded-lg bg-rose-600 flex items-center justify-center font-bold text-[10px] text-white">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden md:inline font-semibold text-xs max-w-[100px] truncate text-slate-900">
                {currentUser.name.split(" ")[0]}
              </span>
            </button>
          ) : (
            <a
              href="/login"
              className="flex items-center gap-1 bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Connexion</span>
            </a>
          )}

          {/* Direct PDF Export */}
          {activeResume && (
            <ExportButton
              elementId="resume-sheet-preview"
              resumeData={activeResume}
              candidateName={activeResume.personalInfo.fullName}
              isUnlocked={userCredits > 0}
              onRequireUnlock={() => setIsPricingOpen(true)}
            />
          )}
        </div>
      </header>

      {/* Main Split Body OR Empty Account Onboarding State */}
      {resumesList.length === 0 || !activeResume ? (
        /* Empty State for Brand New Accounts */
        <div className="flex-grow bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-900 relative overflow-hidden">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-rose-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-lg w-full bg-white border border-slate-200/90 rounded-3xl p-8 text-center shadow-xl z-10 space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-rose-600 to-amber-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-600/30">
              <FilePlus className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-950 tracking-tight">
                Bienvenue {currentUser?.name ? currentUser.name.split(" ")[0] : ""} ! 👋
              </h2>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Votre compte est prêt. Vous n'avez pas encore de CV enregistré dans votre espace personnel.
              </p>
            </div>

            {/* Quick Template Choice Cards */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 text-left">
              <div 
                onClick={() => handleCreateResume("Mon CV Pro", "tunisian", "blank")}
                className="p-3 bg-slate-50 hover:bg-rose-50/50 hover:border-rose-300 border border-slate-200 rounded-2xl cursor-pointer transition group shadow-2xs"
              >
                <div className="text-lg mb-1">🇹🇳</div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-rose-600 transition">Modèle Tunisien</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Avec photo & design moderne</div>
              </div>

              <div 
                onClick={() => handleCreateResume("Mon CV Europass", "europass", "blank")}
                className="p-3 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 border border-slate-200 rounded-2xl cursor-pointer transition group shadow-2xs"
              >
                <div className="text-lg mb-1">🇪🇺</div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition">Modèle Europass</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Standard européen certifié</div>
              </div>

              <div 
                onClick={() => handleCreateResume("Mon CV ATS Canadien", "canadian", "blank")}
                className="p-3 bg-slate-50 hover:bg-emerald-50/50 hover:border-emerald-300 border border-slate-200 rounded-2xl cursor-pointer transition group shadow-2xs"
              >
                <div className="text-lg mb-1">🍁</div>
                <div className="text-xs font-bold text-slate-900 group-hover:text-emerald-600 transition">Canadien ATS</div>
                <div className="text-[10px] text-slate-500 mt-0.5">1 colonne sobre & optimisé ATS</div>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => handleCreateResume("Mon Premier CV", "tunisian", "blank")}
              className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2 cursor-pointer transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Créer mon premier CV maintenant</span>
            </button>
          </div>
        </div>
      ) : (
        /* Regular Split Editor when at least 1 CV exists */
        <>
          {/* Mobile Tab Switcher */}
          <div className="md:hidden flex bg-white border-b border-slate-200">
            <button
              onClick={() => setActiveTabMobile("editor")}
              className={`flex-1 py-2 text-xs font-bold border-b-2 text-center ${
                activeTabMobile === "editor" ? "border-rose-600 text-rose-600 bg-rose-50/50" : "border-transparent text-slate-600"
              }`}
            >
              Éditeur Formulaire
            </button>
            <button
              onClick={() => setActiveTabMobile("preview")}
              className={`flex-1 py-2 text-xs font-bold border-b-2 text-center ${
                activeTabMobile === "preview" ? "border-rose-600 text-rose-600 bg-rose-50/50" : "border-transparent text-slate-600"
              }`}
            >
              Aperçu Feuille A4
            </button>
          </div>

          <div className="flex-grow flex flex-row overflow-hidden relative">
            {/* Left Pane: Form Editor (50% on desktop) */}
            <div
              className={`w-full md:w-1/2 p-3 sm:p-4 overflow-y-auto flex-shrink-0 ${
                activeTabMobile === "editor" ? "block" : "hidden md:block"
              }`}
            >
              <ResumeForm
                data={activeResume}
                onChange={handleDataChange}
                onOpenATS={() => setIsATSOpen(true)}
                onOpenCoverLetter={() => setIsCoverLetterOpen(true)}
              />
            </div>

            {/* Right Pane: Live Sheet Preview Canvas (50% on desktop) */}
            <div
              className={`w-full md:w-1/2 bg-slate-200/90 flex flex-col overflow-hidden relative ${
                activeTabMobile === "preview" ? "block" : "hidden md:flex"
              }`}
            >
              {/* Preview Toolbar */}
              <div className="bg-white/90 backdrop-blur-md px-4 py-2 border-b border-slate-300 flex items-center justify-between z-10 flex-shrink-0 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>Aperçu Document A4</span>
                  <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded uppercase font-bold">
                    {activeResume.settings.template} ({activeResume.settings.language || "fr"})
                  </span>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                    className="p-1 text-slate-600 hover:text-slate-900 rounded"
                    title="Dézoomer"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-bold text-slate-700 w-10 text-center">
                    {Math.round(zoom * 100)}%
                  </span>
                  <button
                    onClick={() => setZoom(Math.min(1.2, zoom + 0.1))}
                    className="p-1 text-slate-600 hover:text-slate-900 rounded"
                    title="Zoomer"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoom(0.85)}
                    className="p-1 text-slate-600 hover:text-slate-900 rounded ml-1"
                    title="Ajuster"
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Canvas Scroll Area */}
              <div className="flex-grow overflow-auto p-4 sm:p-8 flex justify-center items-start">
                <div className="transition-transform duration-150">
                  <TemplateRenderer data={activeResume} scale={zoom} />
                </div>
              </div>

              {/* Dual Action Bar (my-cv.tn: Gratuit avec filigrane vs Pro 10 Crédits) */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 z-10 flex-shrink-0">
                <DualActionBar
                  resumeData={activeResume}
                  userCredits={userCredits}
                  userId={currentUser?.id}
                  onOpenCreditCalculator={() => setIsCreditCalculatorOpen(true)}
                  onDeductCredits={(deducted) => {
                    if (currentUser) {
                      const newCredits = Math.max(0, (currentUser.credits || 10) - deducted);
                      updateUserProfile(currentUser.id, { credits: newCredits });
                      setCurrentUser({ ...currentUser, credits: newCredits });
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <CreditCalculatorModal
        isOpen={isCreditCalculatorOpen}
        onClose={() => setIsCreditCalculatorOpen(false)}
        currentBalance={userCredits}
      />

      <ResumeManagerModal
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        resumes={resumesList}
        activeId={activeResumeId}
        onSelectResume={handleSelectResume}
        onCreateResume={handleCreateResume}
        onRenameResume={handleRenameResume}
        onDuplicateResume={handleDuplicateResume}
        onDeleteResume={handleDeleteResume}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        currentUser={currentUser}
        onUserUpdated={(u) => setCurrentUser(u)}
        onOpenPricing={() => setIsPricingOpen(true)}
      />

      {activeResume && (
        <>
          <ATSScoreModal
            isOpen={isATSOpen}
            onClose={() => setIsATSOpen(false)}
            resumeText={getResumeFullText()}
            onApplySummary={handleApplySummary}
          />

          <CoverLetterModal
            isOpen={isCoverLetterOpen}
            onClose={() => setIsCoverLetterOpen(false)}
            resumeData={activeResume}
          />
        </>
      )}

      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        onSuccessCredit={handleCreditRecharge}
      />
    </div>
  );
};
