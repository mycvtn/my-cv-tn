"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  X, Sparkles, FileText, Bot, CreditCard, Shield, 
  CheckCircle2, ArrowRight, ArrowLeft, Upload, Clock, AlertCircle, Copy, Check
} from "lucide-react";
import { getCurrentUser } from "@/lib/auth/authStore";
import { getPaymentSettings, createPaymentRequest, PaymentMethod, PaymentSettings } from "@/lib/payments/paymentStore";

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
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("flouci");
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [receiptImage, setReceiptImage] = useState<string>("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PRICE_PER_CREDIT_TND = 0.8; // 1 Crédit = 0.800 TND

  useEffect(() => {
    if (isOpen) {
      setPaymentSettings(getPaymentSettings());
      setStep("calculate");
      setReceiptImage("");
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2" title="Calculateur de crédits IA et recharge par virement D17 / Flouci">
              <Sparkles className="w-5 h-5 text-rose-600" />
              Recharge & Calculateur my-cv.tn
            </h3>
            <p className="text-xs text-slate-500">1 Crédit = 0.800 TND • Virement D17 & Flouci vérifié par l'Admin</p>
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
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-rose-600"
              />

              <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                <span>5 Cr (4 DT)</span>
                <span>25 Cr (20 DT)</span>
                <span>50 Cr (40 DT)</span>
                <span>100 Cr (80 DT)</span>
              </div>
            </div>

            {/* Actions débloquées */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>PDF Pro Clean</span>
                </div>
                <div className="text-lg font-black text-emerald-600">{cleanPdfCount} CVs Pro</div>
                <div className="text-[10px] text-slate-400">10 crédits / Téléchargement</div>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-2xl space-y-1 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                  <Bot className="w-4 h-4 text-indigo-600" />
                  <span>Actions IA</span>
                </div>
                <div className="text-lg font-black text-indigo-600">{aiActionsCount} Actions</div>
                <div className="text-[10px] text-slate-400">5 crédits / Lettre ou ATS Match</div>
              </div>
            </div>

            {/* Choix Méthode de Paiement */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">Choisissez votre moyen de paiement :</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod("flouci")}
                  className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                    selectedMethod === "flouci"
                      ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">Flouci / Virement</div>
                    <div className="text-[10px] text-slate-500">App Flouci ou RIB</div>
                  </div>
                  {selectedMethod === "flouci" && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod("d17")}
                  className={`p-3 rounded-2xl border text-left transition flex items-center justify-between ${
                    selectedMethod === "d17"
                      ? "border-rose-500 bg-rose-50/50 ring-2 ring-rose-500/20"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">D17 / e-Dinar</div>
                    <div className="text-[10px] text-slate-500">Poste Tunisienne</div>
                  </div>
                  {selectedMethod === "d17" && <CheckCircle2 className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                </button>
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
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 font-semibold"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Modifier le montant</span>
              </button>
              <span className="text-xs font-black text-rose-600">
                Montant exact : {totalTND} TND ({credits} Crédits)
              </span>
            </div>

            {/* Coordonnées selon méthode choisie */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 uppercase">
                  {selectedMethod === "d17" ? "📱 Coordonnées D17" : "💳 Coordonnées Flouci / RIB"}
                </span>
                <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full font-bold">
                  Géré par l'administration
                </span>
              </div>

              {selectedMethod === "d17" ? (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Numéro D17 :</div>
                      <div className="font-mono font-bold text-slate-900">{paymentSettings?.d17PhoneNumber || "98 123 456"}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentSettings?.d17PhoneNumber || "98123456", "d17")}
                      className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg"
                      title="Copier"
                    >
                      {copiedKey === "d17" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong>Bénéficiaire :</strong> {paymentSettings?.d17AccountHolder || "my-cv.tn"}
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    {paymentSettings?.d17Instructions || "Envoyez le montant exact sur D17 et joignez la capture du reçu."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200">
                    <div>
                      <div className="text-[10px] text-slate-400 font-semibold">Compte / RIB Flouci :</div>
                      <div className="font-mono font-bold text-slate-900 text-[11px]">{paymentSettings?.flouciAccount || "flouci.me/mycv_tn"}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(paymentSettings?.flouciAccount || "flouci.me/mycv_tn", "flouci")}
                      className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 rounded-lg"
                      title="Copier"
                    >
                      {copiedKey === "flouci" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="text-[11px] text-slate-600">
                    <strong>Bénéficiaire :</strong> {paymentSettings?.flouciAccountHolder || "MY-CV TUNISIE"}
                  </div>
                  <p className="text-[11px] text-slate-500 italic">
                    {paymentSettings?.flouciInstructions || "Effectuez le virement sur Flouci et attachez la capture du reçu."}
                  </p>
                </div>
              )}
            </div>

            {/* Upload Capture d'écran / Reçu */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 block">
                Téléverser la capture d'écran / reçu de virement :
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
                      className="text-xs text-slate-600 font-semibold underline hover:text-slate-900"
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
                  <Upload className="w-6 h-6 mx-auto text-slate-400 group-hover:text-rose-600 transition" />
                  <div className="text-xs font-bold text-slate-700 group-hover:text-rose-600 transition">
                    Cliquez pour téléverser votre capture écran
                  </div>
                  <div className="text-[10px] text-slate-400">PNG, JPG, JPEG jusqu'à 5 Mo</div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep("calculate")}
                className="px-4 py-2.5 text-xs text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
              >
                Retour
              </button>

              <button
                type="button"
                onClick={handleSubmitProof}
                disabled={!receiptImage || isSubmitting}
                className={`flex items-center gap-2 px-6 py-3 font-extrabold text-xs rounded-2xl shadow-lg transition ${
                  receiptImage
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer shadow-emerald-600/30"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSubmitting ? "Envoi en cours..." : "Confirmer mon paiement"}</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: SUCCESS & PENDING STATUS */}
        {step === "success" && (
          <div className="text-center py-4 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <Clock className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base font-black text-slate-900">Demande de Recharge Envoyée !</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Votre reçu de <strong className="text-slate-900">{totalTND} TND</strong> ({credits} Crédits) a été transmis à l'administration.
              </p>
            </div>

            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-left text-xs space-y-1 text-amber-900">
              <div className="font-bold flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Statut : En attente de validation</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Dès que l'administrateur valide la réception du virement sur D17 / Flouci, vos <strong className="text-slate-900">{credits} crédits</strong> seront immédiatement ajoutés à votre compte.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition"
            >
              Compris, fermer
            </button>
          </div>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 pt-1">
          <Shield className="w-3.5 h-3.5 text-emerald-500" />
          <span>Vérification humaine sécurisée sous 5 à 15 minutes</span>
        </div>
      </div>
    </div>
  );
};
