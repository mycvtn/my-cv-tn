"use client";

import React, { useState } from "react";
import { X, Check, ShieldCheck, Zap, Sparkles, CreditCard, Ticket, Loader2 } from "lucide-react";
import confetti from "canvas-confetti";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccessCredit: (credits: number) => void;
}

export const PricingModal: React.FC<Props> = ({ isOpen, onClose, onSuccessCredit }) => {
  const [selectedPlan, setSelectedPlan] = useState<"single" | "pro" | "unlimited">("pro");
  const [paymentMethod, setPaymentMethod] = useState<"flouci" | "konnect" | "d17">("flouci");
  const [d17Code, setD17Code] = useState("");
  const [loading, setLoading] = useState(false);
  const [d17Message, setD17Message] = useState<{ text: string; success: boolean } | null>(null);

  if (!isOpen) return null;

  const handleRedeemD17 = async () => {
    if (!d17Code.trim()) return;
    setLoading(true);
    setD17Message(null);

    try {
      const res = await fetch("/api/payments/d17", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: d17Code }),
      });
      const data = await res.json();
      if (data.success) {
        setD17Message({ text: data.message, success: true });
        onSuccessCredit(data.creditsAdded || 10);
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
        setTimeout(() => {
          onClose();
        }, 1800);
      } else {
        setD17Message({ text: data.message || "Code invalide", success: false });
      }
    } catch (e) {
      setD17Message({ text: "Erreur de validation du code", success: false });
    } finally {
      setLoading(false);
    }
  };

  const handleOnlineCheckout = async () => {
    setLoading(true);
    const amount = selectedPlan === "single" ? 5000 : selectedPlan === "pro" ? 15000 : 49000;

    try {
      if (paymentMethod === "flouci") {
        const res = await fetch("/api/payments/flouci", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "create", amount }),
        });
        const data = await res.json();
        if (data.isMock) {
          // Mock successful payment for dev/demo
          alert("Simulation paiement Flouci réussie ! Vos crédits sont débloqués.");
          onSuccessCredit(selectedPlan === "single" ? 5 : 20);
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
          onClose();
        } else if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        }
      } else if (paymentMethod === "konnect") {
        const res = await fetch("/api/payments/konnect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        });
        const data = await res.json();
        if (data.isMock) {
          alert("Simulation paiement Konnect (e-Dinar / Carte) réussie !");
          onSuccessCredit(selectedPlan === "single" ? 5 : 20);
          confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
          onClose();
        } else if (data.payUrl) {
          window.location.href = data.payUrl;
        }
      }
    } catch (e) {
      console.error("Payment error:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 p-6 text-white text-center relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-[10px] uppercase font-bold tracking-widest bg-rose-600/90 text-white px-3 py-1 rounded-full">
            Tarifs Locaux Tunisie & Maghreb
          </span>
          <h2 className="text-xl font-extrabold mt-2">Débloquez vos Téléchargements & Outils IA</h2>
          <p className="text-xs text-slate-300 mt-1">Export PDF haute résolution vectoriel sans filigrane</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {/* Plan Options */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Single */}
            <div
              onClick={() => setSelectedPlan("single")}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition ${
                selectedPlan === "single"
                  ? "border-rose-600 bg-rose-50/30 ring-2 ring-rose-500/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="text-xs font-bold text-slate-900">Pack Découverte</div>
              <div className="text-lg font-black text-slate-900 my-1">5 DT</div>
              <div className="text-[11px] text-slate-600 space-y-1">
                <div>✓ 5 Crédits IA</div>
                <div>✓ 1 Export PDF Pro</div>
              </div>
            </div>

            {/* 2. Pro */}
            <div
              onClick={() => setSelectedPlan("pro")}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition relative ${
                selectedPlan === "pro"
                  ? "border-rose-600 bg-rose-50/40 ring-2 ring-rose-500/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="absolute -top-2.5 right-2 bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                Populaire
              </span>
              <div className="text-xs font-bold text-slate-900">Pack Candidat Pro</div>
              <div className="text-lg font-black text-rose-600 my-1">15 DT</div>
              <div className="text-[11px] text-slate-700 space-y-1">
                <div>✓ 20 Crédits IA</div>
                <div>✓ Exports Illimités 30j</div>
                <div>✓ 3 Modèles (TN, EU, CA)</div>
              </div>
            </div>

            {/* 3. Unlimited */}
            <div
              onClick={() => setSelectedPlan("unlimited")}
              className={`p-3.5 rounded-xl border-2 cursor-pointer transition ${
                selectedPlan === "unlimited"
                  ? "border-rose-600 bg-rose-50/30 ring-2 ring-rose-500/20"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="text-xs font-bold text-slate-900">Pass Annuel</div>
              <div className="text-lg font-black text-slate-900 my-1">49 DT</div>
              <div className="text-[11px] text-slate-600 space-y-1">
                <div>✓ Accès Illimité 1 an</div>
                <div>✓ Lettres & ATS illimités</div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-900">Moyen de Paiement en Tunisie :</div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod("flouci")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  paymentMethod === "flouci" ? "border-rose-600 bg-rose-50 font-bold text-rose-900" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Zap className="w-4 h-4 text-rose-600" />
                <span className="text-xs">Flouci App</span>
              </button>

              <button
                onClick={() => setPaymentMethod("konnect")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  paymentMethod === "konnect" ? "border-rose-600 bg-rose-50 font-bold text-rose-900" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <CreditCard className="w-4 h-4 text-indigo-600" />
                <span className="text-xs">Carte / e-Dinar</span>
              </button>

              <button
                onClick={() => setPaymentMethod("d17")}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition ${
                  paymentMethod === "d17" ? "border-rose-600 bg-rose-50 font-bold text-rose-900" : "border-slate-200 text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Ticket className="w-4 h-4 text-amber-600" />
                <span className="text-xs">Code D17 / Ticket</span>
              </button>
            </div>
          </div>

          {/* D17 Redemption Panel */}
          {paymentMethod === "d17" ? (
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 space-y-3">
              <div className="text-xs font-bold text-amber-900">
                Saisir un Code de Recharge D17 ou Code Promo :
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={d17Code}
                  onChange={(e) => setD17Code(e.target.value)}
                  placeholder="Ex: D17-TUNISIA-2026"
                  className="flex-grow text-xs px-3 py-2 border rounded-xl bg-white uppercase font-mono tracking-wider"
                />
                <button
                  onClick={handleRedeemD17}
                  disabled={loading || !d17Code.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-1"
                >
                  {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  Valider
                </button>
              </div>

              <div className="text-[11px] text-amber-800">
                💡 Code de test gratuit pour démo : <code className="font-bold bg-amber-100 px-1 py-0.5 rounded cursor-pointer" onClick={() => setD17Code("D17-TUNISIA-2026")}>D17-TUNISIA-2026</code> (+20 crédits)
              </div>

              {d17Message && (
                <div className={`text-xs p-2.5 rounded-lg border font-medium ${
                  d17Message.success ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-800 border-rose-200"
                }`}>
                  {d17Message.text}
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={handleOnlineCheckout}
              disabled={loading}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirection vers la passerelle sécurisée...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Payer {selectedPlan === "single" ? "5 DT" : selectedPlan === "pro" ? "15 DT" : "49 DT"} en toute sécurité ({paymentMethod.toUpperCase()})
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
