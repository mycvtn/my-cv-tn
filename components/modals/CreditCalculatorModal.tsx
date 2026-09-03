"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, Sparkles, FileText, Bot, CreditCard, Shield, 
  CheckCircle2, ArrowRight, ArrowLeft, Upload, Clock, AlertCircle, Copy, Check
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/authStore";
import { getPaymentSettings, createPaymentRequest, PaymentMethod, PaymentSettings, CustomPaymentMethod } from "@/lib/payments/paymentStore";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onSelectPlan?: (credits: number, tndAmount: number) => void;
}

export const CreditCalculatorModal: React.FC<Props> = ({ 
  isOpen, 
  onClose, 
  currentBalance,
  onSelectPlan
}) => {
  const [step, setStep] = useState<"calculate" | "payment_proof" | "success">("calculate");
  const [credits, setCredits] = useState<number>(25);
  const [selectedMethod, setSelectedMethod] = useState<string>("flouci");
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [receiptImage, setReceiptImage] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRICE_PER_CREDIT_TND = 0.8; // 1 Crédit = 0.800 TND

  useEffect(() => {
    if (isOpen) {
      const settings = getPaymentSettings();
      setPaymentSettings(settings);
      setStep("calculate");
      setReceiptImage("");

      // Default to first active method
      if (settings.flouciEnabled !== false) {
        setSelectedMethod("flouci");
      } else if (settings.d17Enabled !== false) {
        setSelectedMethod("d17");
      } else if (settings.customMethods && settings.customMethods.length > 0) {
        const firstActive = settings.customMethods.find((m) => m.enabled);
        if (firstActive) setSelectedMethod(firstActive.id);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalTND = (credits * PRICE_PER_CREDIT_TND).toFixed(3);
  const cleanPdfCount = Math.floor(credits / 10);
  const aiActionsCount = Math.floor(credits / 5);

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

  const handleSubmitProof = () => {
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
      createPaymentRequest(
        userId,
        userName,
        userEmail,
        selectedMethod,
        credits,
        Number(totalTND),
        receiptImage
      );

      setStep("success");
      if (onSelectPlan) {
        onSelectPlan(credits, Number(totalTND));
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

  // Selected method details helper
  const getSelectedMethodDetails = () => {
    if (selectedMethod === "d17") {
      return {
        title: "📱 Coordonnées D17",
        icon: "📱",
        name: "D17 (Poste Tunisienne)",
        accountLabel: "Numéro D17 :",
        accountNumber: paymentSettings?.d17PhoneNumber || "98 123 456",
        accountHolder: paymentSettings?.d17AccountHolder || "my-cv.tn Administration",
        instructions: paymentSettings?.d17Instructions || "Envoyez le montant exact sur D17 et joignez la capture du reçu.",
      };
    }
    if (selectedMethod === "flouci") {
      return {
        title: "🇹🇳 Coordonnées Flouci",
        icon: "🇹🇳",
        name: "Flouci / Virement Bancaire",
        accountLabel: "Compte / RIB Flouci :",
        accountNumber: paymentSettings?.flouciAccount || "flouci.me/mycv_tn",
        accountHolder: paymentSettings?.flouciAccountHolder || "MY-CV TUNISIE",
        instructions: paymentSettings?.flouciInstructions || "Effectuez le virement sur Flouci et attachez la capture du reçu.",
      };
    }
    const custom = activeCustomMethods.find((m) => m.id === selectedMethod);
    if (custom) {
      return {
        title: `${custom.icon || "💳"} Coordonnées ${custom.name}`,
        icon: custom.icon || "💳",
        name: custom.name,
        accountLabel: "Numéro de Compte / RIB / Identifiant :",
        accountNumber: custom.accountNumber,
        accountHolder: custom.accountHolder,
        instructions: custom.instructions || "Effectuez le paiement vers ce compte puis téléversez votre justificatif.",
      };
    }
    return {
      title: "💳 Coordonnées de Paiement",
      icon: "💳",
      name: "Paiement Direct",
      accountLabel: "Identifiant :",
      accountNumber: "my-cv.tn",
      accountHolder: "MY-CV TUNISIE",
      instructions: "Effectuez votre virement puis attachez le reçu.",
    };
  };

  const currentMethodDetails = getSelectedMethodDetails();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2" title="Calculateur de crédits IA et recharge par virement D17 / Flouci">
              <Sparkles className="w-5 h-5 text-rose-600" />
              Recharge & Calculateur my-cv.tn
            </h3>
            <p className="text-xs text-slate-500">1 Crédit = 0.800 TND • Paiements sécurisés vérifiés par l'Admin</p>
          </div>
          <button 
            onClick={onClose} 
            title="Fermer la fenêtre du Calculateur de Crédits"
            aria-label="Fermer la fenêtre du Calculateur de Crédits"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CALCULATE & CHOOSE METHOD */}
        {step === "calculate" && (
          <div className="space-y-4">
            {/* Solde actuel */}
            <div className="bg-slate-50 p-3 rounded-2xl flex items-center justify-between border border-slate-200/80 text-xs">
              <span className="text-slate-600 font-semibold">Votre solde actuel :</span>
              <span className="font-extrabold text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-2xs">
                {currentBalance} Crédits ({ (currentBalance * PRICE_PER_CREDIT_TND).toFixed(2) } DT)
              </span>
            </div>

            {/* Slider Interactif */}
            <div className="space-y-3 bg-gradient-to-br from-rose-50/60 to-indigo-50/60 p-4 rounded-2xl border border-rose-100">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Sélectionnez vos crédits :</span>
                <span className="text-2xl font-black text-rose-600">{credits} Crédits</span>
              </div>

              <input
                type="range"
                min={5}
                max={100}
                step={5}
                value={credits}
                onChange={(e) => setCredits(Number(e.target.value))}
                className="w-full h-2 bg-rose-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-bold px-1">
                <span>5 Cr (4 DT)</span>
                <span>25 Cr (20 DT)</span>
                <span>50 Cr (40 DT)</span>
                <span>100 Cr (80 DT)</span>
              </div>
            </div>

            {/* Équivalence Actions */}
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="text-[10px] text-slate-500 font-bold flex items-center justify-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-rose-500" />
                  <span>Exports PDF Sans Filigrane</span>
                </div>
                <div className="text-lg font-black text-rose-600">{cleanPdfCount} CVs</div>
                <div className="text-[10px] text-slate-400">10 crédits / Export Pro HD</div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div className="text-[10px] text-slate-500 font-bold flex items-center justify-center gap-1">
                  <Bot className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Optimisations IA Gemini</span>
                </div>
                <div className="text-lg font-black text-indigo-600">{aiActionsCount} Actions</div>
                <div className="text-[10px] text-slate-400">5 crédits / Lettre ou ATS Match</div>
              </div>
            </div>

            {/* Choix Méthode de Paiement */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Choisissez votre moyen de paiement :</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {isFlouciActive && (
                  <button
                    type="button"
                    onClick={() => setSelectedMethod("flouci")}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      selectedMethod === "flouci"
                        ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>🇹🇳</span>
                        <span>Flouci / Virement</span>
                      </div>
                      <div className="text-[10px] text-slate-500">App Flouci ou compte</div>
                    </div>
                    {selectedMethod === "flouci" && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                  </button>
                )}

                {isD17Active && (
                  <button
                    type="button"
                    onClick={() => setSelectedMethod("d17")}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      selectedMethod === "d17"
                        ? "border-rose-500 bg-rose-50/50 ring-2 ring-rose-500/20 shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <span>📱</span>
                        <span>D17 / e-Dinar</span>
                      </div>
                      <div className="text-[10px] text-slate-500">Poste Tunisienne</div>
                    </div>
                    {selectedMethod === "d17" && <CheckCircle2 className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                  </button>
                )}

                {/* Custom Methods configured by admin */}
                {activeCustomMethods.map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center justify-between cursor-pointer ${
                      selectedMethod === method.id
                        ? "border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-xs"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="truncate pr-1">
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                        <span>{method.icon || "💳"}</span>
                        <span className="truncate">{method.name}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{method.accountHolder}</div>
                    </div>
                    {selectedMethod === method.id && <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Total & Bouton Suivant */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-400 font-bold">TOTAL À PAYER :</div>
                <div className="text-2xl font-black text-slate-900">
                  {totalTND} <span className="text-sm font-bold text-rose-600">TND</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setStep("payment_proof")}
                className="flex items-center gap-2 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl shadow-lg transition cursor-pointer"
              >
                <span>Suivant : Coordonnées & Preuve</span>
                <ArrowRight className="w-4 h-4 text-rose-400" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: DISPLAY ADMIN COORDINATES & UPLOAD RECEIPT */}
        {step === "payment_proof" && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep("calculate")}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Modifier le montant</span>
              </button>
              <span className="text-xs font-black text-rose-600">
                Montant exact : {totalTND} TND ({credits} Crédits)
              </span>
            </div>

            {/* Dynamic Coordinates Box based on chosen method */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase flex items-center gap-1.5">
                  <span>{currentMethodDetails.icon}</span>
                  <span>{currentMethodDetails.title}</span>
                </span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                  Compte Officiel Vérifié
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                  <div className="truncate mr-2">
                    <div className="text-[10px] text-slate-400 font-semibold">{currentMethodDetails.accountLabel}</div>
                    <div className="font-mono font-bold text-slate-900 text-xs sm:text-sm truncate">
                      {currentMethodDetails.accountNumber}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(currentMethodDetails.accountNumber, "active_method")}
                    className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg flex-shrink-0 cursor-pointer"
                    title="Copier les coordonnées"
                  >
                    {copiedKey === "active_method" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <div className="text-[11px] text-slate-600">
                  <strong>Bénéficiaire :</strong> {currentMethodDetails.accountHolder}
                </div>

                <p className="text-[11px] text-slate-500 italic bg-white/60 p-2 rounded-lg border border-slate-200/60">
                  💡 {currentMethodDetails.instructions}
                </p>
              </div>
            </div>

            {/* Upload Capture d'écran / Reçu */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Téléverser la capture d'écran / reçu de votre paiement :
              </label>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {receiptImage ? (
                <div className="p-3 border-2 border-emerald-500/50 bg-emerald-50/20 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Justificatif chargé avec succès
                    </span>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-slate-600 font-semibold underline hover:text-slate-900 cursor-pointer"
                    >
                      Changer
                    </button>
                  </div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={receiptImage}
                    alt="Capture de paiement"
                    className="max-h-36 w-auto mx-auto rounded-xl border border-slate-200 object-contain shadow-xs"
                  />
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-6 border-2 border-dashed border-slate-300 hover:border-rose-500 bg-slate-50/50 hover:bg-rose-50/20 rounded-2xl cursor-pointer text-center space-y-2 transition group"
                >
                  <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto group-hover:scale-110 transition">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-slate-700">
                    Cliquez pour joindre la capture d'écran ou photo du reçu
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Formats acceptés : PNG, JPG, JPEG (Max 5 Mo)
                  </div>
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep("calculate")}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Retour
              </button>

              <button
                type="button"
                disabled={!receiptImage || isSubmitting}
                onClick={handleSubmitProof}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 text-white font-extrabold text-xs rounded-2xl shadow-lg transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span>Envoi en cours...</span>
                ) : (
                  <>
                    <span>Envoyer la Demande de Validation</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS & CONFIRMATION */}
        {step === "success" && (
          <div className="py-6 text-center space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-slate-900">
                Demande de recharge envoyée avec succès !
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Votre capture a été transmise à notre équipe administrative. Dès confirmation du virement, vos <strong>{credits} crédits</strong> seront crédités sur votre compte.
              </p>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center justify-center gap-2 max-w-sm mx-auto">
              <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Délai moyen de validation : <strong>5 à 15 minutes</strong></span>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
            >
              Compris, continuer
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
