"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, Sparkles, FileText, Bot, CreditCard, Shield, 
  CheckCircle2, ArrowRight, ArrowLeft, Upload, Clock, AlertCircle, Copy, Check, Star, Zap, Crown
} from "lucide-react";
import { getCurrentUser, fetchServerUser, getUserSubscriptionInfo } from "@/lib/auth/authStore";
import { getPaymentSettings, fetchServerPaymentSettings, createPaymentRequest, PaymentMethod, PaymentSettings, SubscriptionPlanType } from "@/lib/payments/paymentStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentBalance?: number;
  onSelectPlan?: (credits: number, tndAmount: number) => void;
}

export const CreditCalculatorModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  onSelectPlan
}) => {
  const [step, setStep] = useState<"plans" | "payment_proof" | "success">("plans");
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlanType>("annual");
  const [selectedMethod, setSelectedMethod] = useState<string>("flouci");
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [receiptImage, setReceiptImage] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentUser = typeof window !== "undefined" ? getCurrentUser() : null;
  const subInfo = getUserSubscriptionInfo(currentUser);

  const syncSettings = async () => {
    // 1. Instant local read
    const local = getPaymentSettings();
    setPaymentSettings(local);

    // 2. Fresh server fetch
    try {
      const fresh = await fetchServerPaymentSettings();
      if (fresh) {
        setPaymentSettings(fresh);
      }
    } catch (e) {}
  };

  useEffect(() => {
    syncSettings();

    const handleSettingsUpdated = (e: any) => {
      if (e.detail) {
        setPaymentSettings(e.detail);
      }
    };

    const handleStorage = () => {
      const local = getPaymentSettings();
      setPaymentSettings(local);
    };

    window.addEventListener("payment_settings_updated", handleSettingsUpdated);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("payment_settings_updated", handleSettingsUpdated);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      syncSettings();
      setStep("plans");
      setReceiptImage("");

      const current = paymentSettings || getPaymentSettings();
      if (current.flouciEnabled !== false) {
        setSelectedMethod("flouci");
      } else if (current.d17Enabled !== false) {
        setSelectedMethod("d17");
      } else if (current.customMethods && current.customMethods.length > 0) {
        const firstActive = current.customMethods.find((m) => m.enabled);
        if (firstActive) setSelectedMethod(firstActive.id);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const semiAnnualPrice = paymentSettings?.semiAnnualPriceTND ?? 29.0;
  const annualPrice = paymentSettings?.annualPriceTND ?? 49.0;
  const monthlyQuota = paymentSettings?.monthlyQuota ?? 3;

  const currentPrice = selectedPlan === "annual" ? annualPrice : semiAnnualPrice;
  const currentPriceFormatted = currentPrice.toFixed(3);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La capture d'écran ne doit pas dépasser 5 Mo.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setReceiptImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitProof = async () => {
    if (!receiptImage) {
      alert("Veuillez téléverser la capture d'écran ou le reçu de votre virement.");
      return;
    }

    const user = getCurrentUser();
    const userId = user ? user.id : `guest-${Date.now()}`;
    const userName = user ? user.name : "Utilisateur";
    const userEmail = user ? user.email : "user@example.com";

    setIsSubmitting(true);

    try {
      await createPaymentRequest(
        userId,
        userName,
        userEmail,
        selectedMethod,
        selectedPlan === "annual" ? 36 : 18,
        Number(currentPrice),
        receiptImage,
        selectedPlan
      );

      setStep("success");
      if (onSelectPlan) {
        onSelectPlan(selectedPlan === "annual" ? 36 : 18, Number(currentPrice));
      }
    } catch (e) {
      alert("Erreur lors de l'envoi de la demande.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Compile active methods list
  const activeCustomMethods = (paymentSettings?.customMethods || []).filter((m) => m.enabled !== false);
  const isFlouciActive = paymentSettings?.flouciEnabled !== false;
  const isD17Active = paymentSettings?.d17Enabled !== false;

  const getSelectedMethodDetails = () => {
    if (selectedMethod === "d17") {
      return {
        title: "Paiement via D17 (La Poste Tunisienne)",
        badge: "D17 Mobile",
        recipientName: paymentSettings?.d17AccountHolder || "my-cv.tn Administration",
        accountNumber: paymentSettings?.d17PhoneNumber || "98 123 456",
        accountLabel: "Numéro de téléphone D17",
        instructions: paymentSettings?.d17Instructions || "Transférez le montant exact via D17 puis téléversez la capture du reçu.",
      };
    }
    if (selectedMethod === "flouci") {
      return {
        title: "Paiement via Application Flouci",
        badge: "Flouci App",
        recipientName: paymentSettings?.flouciAccountHolder || "MY-CV TUNISIE",
        accountNumber: paymentSettings?.flouciAccount || "flouci.me/mycv_tn",
        accountLabel: "Compte / Tag Flouci",
        instructions: paymentSettings?.flouciInstructions || "Envoyez le montant via Flouci puis joignez la capture d'écran de confirmation.",
      };
    }
    const custom = activeCustomMethods.find((m) => m.id === selectedMethod);
    if (custom) {
      return {
        title: custom.name,
        badge: custom.name,
        recipientName: custom.accountHolder,
        accountNumber: custom.accountNumber,
        accountLabel: "Coordonnées Bancaires",
        instructions: custom.instructions,
      };
    }
    return null;
  };

  const methodDetails = getSelectedMethodDetails();

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl text-slate-100 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950/60 to-slate-900 p-5 sm:p-6 border-b border-slate-800 relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-600/20">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <span>Formules d'Abonnement MY-CV Pro</span>
              </h2>
              <p className="text-xs text-slate-400">
                Téléchargez vos CVs Pro sans filigrane en illimité
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">

          {/* STEP 1: Plan Selection */}
          {step === "plans" && (
            <div className="space-y-6">
              
              {/* Subscription Status Banner if already subscribed */}
              {subInfo.isSubscribed && (
                <div className="p-3.5 bg-emerald-950/50 border border-emerald-800/80 rounded-2xl flex items-center justify-between text-xs text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>
                      Abonnement actif : <strong>{subInfo.tier === "annual" ? "Annuel" : "Semestriel"}</strong> (Expire le {subInfo.expiresAt ? new Date(subInfo.expiresAt).toLocaleDateString("fr-FR") : "N/A"})
                    </span>
                  </div>
                  <span className="font-extrabold bg-emerald-900/60 px-2.5 py-1 rounded-lg">
                    {subInfo.remainingThisMonth}/{subInfo.monthlyLimit} CVs restants ce mois
                  </span>
                </div>
              )}

              {/* Plans Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Plan 1: Semestriel (6 mois) */}
                <div 
                  onClick={() => setSelectedPlan("semi_annual")}
                  className={`p-5 rounded-2xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                    selectedPlan === "semi_annual" 
                      ? "border-rose-500 bg-rose-950/20 shadow-lg shadow-rose-950/40" 
                      : "border-slate-800 bg-slate-800/40 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pass Semestriel</span>
                      {selectedPlan === "semi_annual" && (
                        <span className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-black text-white mb-1">
                      {semiAnnualPrice.toFixed(3)} <span className="text-sm font-semibold text-slate-400">TND</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mb-4">Validité 6 Mois complets</p>

                    <ul className="space-y-2 text-xs text-slate-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span><strong>Téléchargements CV Pro Illimités</strong> sans filigrane</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Générateur de CVs & Formats A4 illimités</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Tous les modèles & styles débloqués</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Exports LaTeX & PDF A4 Haute Définition</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/60 text-center">
                    <span className="text-[11px] font-bold text-slate-400">
                      ~{(semiAnnualPrice / 6).toFixed(2)} TND / mois
                    </span>
                  </div>
                </div>

                {/* Plan 2: Annuel (12 mois) - POPULAIRE */}
                <div 
                  onClick={() => setSelectedPlan("annual")}
                  className={`p-5 rounded-2xl border-2 transition cursor-pointer relative flex flex-col justify-between ${
                    selectedPlan === "annual" 
                      ? "border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-950/40" 
                      : "border-slate-800 bg-slate-800/40 hover:border-slate-700"
                  }`}
                >
                  <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                    Meilleure Offre (Économisez 30%)
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" /> Pass Annuel
                      </span>
                      {selectedPlan === "annual" && (
                        <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                    <div className="text-2xl font-black text-white mb-1">
                      {annualPrice.toFixed(3)} <span className="text-sm font-semibold text-slate-400">TND</span>
                    </div>
                    <p className="text-[11px] text-amber-300/80 mb-4">Validité 12 Mois (1 an)</p>

                    <ul className="space-y-2 text-xs text-slate-200">
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span><strong>Téléchargements CV Pro Illimités</strong> sans filigrane</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Validité 12 mois sans aucune restriction</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Génération Lettre de motivation IA incluse</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        <span>Accès prioritaire aux nouveaux templates</span>
                      </li>
                    </ul>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/60 text-center">
                    <span className="text-[11px] font-bold text-amber-400">
                      ~{(annualPrice / 12).toFixed(2)} TND / mois
                    </span>
                  </div>
                </div>

              </div>

              {/* Free Plan Reminder */}
              <div className="p-3 bg-slate-800/30 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
                <span>Vous préférez rester sur la version gratuite ?</span>
                <span className="text-slate-300 font-bold">Téléchargements avec filigrane illimités</span>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => setStep("payment_proof")}
                className="w-full py-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white text-sm font-black rounded-2xl shadow-xl shadow-rose-900/30 transition flex items-center justify-center gap-2"
              >
                <span>Souscrire au Pass {selectedPlan === "annual" ? "Annuel (12 Mois)" : "Semestriel (6 Mois)"} - {currentPriceFormatted} TND</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Payment Details & Proof Upload */}
          {step === "payment_proof" && (
            <div className="space-y-5">
              
              <button
                type="button"
                onClick={() => setStep("plans")}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Changer de formule</span>
              </button>

              {/* Summary Header */}
              <div className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-2xl flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-400">Formule sélectionnée :</div>
                  <div className="text-sm font-extrabold text-white">
                    Pass {selectedPlan === "annual" ? "Annuel (12 Mois)" : "Semestriel (6 Mois)"}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Montant total :</div>
                  <div className="text-base font-black text-rose-400">{currentPriceFormatted} TND</div>
                </div>
              </div>

              {/* Payment Methods Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2">
                  Choisissez votre méthode de transfert en Tunisie :
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {isFlouciActive && (
                    <button
                      type="button"
                      onClick={() => setSelectedMethod("flouci")}
                      className={`p-3 rounded-xl border text-left transition ${
                        selectedMethod === "flouci"
                          ? "border-rose-500 bg-rose-950/30 text-white"
                          : "border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold">📲 Flouci</div>
                      <div className="text-[10px] text-slate-400">Transfert instantané</div>
                    </button>
                  )}

                  {isD17Active && (
                    <button
                      type="button"
                      onClick={() => setSelectedMethod("d17")}
                      className={`p-3 rounded-xl border text-left transition ${
                        selectedMethod === "d17"
                          ? "border-rose-500 bg-rose-950/30 text-white"
                          : "border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold">💳 D17 Poste</div>
                      <div className="text-[10px] text-slate-400">Mobile ou Guichet</div>
                    </button>
                  )}

                  {activeCustomMethods.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethod(m.id)}
                      className={`p-3 rounded-xl border text-left transition ${
                        selectedMethod === m.id
                          ? "border-rose-500 bg-rose-950/30 text-white"
                          : "border-slate-800 bg-slate-800/40 text-slate-400 hover:border-slate-700"
                      }`}
                    >
                      <div className="text-xs font-bold">{m.icon || "🏦"} {m.name}</div>
                      <div className="text-[10px] text-slate-400">Virement bancaire</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Instructions Box */}
              {methodDetails && (
                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Instructions de Virement</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Bénéficiaire :</span>
                      <strong className="text-slate-200">{methodDetails.recipientName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">{methodDetails.accountLabel} :</span>
                      <div className="flex items-center gap-2">
                        <strong className="text-amber-400 font-mono">{methodDetails.accountNumber}</strong>
                        <button
                          type="button"
                          onClick={() => handleCopy(methodDetails.accountNumber, "acc")}
                          className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition"
                        >
                          {copiedKey === "acc" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed pt-1 border-t border-slate-900">
                    {methodDetails.instructions}
                  </p>
                </div>
              )}

              {/* Upload Proof */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">
                  Téléversez votre capture d'écran ou reçu de paiement :
                </label>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />

                {receiptImage ? (
                  <div className="relative p-3 bg-slate-950 border border-emerald-500/50 rounded-2xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={receiptImage} alt="Reçu" className="w-12 h-12 object-cover rounded-xl border border-slate-800" />
                      <div>
                        <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Reçu attaché
                        </div>
                        <div className="text-[10px] text-slate-400">Prêt pour validation administrateur</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-slate-400 hover:text-white underline px-2 py-1"
                    >
                      Remplacer
                    </button>
                  </div>
                ) : (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-6 border-2 border-dashed border-slate-700 hover:border-rose-500 bg-slate-950/40 rounded-2xl text-center cursor-pointer transition group"
                  >
                    <Upload className="w-8 h-8 text-slate-500 group-hover:text-rose-400 mx-auto mb-2 transition" />
                    <div className="text-xs font-bold text-slate-300 group-hover:text-white">
                      Cliquez pour sélectionner votre image ou capture d'écran
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">Formats acceptés : JPG, PNG (Max 5 Mo)</div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmitProof}
                disabled={!receiptImage || isSubmitting}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>Envoi en cours...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmer et Transmettre mon Reçu</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* STEP 3: Success Confirmation */}
          {step === "success" && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-white">Demande d'abonnement transmise !</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                Votre reçu pour le <strong>Pass {selectedPlan === "annual" ? "Annuel (12 Mois)" : "Semestriel (6 Mois)"}</strong> a été transmis à notre équipe d'administration. Dès confirmation du virement, votre accès Pro avec vos <strong>téléchargements illimités</strong> sera activé immédiatement.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
