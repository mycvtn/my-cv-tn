"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserAccount, UserRole } from "@/types/auth";
import { 
  getStoredUsers, getCurrentUser, adminUpdateUserCredits, 
  adminToggleUserStatus, adminDeleteUser, adminDeleteAllUsers, registerNewUser, logoutUser,
  adminCreateUser, fetchServerUsers, adminSetUserSubscription, adminResetUserMonthlyQuota, getUserSubscriptionInfo
} from "@/lib/auth/authStore";
import { 
  getPaymentSettings, savePaymentSettings,
  approvePaymentRequest, rejectPaymentRequest, fetchServerPaymentRequests, fetchServerPaymentSettings,
  PaymentRequest, PaymentSettings, CustomPaymentMethod
} from "@/lib/payments/paymentStore";
import { 
  Users, Ticket, DollarSign, Shield, ShieldCheck, Search, 
  Plus, PlusCircle, MinusCircle, Ban, CheckCircle2, Trash2, 
  ArrowLeft, RefreshCw, LogOut, FileText, Activity, AlertCircle, Edit3,
  CreditCard, Clock, XCircle, Eye, Settings, Check, Phone, Landmark, MessageSquare, UserCheck, Zap,
  Sparkles, Crown, Calendar, QrCode, Upload, Image, Maximize2
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "payments" | "settings">("users");

  // Users State
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [search, setSearch] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "suspended">("all");
  const [isAddUserModal, setIsAddUserModal] = useState<boolean>(false);
  const [newUserName, setNewUserName] = useState<string>("");
  const [newUserEmail, setNewUserEmail] = useState<string>("");
  const [newUserPassword, setNewUserPassword] = useState<string>("");
  const [newUserRole, setNewUserRole] = useState<UserRole>("user");
  const [newUserCredits, setNewUserCredits] = useState<number>(5);

  // Quick Credit Edit Modal
  const [editingCreditsUser, setEditingCreditsUser] = useState<UserAccount | null>(null);
  const [customCreditsValue, setCustomCreditsValue] = useState<number>(0);

  // Payment Requests State
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>("");

  // Payment Settings State
  const [settingsForm, setSettingsForm] = useState<PaymentSettings>({
    semiAnnualPriceTND: 29.0,
    annualPriceTND: 49.0,
    monthlyQuota: 3,
    d17PhoneNumber: "",
    d17AccountHolder: "",
    d17Instructions: "",
    d17QrCodeUrl: "",
    d17Enabled: true,
    flouciAccount: "",
    flouciAccountHolder: "",
    flouciInstructions: "",
    flouciQrCodeUrl: "",
    flouciEnabled: true,
    customMethods: [],
  });

  // New Custom Payment Method Modal State
  const [isAddMethodModalOpen, setIsAddMethodModalOpen] = useState<boolean>(false);
  const [newMethodName, setNewMethodName] = useState<string>("");
  const [newMethodIcon, setNewMethodIcon] = useState<string>("🏦");
  const [newMethodAccountNumber, setNewMethodAccountNumber] = useState<string>("");
  const [newMethodAccountHolder, setNewMethodAccountHolder] = useState<string>("");
  const [newMethodInstructions, setNewMethodInstructions] = useState<string>("");
  const [newMethodQrCode, setNewMethodQrCode] = useState<string>("");
  const [previewQrCodeModal, setPreviewQrCodeModal] = useState<string | null>(null);

  const [toastMessage, setToastMessage] = useState<string>("");

  const handleQrFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("L'image ne doit pas dépasser 2 Mo.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const res = event.target?.result as string;
      if (res) setter(res);
    };
    reader.readAsDataURL(file);
  };

  const refreshAllData = async () => {
    try {
      const sUsers = await fetchServerUsers();
      if (sUsers && sUsers.length > 0) setUsers(sUsers);
      const reqs = await fetchServerPaymentRequests();
      if (reqs) setPaymentRequests(reqs);
      const sSettings = await fetchServerPaymentSettings();
      if (sSettings) setSettingsForm(sSettings);
    } catch (e) {}
  };

  useEffect(() => {
    const active = getCurrentUser();
    setCurrentUser(active);

    if (!active || active.role !== "admin") {
      router.push("/admin/login");
      return;
    }

    // Initial load from local store immediately (0ms)
    setUsers(getStoredUsers());
    setSettingsForm(getPaymentSettings());

    // Then background fetch
    refreshAllData();

    // Background sync every 10s (clean & low network footprint)
    const interval = setInterval(refreshAllData, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [router]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 2500);
  };

  // Instant Optimistic User Actions
  const handleUpdateCredits = (userId: string, deltaOrExact: number, isExact = false) => {
    // 1. Instant UI update (0ms latency)
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId || u.email.toLowerCase() === userId.toLowerCase()) {
          const newCredits = isExact
            ? Math.max(0, deltaOrExact)
            : Math.max(0, (u.credits || 0) + deltaOrExact);
          return { ...u, credits: newCredits };
        }
        return u;
      })
    );

    // 2. Persist in store & sync to server API
    const updated = adminUpdateUserCredits(userId, deltaOrExact, isExact);
    if (updated) {
      showToast(`⚡ Solde de ${updated.name} mis à jour : ${updated.credits} crédits`);
    }
  };

  const handleOpenCreditEditor = (u: UserAccount) => {
    setEditingCreditsUser(u);
    setCustomCreditsValue(u.credits || 0);
  };

  const handleSaveCustomCredits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCreditsUser) return;
    handleUpdateCredits(editingCreditsUser.id, Number(customCreditsValue), true);
    setEditingCreditsUser(null);
  };

  const handleToggleStatus = (userId: string) => {
    // Instant UI update
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId || u.email.toLowerCase() === userId.toLowerCase()) {
          return { ...u, status: u.status === "active" ? "suspended" : "active" };
        }
        return u;
      })
    );
    const updated = adminToggleUserStatus(userId);
    if (updated) {
      showToast(`Statut de ${updated.name} modifié en ${updated.status}.`);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (confirm(`Confirmez-vous la suppression définitive du compte de ${name} ?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      adminDeleteUser(userId);
      showToast(`Compte de ${name} définitivement supprimé.`);
    }
  };

  const handleDeleteAllUsers = async () => {
    if (confirm("⚠️ ATTENTION : Confirmez-vous la suppression définitive de TOUS les comptes utilisateurs ? Seul le compte Administrateur sera conservé.")) {
      setUsers((prev) => prev.filter((u) => u.role === "admin"));
      adminDeleteAllUsers();
      showToast("Tous les comptes utilisateurs ont été définitivement supprimés.");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const res = adminCreateUser(
      newUserName,
      newUserEmail,
      newUserPassword || "password123",
      newUserRole,
      newUserRole === "admin" ? 999 : Number(newUserCredits) || 5
    );

    if (res.success && res.user) {
      setUsers(getStoredUsers());
      setIsAddUserModal(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("user");
      setNewUserCredits(5);
      showToast(`Compte ${newUserRole === "admin" ? "Administrateur 🛡️" : "Utilisateur 👤"} créé avec succès !`);
    } else {
      alert(res.error || "Erreur lors de la création.");
    }
  };

  // Subscription Quick Management Actions
  const handleSetSubscription = async (userId: string, tier: "semi_annual" | "annual" | "none") => {
    const updated = adminSetUserSubscription(userId, tier);
    if (updated) {
      setUsers(getStoredUsers());
      showToast(
        tier === "annual"
          ? `👑 Pass Annuel (12 mois) activé pour ${updated.name}`
          : tier === "semi_annual"
          ? `✨ Pass Semestriel (6 mois) activé pour ${updated.name}`
          : `Abonnement désactivé pour ${updated.name}`
      );
      setTimeout(async () => {
        const refreshed = await fetchServerUsers();
        if (refreshed && refreshed.length > 0) setUsers(refreshed);
      }, 300);
    }
  };

  const handleResetQuota = async (userId: string) => {
    const updated = adminResetUserMonthlyQuota(userId);
    if (updated) {
      setUsers(getStoredUsers());
      showToast(`⚡ Compteur réinitialisé pour ${updated.name}`);
      setTimeout(async () => {
        const refreshed = await fetchServerUsers();
        if (refreshed && refreshed.length > 0) setUsers(refreshed);
      }, 300);
    }
  };

  // Payment Actions
  const handleApprovePayment = async (reqId: string, clientName: string, credits: number, planType?: string) => {
    // Instant UI update
    setPaymentRequests((prev) =>
      prev.map((p) => (p.id === reqId ? { ...p, status: "approved" } : p))
    );
    const planLabel = planType === "annual" ? "Pass Annuel (12 mois)" : planType === "semi_annual" ? "Pass Semestriel (6 mois)" : `+${credits} crédits`;
    showToast(`Paiement validé ! ${planLabel} activé pour ${clientName}.`);

    const res = await approvePaymentRequest(reqId);
    if (res.success) {
      const refreshed = await fetchServerUsers();
      if (refreshed && refreshed.length > 0) setUsers(refreshed);
    } else {
      alert(res.error || "Erreur lors de la validation.");
    }
  };

  const handleOpenReject = (reqId: string) => {
    setRejectingRequestId(reqId);
    setRejectionReasonInput("Reçu non conforme ou virement non reçu sur le compte.");
  };

  const handleConfirmReject = async () => {
    if (!rejectingRequestId) return;
    const reqId = rejectingRequestId;
    setPaymentRequests((prev) =>
      prev.map((p) => (p.id === reqId ? { ...p, status: "rejected", rejectionReason: rejectionReasonInput } : p))
    );
    setRejectingRequestId(null);
    showToast("Demande de paiement refusée avec motif transmis.");

    await rejectPaymentRequest(reqId, rejectionReasonInput);
  };

  // Settings Actions
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await savePaymentSettings(settingsForm);
    showToast("Coordonnées de paiement enregistrées avec succès !");
  };

  // Custom Method Management
  const handleCreateCustomMethod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMethodName.trim() || !newMethodAccountNumber.trim()) {
      alert("Veuillez renseigner au minimum le nom et le numéro / RIB.");
      return;
    }

    const newMethod: CustomPaymentMethod = {
      id: `meth-${Date.now()}`,
      name: newMethodName.trim(),
      icon: newMethodIcon.trim() || "💳",
      accountNumber: newMethodAccountNumber.trim(),
      accountHolder: newMethodAccountHolder.trim() || "MY-CV TUNISIE",
      instructions: newMethodInstructions.trim() || "Effectuez le paiement vers ce compte puis téléversez votre justificatif.",
      qrCodeUrl: newMethodQrCode.trim() || undefined,
      enabled: true,
    };

    const updatedMethods = [...(settingsForm.customMethods || []), newMethod];
    const updatedSettings = { ...settingsForm, customMethods: updatedMethods };
    setSettingsForm(updatedSettings);
    await savePaymentSettings(updatedSettings);

    // Reset Form & Close Modal
    setNewMethodName("");
    setNewMethodIcon("🏦");
    setNewMethodAccountNumber("");
    setNewMethodAccountHolder("");
    setNewMethodInstructions("");
    setNewMethodQrCode("");
    setIsAddMethodModalOpen(false);

    showToast(`Nouvelle méthode « ${newMethod.name} » ajoutée avec succès !`);
  };

  const handleDeleteCustomMethod = async (id: string, name: string) => {
    if (confirm(`Voulez-vous supprimer définitivement la méthode de paiement « ${name} » ?`)) {
      const updatedMethods = (settingsForm.customMethods || []).filter((m) => m.id !== id);
      const updatedSettings = { ...settingsForm, customMethods: updatedMethods };
      setSettingsForm(updatedSettings);
      await savePaymentSettings(updatedSettings);
      showToast(`Méthode « ${name} » supprimée.`);
    }
  };

  const handleToggleCustomMethod = async (id: string) => {
    const updatedMethods = (settingsForm.customMethods || []).map((m) => {
      if (m.id === id) {
        return { ...m, enabled: !m.enabled };
      }
      return m;
    });
    const updatedSettings = { ...settingsForm, customMethods: updatedMethods };
    setSettingsForm(updatedSettings);
    await savePaymentSettings(updatedSettings);
    showToast("Statut de la méthode mis à jour.");
  };

  const handleUpdateCustomMethodField = (id: string, field: keyof CustomPaymentMethod, value: any) => {
    const updatedMethods = (settingsForm.customMethods || []).map((m) => {
      if (m.id === id) {
        return { ...m, [field]: value };
      }
      return m;
    });
    setSettingsForm({ ...settingsForm, customMethods: updatedMethods });
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/admin/login");
  };

  // Helper for Payment Request Method Badge
  const getMethodBadge = (method: string) => {
    if (method === "d17") {
      return (
        <span className="px-3 py-1 rounded-lg text-xs font-black bg-rose-100 text-rose-950 border border-rose-300 inline-flex items-center gap-1.5">
          <span>📱</span> D17
        </span>
      );
    }
    if (method === "flouci") {
      return (
        <span className="px-3 py-1 rounded-lg text-xs font-black bg-emerald-100 text-emerald-950 border border-emerald-300 inline-flex items-center gap-1.5">
          <span>🇹🇳</span> Flouci / RIB
        </span>
      );
    }
    const custom = (settingsForm.customMethods || []).find((m) => m.id === method || m.name.toLowerCase() === method.toLowerCase());
    return (
      <span className="px-3 py-1 rounded-lg text-xs font-black bg-blue-100 text-blue-950 border border-blue-300 inline-flex items-center gap-1.5">
        <span>{custom?.icon || "💳"}</span> {custom?.name || method}
      </span>
    );
  };

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all" ? true : u.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // Filtered Payment Requests
  const filteredPayments = paymentRequests.filter((p) => {
    if (filterPaymentStatus === "all") return true;
    return p.status === filterPaymentStatus;
  });

  const pendingCount = paymentRequests.filter((p) => p.status === "pending").length;
  const totalVolumeTND = paymentRequests
    .filter((p) => p.status === "approved")
    .reduce((sum, p) => sum + p.amountTND, 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans relative overflow-x-hidden">
      {/* Background Subtle Aurora Ambient Glows */}
      <div className="win11-aurora top-[-100px] left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-blue-200/40 via-indigo-200/40 to-rose-200/40 pointer-events-none" />
      <div className="win11-aurora top-[400px] -left-32 w-[500px] h-[400px] bg-sky-200/30 pointer-events-none" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-black animate-in slide-in-from-top-2 duration-150 backdrop-blur-md border border-emerald-500">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="h-16 border-b border-slate-200/90 bg-white/95 backdrop-blur-2xl px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center text-white font-black text-sm shadow-md shadow-rose-600/30">
            AD
          </div>
          <div>
            <h1 className="text-base font-black text-slate-950 flex items-center gap-2">
              <span>Portail Administrateur</span>
              <span className="text-xs bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-300 font-black uppercase tracking-wider">
                my-cv.tn
              </span>
            </h1>
            <p className="text-xs font-bold text-slate-600">Supervision système, utilisateurs & passerelles de paiement</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/builder")}
            className="flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-300 transition-all duration-200 shadow-2xs cursor-pointer win11-btn-interactive"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-600" />
            <span>Éditeur de CV</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 rounded-xl border border-rose-500 shadow-md shadow-rose-600/30 transition-all duration-200 cursor-pointer win11-btn-interactive"
          >
            <LogOut className="w-4 h-4" />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-grow p-6 max-w-7xl w-full mx-auto space-y-6 relative z-10">
        
        {/* KPI Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between text-slate-700 text-xs font-bold">
              <span>Utilisateurs Inscrits</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-3xl font-black text-slate-950 flex items-center gap-2">
              <span>{users.length}</span>
              <span className="text-xs font-extrabold text-rose-800 bg-rose-100 px-2.5 py-0.5 rounded-full border border-rose-200">
                {users.filter(u => u.role === "admin").length} admin{users.filter(u => u.role === "admin").length > 1 ? "s" : ""}
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-600">Comptes enregistrés sur la plateforme</div>
          </div>

          <div 
            onClick={() => setActiveTab("payments")}
            className="p-5 bg-white border border-slate-200/90 hover:border-amber-400 rounded-2xl space-y-2 cursor-pointer hover:-translate-y-0.5 transition-all duration-200 shadow-xs"
          >
            <div className="flex items-center justify-between text-slate-700 text-xs font-bold">
              <span>Paiements en Attente</span>
              <Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="text-3xl font-black text-amber-600 flex items-center gap-2">
              <span>{pendingCount}</span>
              {pendingCount > 0 && (
                <span className="text-xs bg-amber-400 text-slate-950 border border-amber-500 px-2.5 py-0.5 rounded-full font-black animate-pulse">
                  À vérifier
                </span>
              )}
            </div>
            <div className="text-xs font-semibold text-slate-600">Demandes D17, Flouci & Autres</div>
          </div>

          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between text-slate-700 text-xs font-bold">
              <span>Volume Ventes Validées</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-3xl font-black text-emerald-600">{totalVolumeTND.toFixed(3)} <span className="text-sm font-black">TND</span></div>
            <div className="text-xs font-semibold text-slate-600">Virements approuvés avec succès</div>
          </div>

          <div className="p-5 bg-white border border-slate-200/90 rounded-2xl space-y-2 shadow-xs hover:-translate-y-0.5 transition-all duration-200">
            <div className="flex items-center justify-between text-slate-700 text-xs font-bold">
              <span>Méthodes Actives</span>
              <CreditCard className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-3xl font-black text-rose-600">
              {(settingsForm.d17Enabled !== false ? 1 : 0) + (settingsForm.flouciEnabled !== false ? 1 : 0) + ((settingsForm.customMethods || []).filter(m => m.enabled).length)}
            </div>
            <div className="text-xs font-semibold text-slate-600">Canaux de paiement activés</div>
          </div>
        </div>

        {/* Windows 11 Segmented Tab Switcher */}
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white border border-slate-300 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "users"
                ? "bg-blue-600 text-white shadow-md font-black"
                : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Gestion Utilisateurs & Rôles ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "payments"
                ? "bg-amber-500 text-slate-950 shadow-md font-black"
                : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Vérification Paiements</span>
            {pendingCount > 0 && (
              <span className="bg-rose-600 text-white text-xs font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              activeTab === "settings"
                ? "bg-emerald-600 text-white shadow-md font-black"
                : "text-slate-700 hover:text-slate-950 hover:bg-slate-100"
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Configuration & Méthodes de Paiement</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: USERS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === "users" && (
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
            {/* Top Bar Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-950 placeholder:text-slate-500 focus:outline-none focus:border-blue-600 shadow-xs"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3.5 py-2.5 bg-white border-2 border-slate-300 text-xs text-slate-950 rounded-xl font-extrabold shadow-xs focus:outline-none focus:border-blue-600 cursor-pointer"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs uniquement</option>
                  <option value="suspended">Suspendus uniquement</option>
                </select>

                <button
                  onClick={() => {
                    setNewUserRole("user");
                    setNewUserCredits(5);
                    setIsAddUserModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Créer Compte (Admin / User)</span>
                </button>

                <button
                  onClick={handleDeleteAllUsers}
                  className="px-3.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition cursor-pointer shadow-md border border-rose-700"
                  title="Supprimer tous les utilisateurs ordinaires"
                >
                  Tout Supprimer
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border-2 border-slate-200">
              <table className="w-full text-left text-xs text-slate-900">
                <thead className="bg-slate-100 text-xs uppercase font-black text-slate-900 border-b-2 border-slate-300 tracking-wider">
                  <tr>
                    <th className="p-4">Utilisateur</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Rôle</th>
                    <th className="p-4">Abonnement & Quota Mensuel</th>
                    <th className="p-4">Gestion Abonnement (⚡)</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 bg-white">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-600 font-bold text-sm">
                        Aucun utilisateur trouvé.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const subInfo = getUserSubscriptionInfo(u);
                      return (
                        <tr key={u.id} className="hover:bg-slate-50 transition border-b border-slate-100">
                          <td className="p-4 font-black text-slate-950 text-sm flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-xs ${
                              u.role === "admin" 
                                ? "bg-rose-100 text-rose-800 border-2 border-rose-300" 
                                : "bg-blue-100 text-blue-900 border-2 border-blue-200"
                            }`}>
                              {u.role === "admin" ? "🛡️" : u.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-slate-950 font-bold">{u.name}</span>
                          </td>
                          <td className="p-4 font-bold text-slate-800 text-xs">{u.email}</td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide inline-flex items-center gap-1 ${
                              u.role === "admin"
                                ? "bg-rose-100 text-rose-900 border border-rose-300"
                                : "bg-blue-100 text-blue-950 border border-blue-300"
                            }`}>
                              {u.role === "admin" ? "🛡️ ADMIN" : "👤 CANDIDAT"}
                            </span>
                          </td>
                          <td className="p-4">
                            {u.role === "admin" ? (
                              <div className="flex items-center gap-1.5 text-emerald-900 bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300 text-xs font-black w-fit">
                                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                                <span>Illimité (Accès Administrateur)</span>
                              </div>
                            ) : subInfo.isSubscribed ? (
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase flex items-center gap-1 ${
                                    subInfo.tier === "annual"
                                      ? "bg-amber-100 text-amber-950 border border-amber-400"
                                      : "bg-blue-100 text-blue-950 border border-blue-400"
                                  }`}>
                                    {subInfo.tier === "annual" ? <Crown className="w-3.5 h-3.5 text-amber-700" /> : <Sparkles className="w-3.5 h-3.5 text-blue-700" />}
                                    <span>{subInfo.tier === "annual" ? "Pass Annuel (12 Mois)" : "Pass Semestriel (6 Mois)"}</span>
                                  </span>

                                  <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${
                                    subInfo.remainingThisMonth > 0
                                      ? "bg-emerald-100 text-emerald-950 border border-emerald-300"
                                      : "bg-rose-100 text-rose-950 border border-rose-300"
                                  }`}>
                                    📊 {subInfo.monthlyUsed} / {subInfo.monthlyLimit} CV Pro utilisés
                                  </span>
                                </div>
                                {subInfo.expiresAt && (
                                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-slate-600" />
                                    <span>Expire le : <strong className="text-slate-950">{new Date(subInfo.expiresAt).toLocaleDateString("fr-FR")}</strong></span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-300 w-fit">
                                <span>CV Gratuit (Filigrane) uniquement</span>
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            {u.role !== "admin" && (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => handleSetSubscription(u.id, "semi_annual")}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-black shadow-xs transition cursor-pointer"
                                  title="Activer ou renouveler Pass Semestriel (6 mois)"
                                >
                                  +6M Semestriel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleSetSubscription(u.id, "annual")}
                                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-black shadow-xs transition cursor-pointer"
                                  title="Activer ou renouveler Pass Annuel (12 mois)"
                                >
                                  +12M Annuel
                                </button>
                                {subInfo.isSubscribed && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleResetQuota(u.id)}
                                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
                                      title="Réinitialiser le compteur mensuel"
                                    >
                                      Reset
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleSetSubscription(u.id, "none")}
                                      className="px-2.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer"
                                      title="Annuler l'abonnement"
                                    >
                                      Résilier
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-black ${
                              u.status === "active"
                                ? "bg-emerald-100 text-emerald-950 border border-emerald-300"
                                : "bg-rose-100 text-rose-950 border border-rose-300"
                            }`}>
                              {u.status === "active" ? "✓ Actif" : "✕ Suspendu"}
                            </span>
                          </td>
                          <td className="p-4 text-right space-x-1.5">
                            <button
                              onClick={() => handleToggleStatus(u.id)}
                              className={`p-2 rounded-xl border transition cursor-pointer ${
                                u.status === "active"
                                  ? "bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border-rose-300"
                                  : "bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white border-emerald-300"
                              }`}
                              title={u.status === "active" ? "Suspendre ce compte" : "Réactiver ce compte"}
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                            {u.role !== "admin" && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="p-2 bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-700 rounded-xl border border-slate-300 transition cursor-pointer"
                                title="Supprimer définitivement"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PAYMENTS VERIFICATION */}
        {/* ========================================================================= */}
        {activeTab === "payments" && (
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900">Filtrer par statut :</span>
                <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-200">
                  <button
                    onClick={() => setFilterPaymentStatus("pending")}
                    className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition cursor-pointer ${
                      filterPaymentStatus === "pending"
                        ? "bg-amber-500 text-slate-950 shadow-md border border-amber-400"
                        : "text-slate-800 hover:text-slate-950 hover:bg-white"
                    }`}
                  >
                    En attente ({pendingCount})
                  </button>
                  <button
                    onClick={() => setFilterPaymentStatus("approved")}
                    className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition cursor-pointer ${
                      filterPaymentStatus === "approved"
                        ? "bg-emerald-600 text-white shadow-md border border-emerald-500"
                        : "text-slate-800 hover:text-slate-950 hover:bg-white"
                    }`}
                  >
                    Validés
                  </button>
                  <button
                    onClick={() => setFilterPaymentStatus("rejected")}
                    className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition cursor-pointer ${
                      filterPaymentStatus === "rejected"
                        ? "bg-rose-600 text-white shadow-md border border-rose-500"
                        : "text-slate-800 hover:text-slate-950 hover:bg-white"
                    }`}
                  >
                    Refusés
                  </button>
                  <button
                    onClick={() => setFilterPaymentStatus("all")}
                    className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition cursor-pointer ${
                      filterPaymentStatus === "all"
                        ? "bg-slate-950 text-white shadow-md border border-slate-800"
                        : "text-slate-800 hover:text-slate-950 hover:bg-white"
                    }`}
                  >
                    Tous
                  </button>
                </div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="overflow-x-auto rounded-2xl border-2 border-slate-200">
              <table className="w-full text-left text-xs text-slate-900">
                <thead className="bg-slate-100 text-xs uppercase font-black text-slate-900 border-b-2 border-slate-300 tracking-wider">
                  <tr>
                    <th className="p-4">Client</th>
                    <th className="p-4">Méthode</th>
                    <th className="p-4">Offre & Formule</th>
                    <th className="p-4">Montant (TND)</th>
                    <th className="p-4">Preuve / Reçu</th>
                    <th className="p-4">Statut</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 text-right">Décision Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-slate-100 bg-white">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-600 font-bold text-sm">
                        Aucune demande trouvée pour ce filtre.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 transition border-b border-slate-100">
                        <td className="p-4">
                          <div className="font-black text-slate-950 text-sm">{p.userName}</div>
                          <div className="text-xs font-bold text-slate-700">{p.userEmail}</div>
                        </td>
                        <td className="p-4">
                          {getMethodBadge(p.method)}
                        </td>
                        <td className="p-4">
                          {p.planType === "annual" ? (
                            <span className="px-3 py-1 rounded-lg text-xs font-black bg-amber-100 text-amber-950 border border-amber-400 inline-flex items-center gap-1">
                              👑 Pass Annuel (12 Mois)
                            </span>
                          ) : p.planType === "semi_annual" ? (
                            <span className="px-3 py-1 rounded-lg text-xs font-black bg-blue-100 text-blue-950 border border-blue-400 inline-flex items-center gap-1">
                              ✨ Pass Semestriel (6 Mois)
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-lg text-xs font-black bg-slate-100 text-slate-800 border border-slate-300 inline-flex items-center gap-1">
                              🎫 +{p.credits} Crédits
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-black text-slate-950 text-sm">
                          {p.amountTND.toFixed(3)} DT
                        </td>
                        <td className="p-4">
                          <button
                            type="button"
                            onClick={() => setSelectedReceiptUrl(p.receiptImageUrl)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-800 rounded-xl text-xs font-black border-2 border-blue-200 transition shadow-2xs cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Voir capture</span>
                          </button>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-black ${
                            p.status === "approved"
                              ? "bg-emerald-100 text-emerald-950 border border-emerald-300 font-extrabold"
                              : p.status === "rejected"
                              ? "bg-rose-100 text-rose-950 border border-rose-300 font-extrabold"
                              : "bg-amber-100 text-amber-950 border border-amber-300 font-extrabold animate-pulse"
                          }`}>
                            {p.status === "approved" ? "✓ Validé" : p.status === "rejected" ? "✕ Refusé" : "⏳ En attente"}
                          </span>
                          {p.rejectionReason && (
                            <div className="text-xs font-bold text-rose-700 mt-1 max-w-xs">
                              Motif : {p.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td className="p-4 text-slate-800 font-bold text-xs">
                          {new Date(p.createdAt).toLocaleString("fr-FR")}
                        </td>
                        <td className="p-4 text-right space-x-1.5">
                          {p.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleApprovePayment(p.id, p.userName, p.credits, p.planType)}
                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black shadow-md shadow-emerald-600/30 transition cursor-pointer"
                              >
                                {p.planType ? "Valider & Activer Abonnement" : "Valider & Créditer"}
                              </button>
                              <button
                                onClick={() => handleOpenReject(p.id)}
                                className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black shadow-md shadow-rose-600/20 transition cursor-pointer"
                              >
                                Refuser
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-700 font-bold text-xs bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-300 inline-block">
                              Traité
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PAYMENT COORDINATES & CUSTOM METHODS CONFIGURATION */}
        {/* ========================================================================= */}
        {activeTab === "settings" && (
          <div className="bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  Configuration des Coordonnées & Méthodes de Paiement
                </h3>
                <p className="text-xs font-bold text-slate-700 mt-0.5">
                  Configurez les comptes de réception et ajoutez de nouvelles méthodes personnalisées (Virement RIB, Sobflous, Mandat, etc.).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddMethodModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Ajouter une Méthode de Paiement</span>
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* SECTION 0: TARIFICATION DES ABONNEMENTS PRO */}
              <div className="space-y-3 p-5 bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-indigo-500/10 border-2 border-amber-300 rounded-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">👑</span>
                    <div>
                      <h4 className="text-sm font-black text-slate-950">
                        Tarification des Abonnements & Quota Téléchargements Pro
                      </h4>
                      <p className="text-xs font-bold text-slate-700">
                        Définissez les prix des formules Semestrielle et Annuelle ainsi que le quota mensuel de CV Pro sans filigrane.
                      </p>
                    </div>
                  </div>
                  <span className="bg-amber-100 text-amber-950 border-2 border-amber-400 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    Modifiable par l'Admin ⚙️
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {/* Prix Pass Semestriel */}
                  <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl space-y-1.5 shadow-xs">
                    <label className="block text-xs font-black text-slate-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-600" />
                      <span>Prix Pass Semestriel (6 Mois) :</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="999"
                        value={settingsForm.semiAnnualPriceTND ?? 29.0}
                        onChange={(e) => setSettingsForm({ ...settingsForm, semiAnnualPriceTND: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm text-slate-950 font-black focus:outline-none focus:border-blue-600 focus:bg-white pr-12"
                        required
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs font-black text-slate-700 pointer-events-none">DT</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600">Par défaut : 29.000 DT (4.8 DT / mois)</p>
                  </div>

                  {/* Prix Pass Annuel */}
                  <div className="p-4 bg-white border-2 border-amber-300 rounded-2xl space-y-1.5 shadow-xs">
                    <label className="block text-xs font-black text-slate-950 flex items-center gap-1.5">
                      <Crown className="w-4 h-4 text-amber-600" />
                      <span>Prix Pass Annuel (12 Mois) :</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.5"
                        min="1"
                        max="999"
                        value={settingsForm.annualPriceTND ?? 49.0}
                        onChange={(e) => setSettingsForm({ ...settingsForm, annualPriceTND: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2.5 bg-slate-50 border-2 border-amber-400 rounded-xl text-sm text-slate-950 font-black focus:outline-none focus:border-amber-600 focus:bg-white pr-12"
                        required
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs font-black text-amber-800 pointer-events-none">DT</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600">Par défaut : 49.000 DT (4.0 DT / mois)</p>
                  </div>

                  {/* Quota Mensuel */}
                  <div className="p-4 bg-white border-2 border-slate-200 rounded-2xl space-y-1.5 shadow-xs">
                    <label className="block text-xs font-black text-slate-950 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-emerald-600" />
                      <span>Quota CV Pro par mois :</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={settingsForm.monthlyQuota ?? 3}
                        onChange={(e) => setSettingsForm({ ...settingsForm, monthlyQuota: parseInt(e.target.value) || 3 })}
                        className="w-full px-3 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-sm text-slate-950 font-black focus:outline-none focus:border-emerald-600 focus:bg-white pr-20"
                        required
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs font-black text-slate-700 pointer-events-none">CV / mois</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-600">Abonnement Pro : Téléchargements sans filigrane</p>
                  </div>
                </div>
              </div>

              {/* SECTION 1: METHODES STANDARDS TUNISIENNES */}
              <div className="space-y-4">
                <div className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                  <span>🇹🇳 Coordonnées des Méthodes Standards Locales :</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* D17 Settings Card */}
                  <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 space-y-3.5 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-sm font-black text-rose-800 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-rose-600" />
                        <span>📱 D17 (Poste Tunisienne)</span>
                      </h4>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-black text-slate-800">
                        <input
                          type="checkbox"
                          checked={settingsForm.d17Enabled !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, d17Enabled: e.target.checked })}
                          className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                        />
                        <span>{settingsForm.d17Enabled !== false ? "✓ Actif" : "✕ Inactif"}</span>
                      </label>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-black text-slate-900 mb-1">Numéro D17 :</label>
                        <input
                          type="text"
                          value={settingsForm.d17PhoneNumber}
                          onChange={(e) => setSettingsForm({ ...settingsForm, d17PhoneNumber: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-none focus:border-rose-600 focus:bg-white"
                          placeholder="Ex: 98 123 456"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-900 mb-1">Nom du Titulaire :</label>
                        <input
                          type="text"
                          value={settingsForm.d17AccountHolder}
                          onChange={(e) => setSettingsForm({ ...settingsForm, d17AccountHolder: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-none focus:border-rose-600 focus:bg-white"
                          placeholder="Ex: my-cv.tn Administration"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-900 mb-1">Instructions client :</label>
                        <textarea
                          rows={2}
                          value={settingsForm.d17Instructions}
                          onChange={(e) => setSettingsForm({ ...settingsForm, d17Instructions: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-none focus:border-rose-600 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-900 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><QrCode className="w-4 h-4 text-rose-600" /> Schéma / Code QR D17 :</span>
                          {settingsForm.d17QrCodeUrl && (
                            <button type="button" onClick={() => setSettingsForm({ ...settingsForm, d17QrCodeUrl: "" })} className="text-xs font-bold text-rose-600 hover:underline">Supprimer</button>
                          )}
                        </label>
                        {settingsForm.d17QrCodeUrl ? (
                          <div className="flex items-center gap-3 p-2 bg-rose-50/50 rounded-xl border-2 border-rose-200">
                            <img src={settingsForm.d17QrCodeUrl} alt="QR D17" className="w-14 h-14 object-contain rounded-lg border-2 border-slate-300 p-0.5 bg-white cursor-pointer hover:scale-105 transition" onClick={() => setPreviewQrCodeModal(settingsForm.d17QrCodeUrl || null)} />
                            <span className="text-xs text-emerald-800 font-black">✓ Code QR Actif (Cliquer pour zoomer)</span>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-slate-800 text-xs font-black transition">
                            <Upload className="w-4 h-4 text-rose-600" />
                            <span>Ajouter un QR Code D17</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleQrFileUpload(e, (url) => setSettingsForm({ ...settingsForm, d17QrCodeUrl: url }))} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Flouci Settings Card */}
                  <div className="p-5 bg-white rounded-2xl border-2 border-slate-200 space-y-3.5 shadow-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                      <h4 className="text-sm font-black text-emerald-850 flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-emerald-600" />
                        <span>🇹🇳 Flouci & Virement</span>
                      </h4>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-black text-slate-800">
                        <input
                          type="checkbox"
                          checked={settingsForm.flouciEnabled !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, flouciEnabled: e.target.checked })}
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <span>{settingsForm.flouciEnabled !== false ? "✓ Actif" : "✕ Inactif"}</span>
                      </label>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-black text-slate-900 mb-1">Lien / RIB Flouci :</label>
                        <input
                          type="text"
                          value={settingsForm.flouciAccount}
                          onChange={(e) => setSettingsForm({ ...settingsForm, flouciAccount: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-none focus:border-emerald-600 focus:bg-white"
                          placeholder="Ex: flouci.me/mycv_tn ou RIB"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-900 mb-1">Nom du Titulaire :</label>
                        <input
                          type="text"
                          value={settingsForm.flouciAccountHolder}
                          onChange={(e) => setSettingsForm({ ...settingsForm, flouciAccountHolder: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-none focus:border-emerald-600 focus:bg-white"
                          placeholder="Ex: SARL MY-CV TN"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-900 mb-1">Instructions client :</label>
                        <textarea
                          rows={2}
                          value={settingsForm.flouciInstructions}
                          onChange={(e) => setSettingsForm({ ...settingsForm, flouciInstructions: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-none focus:border-emerald-600 focus:bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-900 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1.5"><QrCode className="w-4 h-4 text-emerald-600" /> Schéma / Code QR Flouci :</span>
                          {settingsForm.flouciQrCodeUrl && (
                            <button type="button" onClick={() => setSettingsForm({ ...settingsForm, flouciQrCodeUrl: "" })} className="text-xs font-bold text-rose-600 hover:underline">Supprimer</button>
                          )}
                        </label>
                        {settingsForm.flouciQrCodeUrl ? (
                          <div className="flex items-center gap-3 p-2 bg-emerald-50/50 rounded-xl border-2 border-emerald-200">
                            <img src={settingsForm.flouciQrCodeUrl} alt="QR Flouci" className="w-14 h-14 object-contain rounded-lg border-2 border-slate-300 p-0.5 bg-white cursor-pointer hover:scale-105 transition" onClick={() => setPreviewQrCodeModal(settingsForm.flouciQrCodeUrl || null)} />
                            <span className="text-xs text-emerald-800 font-black">✓ Code QR Actif (Cliquer pour zoomer)</span>
                          </div>
                        ) : (
                          <label className="cursor-pointer flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-slate-800 text-xs font-black transition">
                            <Upload className="w-4 h-4 text-emerald-600" />
                            <span>Ajouter un QR Code Flouci</span>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleQrFileUpload(e, (url) => setSettingsForm({ ...settingsForm, flouciQrCodeUrl: url }))} />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: METHODES PERSONNALISEES / AJOUTEES PAR L'ADMIN */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <span>✨ Méthodes Personnalisées Ajoutées :</span>
                    <span className="bg-slate-200 text-slate-900 px-2.5 py-0.5 rounded-full text-xs font-black border border-slate-300">
                      {(settingsForm.customMethods || []).length}
                    </span>
                  </div>
                </div>

                {(settingsForm.customMethods || []).length === 0 ? (
                  <div className="p-8 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-2.5">
                    <CreditCard className="w-10 h-10 text-slate-400 mx-auto" />
                    <p className="text-sm font-black text-slate-900">Aucune méthode personnalisée configurée</p>
                    <p className="text-xs font-bold text-slate-600">
                      Vous pouvez ajouter des méthodes telles que Virement Bancaire (RIB), Sobflous, Mandat Minute, Western Union, etc.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddMethodModalOpen(true)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl shadow-md transition inline-flex items-center gap-1.5 mt-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Ajouter ma première méthode</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(settingsForm.customMethods || []).map((method) => (
                      <div key={method.id} className="p-5 bg-white rounded-2xl border-2 border-slate-200 space-y-3.5 shadow-xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{method.icon || "💳"}</span>
                            <span className="text-sm font-black text-slate-950">{method.name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleCustomMethod(method.id)}
                              className={`px-3 py-1 rounded-full text-xs font-black border transition cursor-pointer shadow-xs ${
                                method.enabled
                                  ? "bg-emerald-600 text-white border-emerald-700"
                                  : "bg-slate-300 text-slate-900 border-slate-400"
                              }`}
                            >
                              {method.enabled ? "✓ Actif" : "✕ Inactif"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCustomMethod(method.id, method.name)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-700 rounded-lg border border-rose-300 transition cursor-pointer"
                              title="Supprimer cette méthode"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="block text-xs font-black text-slate-900 mb-1">Numéro de Compte / RIB / Identifiant :</label>
                            <input
                              type="text"
                              value={method.accountNumber}
                              onChange={(e) => handleUpdateCustomMethodField(method.id, "accountNumber", e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-none focus:border-indigo-600 focus:bg-white"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-black text-slate-900 mb-1">Nom du Titulaire :</label>
                            <input
                              type="text"
                              value={method.accountHolder}
                              onChange={(e) => handleUpdateCustomMethodField(method.id, "accountHolder", e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-none focus:border-indigo-600 focus:bg-white"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-black text-slate-900 mb-1">Instructions :</label>
                            <textarea
                              rows={2}
                              value={method.instructions}
                              onChange={(e) => handleUpdateCustomMethodField(method.id, "instructions", e.target.value)}
                              className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-none focus:border-indigo-600 focus:bg-white"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-black text-slate-900 mb-1 flex items-center justify-between">
                              <span className="flex items-center gap-1.5"><QrCode className="w-4 h-4 text-indigo-600" /> Schéma / Code QR :</span>
                              {method.qrCodeUrl && (
                                <button type="button" onClick={() => handleUpdateCustomMethodField(method.id, "qrCodeUrl", "")} className="text-xs font-bold text-rose-600 hover:underline">Supprimer QR</button>
                              )}
                            </label>
                            {method.qrCodeUrl ? (
                              <div className="flex items-center gap-3 p-2 bg-indigo-50/50 rounded-xl border-2 border-slate-300">
                                <img src={method.qrCodeUrl} alt="QR" className="w-14 h-14 object-contain rounded-lg border-2 border-slate-300 p-0.5 bg-white cursor-pointer hover:scale-105 transition" onClick={() => setPreviewQrCodeModal(method.qrCodeUrl || null)} />
                                <span className="text-xs text-emerald-800 font-black">✓ Code QR Actif (Cliquer pour zoomer)</span>
                              </div>
                            ) : (
                              <label className="cursor-pointer flex items-center justify-center gap-2 py-2 px-3 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-slate-800 text-xs font-black transition">
                                <Upload className="w-4 h-4 text-indigo-600" />
                                <span>Ajouter une image QR Code</span>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleQrFileUpload(e, (url) => handleUpdateCustomMethodField(method.id, "qrCodeUrl", url))} />
                              </label>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t-2 border-slate-200 flex items-center justify-between">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-600/30 transition cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Enregistrer Toutes les Coordonnées</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* Quick Edit Exact Credits Modal */}
      {editingCreditsUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-150">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-100">
              <h4 className="text-sm font-black text-slate-950 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                Modifier le Solde de Crédits
              </h4>
              <button
                onClick={() => setEditingCreditsUser(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomCredits} className="space-y-3.5 text-xs">
              <div className="p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl">
                <div className="font-black text-slate-950 text-sm">{editingCreditsUser.name}</div>
                <div className="text-xs font-bold text-slate-700">{editingCreditsUser.email}</div>
              </div>

              <div>
                <label className="block text-slate-950 font-black mb-1.5 text-xs">Nouveau solde exact de crédits :</label>
                <input
                  type="number"
                  min={0}
                  max={99999}
                  value={customCreditsValue}
                  onChange={(e) => setCustomCreditsValue(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-950 font-black text-base focus:outline-none focus:border-amber-500 focus:bg-white"
                  autoFocus
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-2 border-t-2 border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCreditsUser(null)}
                  className="w-1/2 py-2.5 text-slate-700 hover:text-slate-950 font-extrabold cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md transition cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. Modal Visualisation du Reçu */}
      {selectedReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-100">
              <h4 className="text-xs font-black text-slate-950 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-600" />
                Justificatif / Capture d'écran du client
              </h4>
              <button
                onClick={() => setSelectedReceiptUrl(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-100 p-2 rounded-2xl border-2 border-slate-200 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedReceiptUrl}
                alt="Reçu client"
                className="max-h-[60vh] max-w-full object-contain rounded-xl"
              />
            </div>

            <button
              onClick={() => setSelectedReceiptUrl(null)}
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-md cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* 2. Modal Motif de Refus */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-100">
              <h4 className="text-xs font-black text-rose-700 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                Motif du Refus de Paiement
              </h4>
              <button
                onClick={() => setRejectingRequestId(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-black text-slate-950">
                Indiquez la raison du refus (affichée au client) :
              </label>
              <textarea
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                className="w-full p-3 bg-slate-50 border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-none focus:border-rose-600 focus:bg-white"
                placeholder="Ex: Montant reçu incomplet, Capture illisible..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingRequestId(null)}
                className="px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:text-slate-950 cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
              >
                Confirmer le Refus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal AJOUTER / CREER UN COMPTE (Admin ou Utilisateur) */}
      {isAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in zoom-in-95 duration-150">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-100">
              <h4 className="text-sm font-black text-slate-950 flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-600" />
                Créer un Nouveau Compte
              </h4>
              <button
                onClick={() => setIsAddUserModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
              {/* Type de compte (Rôle) */}
              <div>
                <label className="block text-slate-950 font-black mb-1.5 text-xs">Type de compte (Rôle) :</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewUserRole("user");
                      setNewUserCredits(5);
                    }}
                    className={`p-3 rounded-xl border-2 text-left flex items-center gap-2 transition cursor-pointer ${
                      newUserRole === "user"
                        ? "border-blue-600 bg-blue-50 text-blue-950 font-black ring-2 ring-blue-500/20"
                        : "border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-lg">👤</span>
                    <div>
                      <div className="text-xs font-black text-slate-950">Candidat</div>
                      <div className="text-xs text-slate-600 font-semibold">Utilisateur standard</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewUserRole("admin");
                      setNewUserCredits(999);
                    }}
                    className={`p-3 rounded-xl border-2 text-left flex items-center gap-2 transition cursor-pointer ${
                      newUserRole === "admin"
                        ? "border-rose-600 bg-rose-50 text-rose-950 font-black ring-2 ring-rose-500/20"
                        : "border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-lg">🛡️</span>
                    <div>
                      <div className="text-xs font-black text-slate-950">Administrateur</div>
                      <div className="text-xs text-slate-600 font-semibold">Supervision complète</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-950 font-black mb-1 text-xs">Nom complet :</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder={newUserRole === "admin" ? "Ex: Rami GOUADER (Admin)" : "Ex: Yassine Ben Salem"}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-950 font-bold focus:outline-none focus:border-rose-600 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-950 font-black mb-1 text-xs">Email de connexion :</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder={newUserRole === "admin" ? "admin2@my-cv.tn" : "candidat@example.com"}
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-950 font-bold focus:outline-none focus:border-rose-600 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-950 font-black mb-1 text-xs">Mot de passe provisoire :</label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="password123"
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-950 font-bold focus:outline-none focus:border-rose-600 focus:bg-white"
                />
              </div>

              {newUserRole === "user" ? (
                <div>
                  <label className="block text-slate-950 font-black mb-1 text-xs">Solde initial de crédits offerts :</label>
                  <input
                    type="number"
                    min={0}
                    max={1000}
                    value={newUserCredits}
                    onChange={(e) => setNewUserCredits(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-950 focus:outline-none focus:border-rose-600 focus:bg-white font-black"
                  />
                  <p className="text-xs font-semibold text-slate-600 mt-1">✨ Par défaut : 5 crédits de bienvenue.</p>
                </div>
              ) : (
                <div className="p-3 bg-rose-50 border-2 border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                  <div className="font-black flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-rose-600" />
                    <span>Privilèges Administrateur Totaux</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-semibold">
                    Ce compte aura accès à <strong>/admin</strong> pour valider les virements D17/Flouci, gérer les utilisateurs et configurer les paramètres de paiement (crédits illimités 999 Cr).
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t-2 border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModal(false)}
                  className="px-3.5 py-2 text-slate-700 hover:text-slate-950 font-black cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-xl shadow-md cursor-pointer"
                >
                  {newUserRole === "admin" ? "Créer Compte Admin" : "Créer Compte Candidat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal AJOUTER UNE NOUVELLE METHODE DE PAIEMENT (Custom) */}
      {isAddMethodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b-2 border-slate-100">
              <h4 className="text-sm font-black text-slate-950 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Ajouter une Nouvelle Méthode de Paiement
              </h4>
              <button
                onClick={() => setIsAddMethodModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomMethod} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-slate-950 font-black mb-1 text-xs">Icône :</label>
                  <select
                    value={newMethodIcon}
                    onChange={(e) => setNewMethodIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-center text-base font-bold"
                  >
                    <option value="🏦">🏦 Banque / RIB</option>
                    <option value="💳">💳 Carte Bancaire</option>
                    <option value="📱">📱 Mobile App</option>
                    <option value="💸">💸 Mandat</option>
                    <option value="🌐">🌐 Web / En ligne</option>
                    <option value="🪙">🪙 Portefeuille</option>
                    <option value="⚡">⚡ Instantané</option>
                    <option value="🤝">🤝 En main propre</option>
                  </select>
                </div>

                <div className="col-span-3">
                  <label className="block text-slate-950 font-black mb-1 text-xs">Nom de la méthode :</label>
                  <input
                    type="text"
                    value={newMethodName}
                    onChange={(e) => setNewMethodName(e.target.value)}
                    placeholder="Ex: Virement Bancaire (RIB) / Sobflous / Western Union"
                    className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-950 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-950 font-black mb-1 text-xs">Numéro de Compte / RIB / Identifiant / Lien :</label>
                <input
                  type="text"
                  value={newMethodAccountNumber}
                  onChange={(e) => setNewMethodAccountNumber(e.target.value)}
                  placeholder="Ex: RIB: 08 000 000123456789 20 (Attijari Bank) ou contact@sobflous.tn"
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-950 font-mono font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-950 font-black mb-1 text-xs">Nom du Titulaire du Compte :</label>
                <input
                  type="text"
                  value={newMethodAccountHolder}
                  onChange={(e) => setNewMethodAccountHolder(e.target.value)}
                  placeholder="Ex: SOCIETE MY-CV TUNISIE SARL"
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-950 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-950 font-black mb-1 text-xs">Instructions précises pour le client :</label>
                <textarea
                  rows={2}
                  value={newMethodInstructions}
                  onChange={(e) => setNewMethodInstructions(e.target.value)}
                  placeholder="Ex: Effectuez le transfert vers notre RIB bancaire puis téléversez l'ordre de virement ou le reçu."
                  className="w-full px-3 py-2 bg-slate-50 border-2 border-slate-300 rounded-xl text-slate-950 font-bold focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              {/* Schéma / Image Code QR pour Paiement par Scan */}
              <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-950 font-black text-xs flex items-center gap-1.5">
                    <QrCode className="w-4 h-4 text-indigo-600" />
                    <span>Schéma / Image Code QR pour Paiement par Code (Optionnel) :</span>
                  </label>
                  {newMethodQrCode && (
                    <button
                      type="button"
                      onClick={() => setNewMethodQrCode("")}
                      className="text-xs text-rose-600 hover:text-rose-800 font-bold underline cursor-pointer"
                    >
                      Supprimer l'image
                    </button>
                  )}
                </div>

                {newMethodQrCode ? (
                  <div className="flex items-center gap-3 p-2 bg-white rounded-xl border-2 border-indigo-200 shadow-xs">
                    <img
                      src={newMethodQrCode}
                      alt="Aperçu Code QR"
                      className="w-16 h-16 object-contain rounded-lg border-2 border-slate-300 p-1 bg-white cursor-pointer hover:scale-105 transition"
                      onClick={() => setPreviewQrCodeModal(newMethodQrCode)}
                    />
                    <div className="space-y-1">
                      <div className="text-xs font-black text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Code QR prêt à être scanné
                      </div>
                      <p className="text-xs font-semibold text-slate-600">
                        Les candidats pourront scanner ce schéma directement depuis leur mobile pour payer.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="cursor-pointer flex items-center justify-center gap-2 py-2.5 px-3 bg-white hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl text-slate-900 font-black text-xs transition">
                      <Upload className="w-4 h-4 text-indigo-600" />
                      <span>Téléverser une image de QR Code (PNG, JPG)</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleQrFileUpload(e, setNewMethodQrCode)}
                      />
                    </label>
                    <input
                      type="text"
                      value={newMethodQrCode}
                      onChange={(e) => setNewMethodQrCode(e.target.value)}
                      placeholder="Ou collez ici une URL d'image QR Code (https://...)"
                      className="w-full px-3 py-2 bg-white border-2 border-slate-300 rounded-xl text-xs font-bold text-slate-950 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t-2 border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMethodModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold border border-slate-300 transition cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-xl shadow-md shadow-indigo-600/30 transition cursor-pointer"
                >
                  Ajouter & Activer la Méthode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. Modal Visualisation Plein Écran du Code QR */}
      {previewQrCodeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-white border-2 border-slate-200 rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl text-center">
            <div className="flex items-center justify-between pb-2 border-b-2 border-slate-100">
              <h4 className="text-xs font-black text-slate-950 flex items-center gap-1.5">
                <QrCode className="w-4 h-4 text-indigo-600" />
                Schéma / Code QR de Paiement
              </h4>
              <button
                onClick={() => setPreviewQrCodeModal(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl flex items-center justify-center">
              <img
                src={previewQrCodeModal}
                alt="Code QR Plein Écran"
                className="max-h-72 max-w-full object-contain rounded-xl shadow-md bg-white p-2"
              />
            </div>

            <p className="text-xs font-bold text-slate-700">
              Ce code QR sera affiché aux candidats pour un scan direct lors de leur paiement.
            </p>

            <button
              type="button"
              onClick={() => setPreviewQrCodeModal(null)}
              className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-md cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
