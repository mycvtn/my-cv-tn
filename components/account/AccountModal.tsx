"use client";

import React, { useState } from "react";
import { UserAccount } from "@/types/auth";
import { updateUserProfile, logoutUser } from "@/lib/auth/authStore";
import { 
  X, User, Mail, Lock, Ticket, Shield, LogOut, 
  Check, Save, Sparkles, KeyRound, Smartphone, Calendar, Award
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onUserUpdated: (user: UserAccount | null) => void;
  onOpenPricing: () => void;
}

export const AccountModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onUserUpdated,
  onOpenPricing,
}) => {
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "credits">("profile");
  const [name, setName] = useState<string>(currentUser?.name || "");
  const [email, setEmail] = useState<string>(currentUser?.email || "");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [savedSuccess, setSavedSuccess] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  if (!isOpen || !currentUser) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSavedSuccess("");

    if (!name.trim() || !email.trim()) {
      setErrorMsg("Le nom et l'adresse email sont obligatoires.");
      return;
    }

    const updated = updateUserProfile(currentUser.id, {
      name: name.trim(),
      email: email.trim(),
    });

    if (updated) {
      onUserUpdated(updated);
      setSavedSuccess("Profil mis à jour avec succès !");
      setTimeout(() => setSavedSuccess(""), 2500);
    }
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSavedSuccess("");

    if (newPassword.length < 6) {
      setErrorMsg("Le nouveau mot de passe doit comporter au moins 6 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    const updated = updateUserProfile(currentUser.id, {
      password: newPassword,
    });

    if (updated) {
      onUserUpdated(updated);
      setNewPassword("");
      setConfirmPassword("");
      setCurrentPassword("");
      setSavedSuccess("Mot de passe modifié avec succès !");
      setTimeout(() => setSavedSuccess(""), 2500);
    }
  };

  const handleLogout = () => {
    logoutUser();
    onUserUpdated(null);
    onClose();
    window.location.href = "/login";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl text-slate-100 flex flex-col max-h-[90vh]">
        {/* Header Hero */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-b border-slate-800 flex items-center justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-rose-600/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-rose-600/30">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>{currentUser.name}</span>
                <span className="text-[10px] bg-rose-500/20 text-rose-300 font-bold px-2 py-0.5 rounded-full border border-rose-500/30 uppercase">
                  {currentUser.role}
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 gap-6 text-xs font-bold">
          <button
            onClick={() => { setActiveTab("profile"); setErrorMsg(""); setSavedSuccess(""); }}
            className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
              activeTab === "profile" ? "border-rose-500 text-rose-400 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Mon Profil</span>
          </button>

          <button
            onClick={() => { setActiveTab("security"); setErrorMsg(""); setSavedSuccess(""); }}
            className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
              activeTab === "security" ? "border-rose-500 text-rose-400 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Sécurité & Mot de passe</span>
          </button>

          <button
            onClick={() => { setActiveTab("credits"); setErrorMsg(""); setSavedSuccess(""); }}
            className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
              activeTab === "credits" ? "border-rose-500 text-rose-400 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-amber-400" />
            <span>Solde & Crédits IA</span>
          </button>
        </div>

        {/* Notification Alert Messages */}
        {errorMsg && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-xs text-rose-300 flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {savedSuccess && (
          <div className="mx-6 mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{savedSuccess}</span>
          </div>
        )}

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Nom et Prénom</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
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
                    required
                    className="w-full text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/25 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Enregistrer les modifications</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: SECURITY */}
          {activeTab === "security" && (
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 6 caractères"
                    required
                    className="w-full text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Confirmer le nouveau mot de passe</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    required
                    className="w-full text-xs bg-slate-800/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-rose-400" />
                  <span>Mettre à jour le mot de passe</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CREDITS */}
          {activeTab === "credits" && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-800/60 border border-amber-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl">
                    <Ticket className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Votre solde actuel :</div>
                    <div className="text-2xl font-black text-amber-400">
                      {currentUser.credits} <span className="text-xs text-slate-400 font-normal">crédits IA</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenPricing();
                  }}
                  className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition"
                >
                  + Recharger
                </button>
              </div>

              <div className="text-xs text-slate-400 space-y-1.5 pt-2">
                <div className="font-bold text-slate-300">À quoi servent vos crédits ?</div>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>Téléchargement de CVs en PDF haute définition vectoriel.</li>
                  <li>Scan et optimisation de Score ATS par rapport aux offres d'emploi.</li>
                  <li>Génération instantanée de lettres de motivation ultra-personnalisées.</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Compte actif depuis le {new Date(currentUser.createdAt).toLocaleDateString()}
          </span>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/30 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
    </div>
  );
};
