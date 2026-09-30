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
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "subscription">("profile");
  const [name, setName] = useState<string>(currentUser?.name || "");
  const [email, setEmail] = useState<string>(currentUser?.email || "");
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [savedSuccess, setSavedSuccess] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  if (!isOpen || !currentUser) return null;

  const isPro = currentUser.subscriptionTier === "semi_annual" || currentUser.subscriptionTier === "annual";
  const isExpiringSoon = isPro && currentUser.subscriptionExpiresAt && (() => {
    const expDate = new Date(currentUser.subscriptionExpiresAt).getTime();
    const now = Date.now();
    const daysLeft = Math.ceil((expDate - now) / (1000 * 60 * 60 * 24));
    return daysLeft > 0 && daysLeft <= 7;
  })();

  const isExpired = isPro && currentUser.subscriptionExpiresAt && (() => {
    return new Date(currentUser.subscriptionExpiresAt).getTime() < Date.now();
  })();

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="win11-acrylic-card win11-window-shadow border border-white/20 rounded-3xl w-full max-w-xl overflow-hidden text-slate-100 flex flex-col max-h-[90vh] relative">
        {/* Top Window Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-indigo-500 opacity-90" />

        {/* Header Hero */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between relative overflow-hidden">
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
                {isPro && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">
                    {currentUser.subscriptionTier === "annual" ? "👑 Pass Annuel" : "✨ Pass Semestriel"}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">{currentUser.email}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-white/10 transition relative z-10 win11-btn-interactive"
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
            onClick={() => { setActiveTab("subscription"); setErrorMsg(""); setSavedSuccess(""); }}
            className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
              activeTab === "subscription" ? "border-rose-500 text-rose-400 font-extrabold" : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Mon Abonnement Pro</span>
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

          {/* TAB 3: SUBSCRIPTION */}
          {activeTab === "subscription" && (
            <div className="space-y-4">
              {/* Alert if expiring soon or expired */}
              {isExpiringSoon && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/40 rounded-2xl text-xs text-amber-300 flex items-start gap-2.5">
                  <span className="text-base">⚠️</span>
                  <div>
                    <div className="font-bold">Votre abonnement expire bientôt !</div>
                    <div className="text-[11px] text-amber-400/90 mt-0.5">
                      Il vous reste moins de 7 jours de validité (expiration le {currentUser.subscriptionExpiresAt ? new Date(currentUser.subscriptionExpiresAt).toLocaleDateString() : ""}). Renouvelez votre Pass pour ne pas perdre vos avantages Pro.
                    </div>
                  </div>
                </div>
              )}

              {isExpired && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/40 rounded-2xl text-xs text-rose-300 flex items-start gap-2.5">
                  <span className="text-base">⏳</span>
                  <div>
                    <div className="font-bold">Votre abonnement a expiré</div>
                    <div className="text-[11px] text-rose-400/90 mt-0.5">
                      Votre période de validité est terminée. Choisissez un nouveau Pass pour débloquer les téléchargements de CV Pro en illimité (3/mois).
                    </div>
                  </div>
                </div>
              )}

              <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-slate-900 border border-indigo-800/40 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 bg-indigo-500/20 border border-indigo-500/40 rounded-2xl">
                      <Sparkles className="w-6 h-6 text-amber-400" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Formule active :</div>
                      <div className="text-lg font-black text-white flex items-center gap-2">
                        {currentUser.subscriptionTier === "annual" ? (
                          <span className="text-amber-400">👑 Pass Annuel (12 Mois)</span>
                        ) : currentUser.subscriptionTier === "semi_annual" ? (
                          <span className="text-rose-400">✨ Pass Semestriel (6 Mois)</span>
                        ) : (
                          <span className="text-slate-300">Candidat Gratuit</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPricing();
                    }}
                    className="px-4 py-2.5 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs rounded-xl shadow-lg transition shadow-rose-600/20 cursor-pointer"
                  >
                    {isPro ? "Changer d'offre" : "Devenir Pro"}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 text-xs">
                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                    <div className="text-slate-400 text-[11px]">Téléchargements CV Pro :</div>
                    <div className="text-sm font-black text-white mt-0.5">
                      {isPro ? "Illimités ✨" : "Filigrane Gratuit"}
                    </div>
                  </div>

                  <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                    <div className="text-slate-400 text-[11px]">Date de fin de validité :</div>
                    <div className="text-sm font-black text-white mt-0.5">
                      {currentUser.subscriptionExpiresAt 
                        ? new Date(currentUser.subscriptionExpiresAt).toLocaleDateString()
                        : "Non renseignée"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1.5 pt-2">
                <div className="font-bold text-slate-300">Avantages inclus dans votre abonnement :</div>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>Téléchargement de CVs Pro haute définition vectoriels en illimité (sans filigrane).</li>
                  <li>Scan et optimisation IA Score ATS par rapport aux offres d'emploi.</li>
                  <li>Génération instantanée de lettres de motivation ultra-personnalisées.</li>
                  <li>Modèles de CV exclusifs & support prioritaire 7j/7.</li>
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
