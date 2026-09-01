"use client";

import React, { useState, useRef } from "react";
import { ResumeData, ExperienceItem, EducationItem, SkillItem, LanguageItem, LanguageLevel } from "@/types/resume";
import { 
  User, Briefcase, GraduationCap, Wrench, Globe,
  Sparkles, Plus, Trash2, Palette, Loader2, Upload, Camera, Target, Calendar
} from "lucide-react";
import { getEditorLabels, SupportedLanguage } from "@/lib/i18n/resumeTranslations";

interface Props {
  data: ResumeData;
  onChange: (updated: ResumeData) => void;
  onOpenATS: () => void;
  onOpenCoverLetter: () => void;
}

export const ResumeForm: React.FC<Props> = ({ data, onChange, onOpenATS, onOpenCoverLetter }) => {
  const [activeSection, setActiveSection] = useState<string>("personal");
  const [optimizingIndex, setOptimizingIndex] = useState<{ expId: string; index: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentLang = (data.settings?.language || "fr") as SupportedLanguage;
  const isRTL = currentLang === "ar";
  const t = getEditorLabels(currentLang);

  const updatePersonalInfo = (field: string, value: any) => {
    onChange({ ...data, personalInfo: { ...data.personalInfo, [field]: value } });
  };

  const updateSettings = (field: string, value: any) => {
    onChange({ ...data, settings: { ...data.settings, [field]: value } });
  };

  // Direct Computer Image File Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("L'image est trop volumineuse (maximum 5 Mo).");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (base64) {
          updatePersonalInfo("photoUrl", base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    updatePersonalInfo("photoUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleOptimizeBullet = async (expId: string, index: number, originalBullet: string, role: string) => {
    if (!originalBullet.trim()) return;
    setOptimizingIndex({ expId, index });
    try {
      const res = await fetch("/api/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "bullet",
          bullet: originalBullet,
          role: role || data.personalInfo.jobTitle,
          language: currentLang,
        }),
      });
      const result = await res.json();
      if (result.success && result.optimized) {
        const updatedExp = data.experiences.map((exp) => {
          if (exp.id === expId) {
            const newB = [...exp.bulletPoints];
            newB[index] = result.optimized;
            return { ...exp, bulletPoints: newB };
          }
          return exp;
        });
        onChange({ ...data, experiences: updatedExp });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOptimizingIndex(null);
    }
  };

  const addExperience = () => {
    const newExp: ExperienceItem = {
      id: `exp-${Date.now()}`,
      title: isRTL ? "وظيفة جديدة" : currentLang === "en" ? "New Position" : "Nouveau Poste",
      company: isRTL ? "اسم الشركة" : currentLang === "en" ? "Company Name" : "Entreprise",
      location: data.personalInfo.location || "Tunis, Tunisie",
      contractType: "CDI",
      startDate: "2024",
      endDate: isRTL ? "حتى الآن" : currentLang === "en" ? "Present" : "Présent",
      current: true,
      bulletPoints: [
        isRTL
          ? "تطوير وإنجاز حلول متقدمة ذات تأثير ملموس."
          : currentLang === "en"
          ? "Designed and delivered key solutions with measurable business impact."
          : "Conception et livraison de solutions avec impact mesurable.",
      ],
    };
    onChange({ ...data, experiences: [newExp, ...data.experiences] });
  };

  const removeExperience = (id: string) => {
    onChange({ ...data, experiences: data.experiences.filter((e) => e.id !== id) });
  };

  const updateExperience = (id: string, field: string, value: any) => {
    const updated = data.experiences.map((exp) => {
      if (exp.id === id) {
        return { ...exp, [field]: value };
      }
      return exp;
    });
    onChange({ ...data, experiences: updated });
  };

  const addBulletPoint = (expId: string) => {
    const updated = data.experiences.map((exp) => {
      if (exp.id === expId) {
        return {
          ...exp,
          bulletPoints: [
            ...exp.bulletPoints,
            isRTL
              ? "إنجاز مهام وتطوير مشاريع بأعلى معايير الجودة."
              : currentLang === "en"
              ? "Key achievement delivering measurable optimization."
              : "Nouvelle réalisation à fort impact.",
          ],
        };
      }
      return exp;
    });
    onChange({ ...data, experiences: updated });
  };

  const updateBulletPoint = (expId: string, index: number, value: string) => {
    const updated = data.experiences.map((exp) => {
      if (exp.id === expId) {
        const newB = [...exp.bulletPoints];
        newB[index] = value;
        return { ...exp, bulletPoints: newB };
      }
      return exp;
    });
    onChange({ ...data, experiences: updated });
  };

  const removeBulletPoint = (expId: string, index: number) => {
    const updated = data.experiences.map((exp) => {
      if (exp.id === expId) {
        return { ...exp, bulletPoints: exp.bulletPoints.filter((_, i) => i !== index) };
      }
      return exp;
    });
    onChange({ ...data, experiences: updated });
  };

  const addEducation = () => {
    const newEdu: EducationItem = {
      id: `edu-${Date.now()}`,
      degree: isRTL ? "شهادة جديدة" : currentLang === "en" ? "New Degree" : "Nouveau Diplôme",
      institution: isRTL ? "الجامعة / المعهد" : currentLang === "en" ? "University / Institute" : "Université / Institut",
      location: data.personalInfo.location || "Tunisie",
      startDate: "2020",
      endDate: "2023",
      current: false,
    };
    onChange({ ...data, education: [...data.education, newEdu] });
  };

  const removeEducation = (id: string) => {
    onChange({ ...data, education: data.education.filter((e) => e.id !== id) });
  };

  const updateEducation = (id: string, field: string, value: any) => {
    const updated = data.education.map((edu) => {
      if (edu.id === id) {
        return { ...edu, [field]: value };
      }
      return edu;
    });
    onChange({ ...data, education: updated });
  };

  const addSkill = () => {
    const newSkill: SkillItem = {
      id: `sk-${Date.now()}`,
      name: isRTL ? "مهارة جديدة" : currentLang === "en" ? "New Skill" : "Nouvelle Compétence",
      category: "Technical",
      level: 4,
    };
    onChange({ ...data, skills: [...data.skills, newSkill] });
  };

  const removeSkill = (id: string) => {
    onChange({ ...data, skills: data.skills.filter((s) => s.id !== id) });
  };

  const updateSkill = (id: string, value: string) => {
    const updated = data.skills.map((s) => (s.id === id ? { ...s, name: value } : s));
    onChange({ ...data, skills: updated });
  };

  const addLanguage = () => {
    const newLang: LanguageItem = {
      id: `lg-${Date.now()}`,
      name: isRTL ? "لغة جديدة" : currentLang === "en" ? "New Language" : "Nouvelle Langue",
      level: "Courant (C1/C2)" as LanguageLevel,
    };
    onChange({ ...data, languages: [...data.languages, newLang] });
  };

  const removeLanguage = (id: string) => {
    onChange({ ...data, languages: data.languages.filter((l) => l.id !== id) });
  };

  const updateLanguage = (id: string, field: string, value: any) => {
    const updated = data.languages.map((l) => (l.id === id ? { ...l, [field]: value } : l));
    onChange({ ...data, languages: updated });
  };

  const navItems = [
    { id: "personal", label: t.tabPersonal, alias: "Informations personnelles, coordonnées et photo de profil", icon: User },
    { id: "experience", label: t.tabExperience, alias: "Expériences professionnelles, postes occupés et réalisations", icon: Briefcase, count: data.experiences.length },
    { id: "education", label: t.tabEducation, alias: "Formations universitaires, diplômes et spécialités", icon: GraduationCap, count: data.education.length },
    { id: "skills", label: t.tabSkills, alias: "Compétences techniques, savoir-faire et outils maîtrisés", icon: Wrench, count: data.skills.length },
    { id: "languages", label: t.tabLanguages, alias: "Langues maîtrisées et niveaux de compétence", icon: Globe, count: data.languages.length },
    { id: "settings", label: t.tabSettings, alias: "Mise en page, choix du modèle de CV, polices et couleurs", icon: Palette },
  ];

  return (
    <div
      dir={isRTL ? "rtl" : "ltr"}
      className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden flex flex-col h-full text-slate-800 font-sans"
    >
      {/* Top AI Action Bar */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border-b border-slate-800 text-white flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold tracking-tight" title="Éditeur intelligent avec assistant IA et conformité ATS">
            {t.headerTitle}
          </h2>
          <p className="text-[11px] text-slate-300">{t.headerSubtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenATS}
            title="Scanner ATS IA : Analyser la compatibilité de votre CV avec une offre d'emploi"
            aria-label="Scanner ATS IA : Analyser la compatibilité de votre CV avec une offre d'emploi"
            className="flex items-center gap-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold px-3 py-1.5 rounded-xl transition"
          >
            <Target className="w-3.5 h-3.5" />
            <span>{t.scanATS}</span>
          </button>

          <button
            type="button"
            onClick={onOpenCoverLetter}
            title="Lettre IA : Rédiger une lettre de motivation professionnelle sur-mesure"
            aria-label="Lettre IA : Rédiger une lettre de motivation professionnelle sur-mesure"
            className="flex items-center gap-1.5 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold px-3 py-1.5 rounded-xl transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.coverLetterAI}</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs with Aliases */}
      <div className="flex border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1 overflow-x-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveSection(item.id)}
              title={item.alias}
              aria-label={item.alias}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                isActive
                  ? "bg-white text-slate-950 shadow-sm border border-slate-200 font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-rose-600" : "text-slate-400"}`} />
              <span>{item.label}</span>
              {item.count !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isActive ? "bg-rose-100 text-rose-700" : "bg-slate-200 text-slate-600"}`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Form Content Area */}
      <div className="p-4 sm:p-5 overflow-y-auto flex-grow space-y-5">
        {/* ==================== 1. PERSONAL INFO TAB ==================== */}
        {activeSection === "personal" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Direct Computer Photo Upload Zone */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80">
              <label className="block text-xs font-bold text-slate-900 mb-2">{t.photoLabel}</label>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
              />

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {data.personalInfo.photoUrl ? (
                  <div className="relative group">
                    <img
                      src={data.personalInfo.photoUrl}
                      alt="Aperçu"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-300 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="absolute -top-1.5 -right-1.5 p-1 bg-rose-600 text-white rounded-full shadow hover:bg-rose-700 transition"
                      title={t.removePhoto}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-2xl bg-slate-200/70 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[9px] font-semibold">{t.noPhoto}</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5 text-center sm:text-left">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 shadow-sm transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-rose-600" />
                      <span>{data.personalInfo.photoUrl ? t.changePhoto : t.uploadPhoto}</span>
                    </button>

                    {data.personalInfo.photoUrl && (
                      <button
                        type="button"
                        onClick={removePhoto}
                        className="px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition"
                      >
                        {t.removePhoto}
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {t.photoHint}
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Info Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.fullName}</label>
                <input
                  type="text"
                  value={data.personalInfo.fullName}
                  onChange={(e) => updatePersonalInfo("fullName", e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                  placeholder="Nom & Prénom"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.jobTitle}</label>
                <input
                  type="text"
                  value={data.personalInfo.jobTitle}
                  onChange={(e) => updatePersonalInfo("jobTitle", e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                  placeholder="Titre Professionnel (ex: Développeur Full-Stack / Ingénieur...)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.email}</label>
                <input
                  type="email"
                  value={data.personalInfo.email}
                  onChange={(e) => updatePersonalInfo("email", e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                  placeholder="Adresse Email (ex: contact@exemple.com)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.phone}</label>
                <input
                  type="text"
                  value={data.personalInfo.phone}
                  onChange={(e) => updatePersonalInfo("phone", e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                  placeholder="Numéro de Téléphone (ex: +216 98 123 456)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.location}</label>
                <input
                  type="text"
                  value={data.personalInfo.location}
                  onChange={(e) => updatePersonalInfo("location", e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                  placeholder="Ville & Pays (ex: Tunis, Tunisie)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.linkedin}</label>
                <input
                  type="text"
                  value={data.personalInfo.linkedin || ""}
                  onChange={(e) => updatePersonalInfo("linkedin", e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                  placeholder="Profil LinkedIn (ex: linkedin.com/in/...)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.github}</label>
                <input
                  type="text"
                  value={data.personalInfo.github || ""}
                  onChange={(e) => updatePersonalInfo("github", e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                  placeholder="GitHub / Portfolio (ex: github.com/...)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">{t.maritalLicense}</label>
                <input
                  type="text"
                  value={data.personalInfo.maritalStatus || ""}
                  onChange={(e) => updatePersonalInfo("maritalStatus", e.target.value)}
                  className="w-full text-xs px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
                  placeholder="État Civil & Permis (ex: Célibataire • Permis B)"
                />
              </div>
            </div>

            {/* Professional Summary */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">{t.summaryLabel}</label>
              <textarea
                rows={3}
                value={data.personalInfo.summary}
                onChange={(e) => updatePersonalInfo("summary", e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition leading-relaxed"
                placeholder={t.summaryPlaceholder}
              />
            </div>
          </div>
        )}

        {/* ==================== 2. EXPERIENCES TAB ==================== */}
        {activeSection === "experience" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">{t.expSectionTitle}</span>
              <button
                type="button"
                onClick={addExperience}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addPosition}</span>
              </button>
            </div>

            {data.experiences.map((exp, idx) => (
              <div key={exp.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-xs text-slate-900">{t.positionNum} #{idx + 1} : {exp.title || "..."}</span>
                  <button
                    type="button"
                    onClick={() => removeExperience(exp.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t.jobTitle}</label>
                    <input
                      type="text"
                      value={exp.title}
                      onChange={(e) => updateExperience(exp.id, "title", e.target.value)}
                      placeholder="Intitulé du Poste (ex: Développeur Web, Chef de Projet...)"
                      className="w-full text-xs px-3 py-2 rounded-xl border bg-white focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t.companyLabel}</label>
                    <input
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, "company", e.target.value)}
                      placeholder="Entreprise ou Organisation (ex: Vermeg, Telnet, Ooredoo...)"
                      className="w-full text-xs px-3 py-2 rounded-xl border bg-white focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t.location}</label>
                    <input
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateExperience(exp.id, "location", e.target.value)}
                      placeholder="Ville & Pays (ex: Tunis, Tunisie)"
                      className="w-full text-xs px-3 py-2 rounded-xl border bg-white focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-rose-500" />
                        <span>{t.periodLabel} (Début — Fin)</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200/80 px-2 py-0.5 rounded-lg border border-slate-200 transition">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) => {
                            const isCurr = e.target.checked;
                            const updated = data.experiences.map((item) => {
                              if (item.id === exp.id) {
                                return {
                                  ...item,
                                  current: isCurr,
                                  endDate: isCurr ? (isRTL ? "حتى الآن" : currentLang === "en" ? "Present" : "Présent") : "",
                                };
                              }
                              return item;
                            });
                            onChange({ ...data, experiences: updated });
                          }}
                          className="w-3.5 h-3.5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                        <span className="text-[10px] font-bold text-slate-700">
                          {isRTL ? "حتى الآن (المنصب الحالي)" : "Poste actuel (En cours)"}
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block text-[10px] text-slate-500 mb-0.5">Date de début :</span>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={exp.startDate}
                            onChange={(e) => updateExperience(exp.id, "startDate", e.target.value)}
                            placeholder="Ex: 2022 ou 01/2022"
                            className="w-full text-xs pl-7 pr-2 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                          />
                          <input
                            type="month"
                            onChange={(e) => {
                              if (e.target.value) {
                                const [year, month] = e.target.value.split("-");
                                updateExperience(exp.id, "startDate", `${month}/${year}`);
                              }
                            }}
                            className="absolute left-2 w-4 h-4 opacity-70 cursor-pointer border-0 p-0 bg-transparent"
                            title="Choisir le mois / année"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="block text-[10px] text-slate-500 mb-0.5">Date de fin :</span>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={exp.current ? (isRTL ? "حتى الآن" : currentLang === "en" ? "Present" : "Présent") : exp.endDate}
                            onChange={(e) => updateExperience(exp.id, "endDate", e.target.value)}
                            disabled={exp.current}
                            placeholder="Ex: 2024 ou Présent"
                            className={`w-full text-xs pl-7 pr-2 py-2 rounded-xl border transition ${
                              exp.current
                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed font-semibold"
                                : "border-slate-200 bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                            }`}
                          />
                          {!exp.current && (
                            <input
                              type="month"
                              onChange={(e) => {
                                if (e.target.value) {
                                  const [year, month] = e.target.value.split("-");
                                  updateExperience(exp.id, "endDate", `${month}/${year}`);
                                }
                              }}
                              className="absolute left-2 w-4 h-4 opacity-70 cursor-pointer border-0 p-0 bg-transparent"
                              title="Choisir le mois / année"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bullet Points with Live Gemini Optimization */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-semibold text-slate-700">{t.bulletPointsLabel}</label>
                    <button
                      type="button"
                      onClick={() => addBulletPoint(exp.id)}
                      className="text-[11px] text-rose-600 font-bold hover:underline"
                    >
                      {t.addBullet}
                    </button>
                  </div>

                  <div className="space-y-2">
                    {exp.bulletPoints.map((bp, bIdx) => (
                      <div key={bIdx} className="flex items-start gap-1.5">
                        <textarea
                          rows={2}
                          value={bp}
                          onChange={(e) => updateBulletPoint(exp.id, bIdx, e.target.value)}
                          className="w-full text-xs p-2 rounded-xl border bg-white focus:ring-2 focus:ring-rose-500/20"
                        />
                        <button
                          type="button"
                          onClick={() => handleOptimizeBullet(exp.id, bIdx, bp, exp.title)}
                          disabled={optimizingIndex?.expId === exp.id && optimizingIndex?.index === bIdx}
                          className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition flex-shrink-0"
                          title={t.optimizeAI}
                        >
                          {optimizingIndex?.expId === exp.id && optimizingIndex?.index === bIdx ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBulletPoint(exp.id, bIdx)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition flex-shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================== 3. EDUCATION TAB ==================== */}
        {activeSection === "education" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">{t.eduSectionTitle}</span>
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addDegree}</span>
              </button>
            </div>

            {data.education.map((edu, idx) => (
              <div key={edu.id} className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <span className="font-bold text-xs text-slate-900">{t.degreeLabel} #{idx + 1} : {edu.degree || "..."}</span>
                  <button
                    type="button"
                    onClick={() => removeEducation(edu.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t.degreeLabel}</label>
                    <input
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(edu.id, "degree", e.target.value)}
                      placeholder="Diplôme ou Spécialité (ex: Mastère en Informatique, Licence...)"
                      className="w-full text-xs px-3 py-2 rounded-xl border bg-white focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t.institutionLabel}</label>
                    <input
                      type="text"
                      value={edu.institution}
                      onChange={(e) => updateEducation(edu.id, "institution", e.target.value)}
                      placeholder="Établissement / Université (ex: INSAT, ESPRIT, IHEC...)"
                      className="w-full text-xs px-3 py-2 rounded-xl border bg-white focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">{t.honorsLabel}</label>
                    <input
                      type="text"
                      value={edu.honors || ""}
                      onChange={(e) => updateEducation(edu.id, "honors", e.target.value)}
                      placeholder="Mention ou Spécialité (ex: Mention Très Bien, Major)"
                      className="w-full text-xs px-3 py-2 rounded-xl border bg-white focus:ring-2 focus:ring-rose-500/20"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-rose-500" />
                        <span>{t.yearsLabel} (Début — Fin)</span>
                      </label>
                      <label className="inline-flex items-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200/80 px-2 py-0.5 rounded-lg border border-slate-200 transition">
                        <input
                          type="checkbox"
                          checked={edu.current}
                          onChange={(e) => {
                            const isCurr = e.target.checked;
                            const updated = data.education.map((item) => {
                              if (item.id === edu.id) {
                                return {
                                  ...item,
                                  current: isCurr,
                                  endDate: isCurr ? (isRTL ? "حتى الآن" : currentLang === "en" ? "Present" : "Présent") : "",
                                };
                              }
                              return item;
                            });
                            onChange({ ...data, education: updated });
                          }}
                          className="w-3.5 h-3.5 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                        <span className="text-[10px] font-bold text-slate-700">
                          {isRTL ? "حتى الآن (قيد الدراسة)" : "Formation en cours"}
                        </span>
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="block text-[10px] text-slate-500 mb-0.5">Date de début :</span>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(edu.id, "startDate", e.target.value)}
                            placeholder="Ex: 2020 ou 09/2020"
                            className="w-full text-xs pl-7 pr-2 py-2 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                          />
                          <input
                            type="month"
                            onChange={(e) => {
                              if (e.target.value) {
                                const [year, month] = e.target.value.split("-");
                                updateEducation(edu.id, "startDate", `${month}/${year}`);
                              }
                            }}
                            className="absolute left-2 w-4 h-4 opacity-70 cursor-pointer border-0 p-0 bg-transparent"
                            title="Choisir le mois / année"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="block text-[10px] text-slate-500 mb-0.5">Date de fin :</span>
                        <div className="relative flex items-center">
                          <input
                            type="text"
                            value={edu.current ? (isRTL ? "حتى الآن" : currentLang === "en" ? "Present" : "Présent") : edu.endDate}
                            onChange={(e) => updateEducation(edu.id, "endDate", e.target.value)}
                            disabled={edu.current}
                            placeholder="Ex: 2023 ou Présent"
                            className={`w-full text-xs pl-7 pr-2 py-2 rounded-xl border transition ${
                              edu.current
                                ? "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed font-semibold"
                                : "border-slate-200 bg-white focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                            }`}
                          />
                          {!edu.current && (
                            <input
                              type="month"
                              onChange={(e) => {
                                if (e.target.value) {
                                  const [year, month] = e.target.value.split("-");
                                  updateEducation(edu.id, "endDate", `${month}/${year}`);
                                }
                              }}
                              className="absolute left-2 w-4 h-4 opacity-70 cursor-pointer border-0 p-0 bg-transparent"
                              title="Choisir le mois / année"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ==================== 4. SKILLS TAB ==================== */}
        {activeSection === "skills" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">{t.skillsSectionTitle} ({data.skills.length}) :</span>
              <button
                type="button"
                onClick={addSkill}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addSkill}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {data.skills.map((skill) => (
                <div key={skill.id} className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                  <input
                    type="text"
                    value={skill.name}
                    onChange={(e) => updateSkill(skill.id, e.target.value)}
                    placeholder="Compétence (ex: React, Python, Gestion Agile...)"
                    className="w-full text-xs font-semibold text-slate-800 bg-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeSkill(skill.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 5. LANGUAGES TAB ==================== */}
        {activeSection === "languages" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">{t.langSectionTitle}</span>
              <button
                type="button"
                onClick={addLanguage}
                className="flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-xl border border-rose-200 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addLanguage}</span>
              </button>
            </div>

            <div className="space-y-2">
              {data.languages.map((lang) => (
                <div key={lang.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white">
                  <input
                    type="text"
                    value={lang.name}
                    onChange={(e) => updateLanguage(lang.id, "name", e.target.value)}
                    placeholder="Langue (ex: Français, Anglais, Arabe...)"
                    className="w-1/2 text-xs font-semibold px-2.5 py-1.5 border rounded-lg"
                  />
                  <input
                    type="text"
                    value={lang.level}
                    onChange={(e) => updateLanguage(lang.id, "level", e.target.value)}
                    placeholder="Niveau (ex: Langue maternelle, Courant, B2, C1...)"
                    className="w-1/2 text-xs px-2.5 py-1.5 border rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeLanguage(lang.id)}
                    className="text-slate-400 hover:text-rose-600 p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================== 6. SETTINGS & STYLE TAB ==================== */}
        {activeSection === "settings" && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Template Selector Section */}
            <div className="space-y-4">
              {/* Group 1: Modèles Pro ATS (Recommandé) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      ⭐ Modèles Pro ATS (Recommandé)
                    </span>
                    <span className="text-[10px] bg-amber-500/20 text-amber-800 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                      Recommandé ATS
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* 1. Canadien */}
                  <button
                    type="button"
                    onClick={() => updateSettings("template", "canadian")}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      data.settings.template === "canadian"
                        ? "border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">🍁</span>
                        {data.settings.template === "canadian" && (
                          <span className="text-[9px] bg-emerald-600 text-white font-bold px-1.5 py-0.2 rounded-full">Actif</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900">Canadien ATS</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        1 colonne sobre, 100% lisibilité robot ATS & international
                      </div>
                    </div>
                  </button>

                  {/* 2. Europass */}
                  <button
                    type="button"
                    onClick={() => updateSettings("template", "europass")}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      data.settings.template === "europass"
                        ? "border-blue-600 bg-blue-50/50 ring-2 ring-blue-500 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">🇪🇺</span>
                        {data.settings.template === "europass" && (
                          <span className="text-[9px] bg-blue-600 text-white font-bold px-1.5 py-0.2 rounded-full">Actif</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900">Europass Pro ATS</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Conforme standards Union Européenne & grille CECRL
                      </div>
                    </div>
                  </button>

                  {/* 3. Tunisien */}
                  <button
                    type="button"
                    onClick={() => updateSettings("template", "tunisian")}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      data.settings.template === "tunisian" || !data.settings.template
                        ? "border-rose-600 bg-rose-50/50 ring-2 ring-rose-500 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">🇹🇳</span>
                        {(data.settings.template === "tunisian" || !data.settings.template) && (
                          <span className="text-[9px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded-full">Actif</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900">Tunisien Pro ATS</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Avec photo, permis, cursus national & coordonnées
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Group 2: Autres Modèles */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-wider">
                      ✨ Autres Modèles
                    </span>
                    <span className="text-[10px] bg-indigo-500/20 text-indigo-800 font-bold px-2 py-0.5 rounded-full border border-indigo-500/30">
                      Moderne & Design
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* 4. Modern Tech */}
                  <button
                    type="button"
                    onClick={() => updateSettings("template", "modern_tech")}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      data.settings.template === "modern_tech"
                        ? "border-sky-600 bg-sky-50/50 ring-2 ring-sky-500 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">🚀</span>
                        {data.settings.template === "modern_tech" && (
                          <span className="text-[9px] bg-sky-600 text-white font-bold px-1.5 py-0.2 rounded-full">Actif</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900">Moderne Tech</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Silicon Valley, capsules de compétences & timeline
                      </div>
                    </div>
                  </button>

                  {/* 5. Executive Luxe */}
                  <button
                    type="button"
                    onClick={() => updateSettings("template", "executive_luxe")}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      data.settings.template === "executive_luxe"
                        ? "border-slate-800 bg-slate-100 ring-2 ring-slate-800 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">💎</span>
                        {data.settings.template === "executive_luxe" && (
                          <span className="text-[9px] bg-slate-900 text-white font-bold px-1.5 py-0.2 rounded-full">Actif</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900">Executive Luxe</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Typographie raffinée pour cadres, directeurs & consultants
                      </div>
                    </div>
                  </button>

                  {/* 6. Creative Sidebar */}
                  <button
                    type="button"
                    onClick={() => updateSettings("template", "creative_sidebar")}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      data.settings.template === "creative_sidebar"
                        ? "border-rose-600 bg-rose-50/50 ring-2 ring-rose-500 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">🎨</span>
                        {data.settings.template === "creative_sidebar" && (
                          <span className="text-[9px] bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded-full">Actif</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900">Créatif Sidebar</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Volet latéral sombre contrasté & photo cerclée
                      </div>
                    </div>
                  </button>

                  {/* 7. Compact Metro */}
                  <button
                    type="button"
                    onClick={() => updateSettings("template", "compact_metro")}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      data.settings.template === "compact_metro"
                        ? "border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">🏙️</span>
                        {data.settings.template === "compact_metro" && (
                          <span className="text-[9px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded-full">Actif</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900">Compact Metro</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Grille suisse structurée, haute densité d'informations
                      </div>
                    </div>
                  </button>

                  {/* 8. Gradient Header */}
                  <button
                    type="button"
                    onClick={() => updateSettings("template", "gradient_header")}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      data.settings.template === "gradient_header"
                        ? "border-pink-600 bg-pink-50/50 ring-2 ring-pink-500 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">🌅</span>
                        {data.settings.template === "gradient_header" && (
                          <span className="text-[9px] bg-pink-600 text-white font-bold px-1.5 py-0.2 rounded-full">Actif</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900">Gradient Header</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Bandeau supérieur coloré vibrant & mise en page fluide
                      </div>
                    </div>
                  </button>

                  {/* 9. Minimalist Clean */}
                  <button
                    type="button"
                    onClick={() => updateSettings("template", "minimalist_clean")}
                    className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                      data.settings.template === "minimalist_clean"
                        ? "border-slate-900 bg-slate-50 ring-2 ring-slate-900 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-base">📄</span>
                        {data.settings.template === "minimalist_clean" && (
                          <span className="text-[9px] bg-slate-900 text-white font-bold px-1.5 py-0.2 rounded-full">Actif</span>
                        )}
                      </div>
                      <div className="text-xs font-bold text-slate-900">Minimaliste Clean</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-snug">
                        Noir & blanc monochrome ultra-épuré et contemporain
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            {/* Language Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.languageSelectorLabel}</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => updateSettings("language", "fr")}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                    data.settings.language === "fr" || !data.settings.language
                      ? "border-rose-600 bg-rose-50 text-rose-700 ring-1 ring-rose-500 font-bold"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>🇫🇷 Français</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateSettings("language", "en")}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                    data.settings.language === "en"
                      ? "border-rose-600 bg-rose-50 text-rose-700 ring-1 ring-rose-500 font-bold"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>🇬🇧 English</span>
                </button>

                <button
                  type="button"
                  onClick={() => updateSettings("language", "ar")}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition flex items-center justify-center gap-1.5 ${
                    data.settings.language === "ar"
                      ? "border-rose-600 bg-rose-50 text-rose-700 ring-1 ring-rose-500 font-bold"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span>🇸🇦 العربية (RTL)</span>
                </button>
              </div>
            </div>

            {/* Font Size Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">{t.fontSizeLabel}</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => updateSettings("fontSize", "sm")}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                    data.settings.fontSize === "sm"
                      ? "border-rose-600 bg-rose-50 text-rose-700 ring-1 ring-rose-500"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="font-bold">{t.compactFont}</div>
                  <div className="text-[10px] text-slate-500">{t.compactFontDesc}</div>
                </button>

                <button
                  type="button"
                  onClick={() => updateSettings("fontSize", "base")}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                    data.settings.fontSize === "base" || !data.settings.fontSize
                      ? "border-rose-600 bg-rose-50 text-rose-700 ring-1 ring-rose-500"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="font-bold">{t.standardFont}</div>
                  <div className="text-[10px] text-slate-500">{t.standardFontDesc}</div>
                </button>

                <button
                  type="button"
                  onClick={() => updateSettings("fontSize", "lg")}
                  className={`py-2 px-3 text-xs font-semibold rounded-xl border transition ${
                    data.settings.fontSize === "lg"
                      ? "border-rose-600 bg-rose-50 text-rose-700 ring-1 ring-rose-500"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="font-bold">{t.spaciousFont}</div>
                  <div className="text-[10px] text-slate-500">{t.spaciousFontDesc}</div>
                </button>
              </div>
            </div>

            {/* Accent Color Palette */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">{t.accentColorLabel}</label>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
                  <span>Couleur active :</span>
                  <span 
                    className="inline-block w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs" 
                    style={{ backgroundColor: data.settings.primaryColor || "#e11d48" }} 
                  />
                  <span className="font-mono text-[10px] text-slate-600">{data.settings.primaryColor || "#e11d48"}</span>
                </div>
              </div>

              {/* Curated Colors Grid */}
              <div className="grid grid-cols-7 sm:grid-cols-8 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                {[
                  { name: "Rose Royal", hex: "#e11d48" },
                  { name: "Rouge Crimson", hex: "#dc2626" },
                  { name: "Corail Énergique", hex: "#ea580c" },
                  { name: "Ambre Doré", hex: "#d97706" },
                  { name: "Vert Émeraude", hex: "#047857" },
                  { name: "Teal Océan", hex: "#0d9488" },
                  { name: "Cyan Tech", hex: "#0891b2" },
                  { name: "Bleu Sky", hex: "#0284c7" },
                  { name: "Bleu Navy", hex: "#1e3a8a" },
                  { name: "Indigo Moderne", hex: "#4f46e5" },
                  { name: "Violet Impérial", hex: "#7c3aed" },
                  { name: "Fuchsia Vibrant", hex: "#c026d3" },
                  { name: "Bronze Luxe", hex: "#78350f" },
                  { name: "Slate Anthracite", hex: "#334155" },
                  { name: "Noir Profond", hex: "#09090b" },
                ].map((c) => (
                  <button
                    key={c.hex}
                    type="button"
                    onClick={() => updateSettings("primaryColor", c.hex)}
                    className="w-7 h-7 rounded-xl border-2 transition transform hover:scale-110 flex items-center justify-center relative shadow-xs"
                    style={{
                      backgroundColor: c.hex,
                      borderColor: data.settings.primaryColor === c.hex ? "#ffffff" : "transparent",
                      boxShadow: data.settings.primaryColor === c.hex ? `0 0 0 2px ${c.hex}` : "none",
                    }}
                    title={c.name}
                  >
                    {data.settings.primaryColor === c.hex && (
                      <span className="text-[10px] text-white font-black drop-shadow">✓</span>
                    )}
                  </button>
                ))}

                {/* Custom Color Input Picker Button */}
                <label 
                  className="w-7 h-7 rounded-xl border-2 border-dashed border-slate-300 hover:border-slate-500 bg-white flex items-center justify-center cursor-pointer transition relative group"
                  title="Choisir une couleur sur mesure"
                >
                  <span className="text-xs">🎨</span>
                  <input
                    type="color"
                    value={data.settings.primaryColor || "#e11d48"}
                    onChange={(e) => updateSettings("primaryColor", e.target.value)}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>

            {/* Photo Visibility Toggle */}
            <div className="pt-2 border-t flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-900">{t.showPhotoLabel}</div>
                <div className="text-[11px] text-slate-500">{t.showPhotoDesc}</div>
              </div>
              <input
                type="checkbox"
                checked={data.settings.showPhoto}
                onChange={(e) => updateSettings("showPhoto", e.target.checked)}
                className="w-4 h-4 text-rose-600 rounded"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
