"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserAccount } from "@/types/auth";
import { 
  getStoredUsers, getCurrentUser, adminUpdateUserCredits, 
  adminToggleUserStatus, adminDeleteUser, adminDeleteAllUsers, registerNewUser, logoutUser,
  fetchServerUsers
} from "@/lib/auth/authStore";
import { 
  getPaymentSettings, savePaymentSettings,
  approvePaymentRequest, rejectPaymentRequest, fetchServerPaymentRequests,
  PaymentRequest, PaymentSettings, CustomPaymentMethod
} from "@/lib/payments/paymentStore";
import { 
  Users, Ticket, DollarSign, Shield, ShieldCheck, Search, 
  Plus, PlusCircle, MinusCircle, Ban, CheckCircle2, Trash2, 
  ArrowLeft, RefreshCw, LogOut, FileText, Activity, AlertCircle, Edit3,
  CreditCard, Clock, XCircle, Eye, Settings, Check, Phone, Landmark, MessageSquare
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

  // Payment Requests State
  const [paymentRequests, setPaymentRequests] = useState<PaymentRequest[]>([]);
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(null);
  const [rejectionReasonInput, setRejectionReasonInput] = useState<string>("");

  // Payment Settings State
  const [settingsForm, setSettingsForm] = useState<PaymentSettings>({
    d17PhoneNumber: "",
    d17AccountHolder: "",
    d17Instructions: "",
    d17Enabled: true,
    flouciAccount: "",
    flouciAccountHolder: "",
    flouciInstructions: "",
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

  const [toastMessage, setToastMessage] = useState<string>("");

  const refreshAllData = async () => {
    const sUsers = await fetchServerUsers();
    setUsers(sUsers);
    const reqs = await fetchServerPaymentRequests();
    setPaymentRequests(reqs);
    setSettingsForm(getPaymentSettings());
  };

  useEffect(() => {
    const active = getCurrentUser();
    setCurrentUser(active);

    if (!active || active.role !== "admin") {
      router.push("/admin/login");
      return;
    }

    refreshAllData();

    const handleSync = () => {
      refreshAllData();
    };

    window.addEventListener("storage", handleSync);
    window.addEventListener("payment_requests_updated", handleSync);
    const interval = setInterval(refreshAllData, 2000);

    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("payment_requests_updated", handleSync);
      clearInterval(interval);
    };
  }, [router, activeTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // User Actions
  const handleUpdateCredits = (userId: string, amount: number) => {
    const updated = adminUpdateUserCredits(userId, amount);
    if (updated) {
      setUsers(getStoredUsers());
      showToast(`Crédits mis à jour pour ${updated.name} (${updated.credits} crédits).`);
    }
  };

  const handleToggleStatus = (userId: string) => {
    const updated = adminToggleUserStatus(userId);
    if (updated) {
      setUsers(getStoredUsers());
      showToast(`Statut de ${updated.name} modifié en ${updated.status}.`);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (confirm(`Confirmez-vous la suppression définitive du compte de ${name} ?`)) {
      adminDeleteUser(userId);
      await refreshAllData();
      showToast(`Compte de ${name} définitivement supprimé.`);
    }
  };

  const handleDeleteAllUsers = async () => {
    if (confirm("⚠️ ATTENTION : Confirmez-vous la suppression définitive de TOUS les comptes utilisateurs ? Seul le compte Administrateur sera conservé.")) {
      adminDeleteAllUsers();
      await refreshAllData();
      showToast("Tous les comptes utilisateurs ont été définitivement supprimés.");
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    const res = registerNewUser(newUserName, newUserEmail, newUserPassword || "password123");
    if (res.success) {
      setUsers(getStoredUsers());
      setIsAddUserModal(false);
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      showToast("Nouvel utilisateur ajouté avec 5 crédits offerts !");
    } else {
      alert(res.error || "Erreur lors de la création.");
    }
  };

  // Payment Actions
  const handleApprovePayment = async (reqId: string, clientName: string, credits: number) => {
    const res = await approvePaymentRequest(reqId);
    if (res.success) {
      await refreshAllData();
      showToast(`Paiement validé ! +${credits} crédits ajoutés à ${clientName}.`);
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
    const res = await rejectPaymentRequest(rejectingRequestId, rejectionReasonInput);
    if (res.success) {
      await refreshAllData();
      setRejectingRequestId(null);
      showToast("Demande de paiement refusée avec motif transmis.");
    }
  };

  // Settings Actions
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    savePaymentSettings(settingsForm);
    showToast("Coordonnées de paiement enregistrées avec succès !");
  };

  // Custom Method Management
  const handleCreateCustomMethod = (e: React.FormEvent) => {
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
      enabled: true,
    };

    const updatedMethods = [...(settingsForm.customMethods || []), newMethod];
    const updatedSettings = { ...settingsForm, customMethods: updatedMethods };
    setSettingsForm(updatedSettings);
    savePaymentSettings(updatedSettings);

    // Reset Form & Close Modal
    setNewMethodName("");
    setNewMethodIcon("🏦");
    setNewMethodAccountNumber("");
    setNewMethodAccountHolder("");
    setNewMethodInstructions("");
    setIsAddMethodModalOpen(false);

    showToast(`Nouvelle méthode « ${newMethod.name} » ajoutée avec succès !`);
  };

  const handleDeleteCustomMethod = (id: string, name: string) => {
    if (confirm(`Voulez-vous supprimer définitivement la méthode de paiement « ${name} » ?`)) {
      const updatedMethods = (settingsForm.customMethods || []).filter((m) => m.id !== id);
      const updatedSettings = { ...settingsForm, customMethods: updatedMethods };
      setSettingsForm(updatedSettings);
      savePaymentSettings(updatedSettings);
      showToast(`Méthode « ${name} » supprimée.`);
    }
  };

  const handleToggleCustomMethod = (id: string) => {
    const updatedMethods = (settingsForm.customMethods || []).map((m) => {
      if (m.id === id) {
        return { ...m, enabled: !m.enabled };
      }
      return m;
    });
    const updatedSettings = { ...settingsForm, customMethods: updatedMethods };
    setSettingsForm(updatedSettings);
    savePaymentSettings(updatedSettings);
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
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
          <span>📱</span> D17
        </span>
      );
    }
    if (method === "flouci") {
      return (
        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
          <span>🇹🇳</span> Flouci / RIB
        </span>
      );
    }
    const custom = (settingsForm.customMethods || []).find((m) => m.id === method || m.name.toLowerCase() === method.toLowerCase());
    return (
      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 inline-flex items-center gap-1">
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="h-16 border-b border-slate-200 bg-white/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
            AD
          </div>
          <div>
            <h1 className="text-sm font-black text-slate-950 flex items-center gap-1.5">
              <span>Portail Administrateur</span>
              <span className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 font-bold">
                my-cv.tn
              </span>
            </h1>
            <p className="text-[10px] text-slate-500">Gestion des utilisateurs & méthodes de paiement</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/builder")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 rounded-xl border border-slate-200 transition shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Éditeur de CV</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-700 hover:text-white bg-rose-50 hover:bg-rose-600 rounded-xl border border-rose-200 transition shadow-2xs"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-grow p-6 max-w-7xl w-full mx-auto space-y-6">
        
        {/* KPI Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Utilisateurs Inscrits</span>
              <Users className="w-4 h-4 text-blue-600" />
            </div>
            <div className="text-2xl font-black text-slate-950">{users.length}</div>
            <div className="text-[10px] text-slate-500">Comptes actifs sur my-cv.tn</div>
          </div>

          <div 
            onClick={() => setActiveTab("payments")}
            className="p-4 bg-white border border-slate-200/90 hover:border-amber-400 rounded-2xl space-y-1 shadow-2xs cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Paiements en Attente</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-600 flex items-center gap-2">
              <span>{pendingCount}</span>
              {pendingCount > 0 && (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold animate-pulse">
                  À vérifier
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500">Demandes D17, Flouci & Autres</div>
          </div>

          <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Volume Ventes Validées</span>
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-2xl font-black text-emerald-600">{totalVolumeTND.toFixed(3)} <span className="text-sm font-bold">TND</span></div>
            <div className="text-[10px] text-slate-500">Virements approuvés</div>
          </div>

          <div className="p-4 bg-white border border-slate-200/90 rounded-2xl space-y-1 shadow-2xs">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Méthodes Actives</span>
              <CreditCard className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-2xl font-black text-rose-600">
              {(settingsForm.d17Enabled !== false ? 1 : 0) + (settingsForm.flouciEnabled !== false ? 1 : 0) + ((settingsForm.customMethods || []).filter(m => m.enabled).length)}
            </div>
            <div className="text-[10px] text-slate-500">Canaux de paiement activés</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 w-fit">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "users"
                ? "bg-white text-slate-950 shadow-xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Gestion Utilisateurs ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "payments"
                ? "bg-white text-slate-950 shadow-xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-600" />
            <span>Vérification Paiements</span>
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "settings"
                ? "bg-white text-slate-950 shadow-xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-950"
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-emerald-600" />
            <span>Configuration des Paiements & Méthodes</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: USERS MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === "users" && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-5 shadow-2xs">
            {/* Top Bar Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-700 rounded-xl font-semibold"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs uniquement</option>
                  <option value="suspended">Suspendus uniquement</option>
                </select>

                <button
                  onClick={() => setIsAddUserModal(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-sm transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter Utilisateur</span>
                </button>

                <button
                  onClick={handleDeleteAllUsers}
                  className="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition"
                  title="Supprimer tous les utilisateurs"
                >
                  Tout Supprimer
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Utilisateur</th>
                    <th className="p-3.5">Email</th>
                    <th className="p-3.5">Rôle</th>
                    <th className="p-3.5">Solde Crédits</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5 text-right">Actions rapides</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-slate-400">
                        Aucun utilisateur trouvé.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5 font-bold text-slate-950 flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs">
                            {u.name.charAt(0).toUpperCase()}
                          </div>
                          <span>{u.name}</span>
                        </td>
                        <td className="p-3.5 text-slate-600">{u.email}</td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            u.role === "admin"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-slate-100 text-slate-700"
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3.5">
                          <div className="flex items-center gap-2 font-black text-amber-700 text-sm">
                            <Ticket className="w-3.5 h-3.5 text-amber-600" />
                            <span>{u.credits ?? 0}</span>
                            <div className="flex items-center gap-1 ml-1">
                              <button
                                onClick={() => handleUpdateCredits(u.id, 5)}
                                className="p-1 hover:bg-slate-100 rounded text-emerald-600 font-bold"
                                title="+5 Crédits"
                              >
                                +5
                              </button>
                              <button
                                onClick={() => handleUpdateCredits(u.id, -5)}
                                className="p-1 hover:bg-slate-100 rounded text-rose-600 font-bold"
                                title="-5 Crédits"
                              >
                                -5
                              </button>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}>
                            {u.status === "active" ? "Actif" : "Suspendu"}
                          </span>
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
                            title={u.status === "active" ? "Suspendre ce compte" : "Réactiver ce compte"}
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                          {u.role !== "admin" && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600 transition"
                              title="Supprimer définitivement"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
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
        {/* TAB 2: PAYMENTS VERIFICATION */}
        {/* ========================================================================= */}
        {activeTab === "payments" && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 space-y-5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">Filtrer par statut :</span>
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button
                    onClick={() => setFilterPaymentStatus("pending")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      filterPaymentStatus === "pending"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    En attente ({pendingCount})
                  </button>
                  <button
                    onClick={() => setFilterPaymentStatus("approved")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      filterPaymentStatus === "approved"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Validés
                  </button>
                  <button
                    onClick={() => setFilterPaymentStatus("rejected")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      filterPaymentStatus === "rejected"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Refusés
                  </button>
                  <button
                    onClick={() => setFilterPaymentStatus("all")}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                      filterPaymentStatus === "all"
                        ? "bg-slate-800 text-white shadow-xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    Tous
                  </button>
                </div>
              </div>
            </div>

            {/* Payments Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Client</th>
                    <th className="p-3.5">Méthode</th>
                    <th className="p-3.5">Montant (TND)</th>
                    <th className="p-3.5">Crédits</th>
                    <th className="p-3.5">Preuve / Reçu</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5 text-right">Décision Admin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        Aucune demande trouvée pour ce filtre.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-slate-950">{p.userName}</div>
                          <div className="text-[11px] text-slate-500">{p.userEmail}</div>
                        </td>
                        <td className="p-3.5">
                          {getMethodBadge(p.method)}
                        </td>
                        <td className="p-3.5 font-bold text-slate-950">
                          {p.amountTND.toFixed(3)} DT
                        </td>
                        <td className="p-3.5 font-black text-amber-600">
                          +{p.credits} Cr
                        </td>
                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => setSelectedReceiptUrl(p.receiptImageUrl)}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-600" />
                            <span>Voir capture</span>
                          </button>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            p.status === "approved"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                              : p.status === "rejected"
                              ? "bg-rose-100 text-rose-800 border border-rose-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300 animate-pulse"
                          }`}>
                            {p.status === "approved" ? "Validé" : p.status === "rejected" ? "Refusé" : "En attente"}
                          </span>
                          {p.rejectionReason && (
                            <div className="text-[10px] text-rose-600 mt-1 italic max-w-xs">
                              Motif : {p.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-500 text-[11px]">
                          {new Date(p.createdAt).toLocaleString("fr-FR")}
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          {p.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleApprovePayment(p.id, p.userName, p.credits)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-sm transition"
                              >
                                Valider & Créditer
                              </button>
                              <button
                                onClick={() => handleOpenReject(p.id)}
                                className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold border border-rose-300 transition"
                              >
                                Refuser
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-400 text-[11px] italic">
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
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-950 flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-600" />
                  Configuration des Coordonnées & Méthodes de Paiement
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configurez les comptes de réception et ajoutez de nouvelles méthodes personnalisées (Virement RIB, Sobflous, Mandat, etc.).
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsAddMethodModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-sm transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Ajouter une Méthode de Paiement</span>
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              {/* SECTION 1: METHODES STANDARDS TUNISIENNES */}
              <div className="space-y-4">
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                  🇹🇳 Méthodes Standards Locales :
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* D17 Settings Card */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-rose-700 flex items-center gap-2">
                        <Phone className="w-4 h-4 text-rose-600" />
                        <span>📱 D17 (Poste Tunisienne)</span>
                      </h4>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600">
                        <input
                          type="checkbox"
                          checked={settingsForm.d17Enabled !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, d17Enabled: e.target.checked })}
                          className="rounded text-rose-600 focus:ring-rose-500"
                        />
                        <span>{settingsForm.d17Enabled !== false ? "Actif" : "Inactif"}</span>
                      </label>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Numéro D17 :</label>
                        <input
                          type="text"
                          value={settingsForm.d17PhoneNumber}
                          onChange={(e) => setSettingsForm({ ...settingsForm, d17PhoneNumber: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                          placeholder="Ex: 98 123 456"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nom du Titulaire :</label>
                        <input
                          type="text"
                          value={settingsForm.d17AccountHolder}
                          onChange={(e) => setSettingsForm({ ...settingsForm, d17AccountHolder: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                          placeholder="Ex: my-cv.tn Administration"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Instructions client :</label>
                        <textarea
                          rows={2}
                          value={settingsForm.d17Instructions}
                          onChange={(e) => setSettingsForm({ ...settingsForm, d17Instructions: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Flouci Settings Card */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-2">
                        <Landmark className="w-4 h-4 text-emerald-600" />
                        <span>🇹🇳 Flouci & Virement</span>
                      </h4>
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-slate-600">
                        <input
                          type="checkbox"
                          checked={settingsForm.flouciEnabled !== false}
                          onChange={(e) => setSettingsForm({ ...settingsForm, flouciEnabled: e.target.checked })}
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span>{settingsForm.flouciEnabled !== false ? "Actif" : "Inactif"}</span>
                      </label>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Lien / RIB Flouci :</label>
                        <input
                          type="text"
                          value={settingsForm.flouciAccount}
                          onChange={(e) => setSettingsForm({ ...settingsForm, flouciAccount: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                          placeholder="Ex: flouci.me/mycv_tn ou RIB"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Nom du Titulaire :</label>
                        <input
                          type="text"
                          value={settingsForm.flouciAccountHolder}
                          onChange={(e) => setSettingsForm({ ...settingsForm, flouciAccountHolder: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                          placeholder="Ex: SARL MY-CV TN"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Instructions client :</label>
                        <textarea
                          rows={2}
                          value={settingsForm.flouciInstructions}
                          onChange={(e) => setSettingsForm({ ...settingsForm, flouciInstructions: e.target.value })}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: METHODES PERSONNALISEES / AJOUTEES PAR L'ADMIN */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <span>✨ Méthodes Personnalisées Ajoutées :</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.2 rounded-full text-[10px] font-bold">
                      {(settingsForm.customMethods || []).length}
                    </span>
                  </div>
                </div>

                {(settingsForm.customMethods || []).length === 0 ? (
                  <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl text-center space-y-2">
                    <CreditCard className="w-8 h-8 text-slate-400 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">Aucune méthode personnalisée configurée</p>
                    <p className="text-[11px] text-slate-500">
                      Vous pouvez ajouter des méthodes telles que Virement Bancaire (RIB), Sobflous, Mandat Minute, Western Union, etc.
                    </p>
                    <button
                      type="button"
                      onClick={() => setIsAddMethodModalOpen(true)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-xs transition inline-flex items-center gap-1.5 mt-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter ma première méthode</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(settingsForm.customMethods || []).map((method) => (
                      <div key={method.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{method.icon || "💳"}</span>
                            <span className="text-xs font-bold text-slate-900">{method.name}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleCustomMethod(method.id)}
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                                method.enabled
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-slate-200 text-slate-600 border-slate-300"
                              }`}
                            >
                              {method.enabled ? "✓ Actif" : "✕ Inactif"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCustomMethod(method.id, method.name)}
                              className="p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition"
                              title="Supprimer cette méthode"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Numéro de Compte / RIB / Identifiant :</label>
                            <input
                              type="text"
                              value={method.accountNumber}
                              onChange={(e) => handleUpdateCustomMethodField(method.id, "accountNumber", e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Nom du Titulaire :</label>
                            <input
                              type="text"
                              value={method.accountHolder}
                              onChange={(e) => handleUpdateCustomMethodField(method.id, "accountHolder", e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-semibold text-slate-500 mb-0.5">Instructions :</label>
                            <textarea
                              rows={2}
                              value={method.instructions}
                              onChange={(e) => handleUpdateCustomMethodField(method.id, "instructions", e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-md transition cursor-pointer"
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

      {/* 1. Modal Visualisation du Reçu */}
      {selectedReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-600" />
                Justificatif / Capture d'écran du client
              </h4>
              <button
                onClick={() => setSelectedReceiptUrl(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-100 p-2 rounded-2xl border border-slate-200 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedReceiptUrl}
                alt="Reçu client"
                className="max-h-[60vh] max-w-full object-contain rounded-xl"
              />
            </div>

            <button
              onClick={() => setSelectedReceiptUrl(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* 2. Modal Motif de Refus */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-xs font-bold text-rose-600 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                Motif du Refus de Paiement
              </h4>
              <button
                onClick={() => setRejectingRequestId(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700">
                Indiquez la raison du refus (affichée au client) :
              </label>
              <textarea
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-rose-500"
                placeholder="Ex: Montant reçu incomplet, Capture illisible..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectingRequestId(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-sm"
              >
                Confirmer le Refus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Ajouter Utilisateur */}
      {isAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h4 className="text-sm font-bold text-slate-950 flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-600" />
                Ajouter un Nouvel Utilisateur
              </h4>
              <button
                onClick={() => setIsAddUserModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nom complet :</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ex: Yassine Ben Salem"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Email :</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="yassine@example.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Mot de passe provisoire :</label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="password123"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-[11px] text-rose-700">
                ✨ L'utilisateur recevra automatiquement <strong>5 crédits de bienvenue</strong> à la création.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModal(false)}
                  className="px-3.5 py-2 text-slate-500 hover:text-slate-800 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl shadow-sm"
                >
                  Créer le Compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Modal AJOUTER UNE NOUVELLE METHODE DE PAIEMENT (Custom) */}
      {isAddMethodModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h4 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-indigo-600" />
                Ajouter une Nouvelle Méthode de Paiement
              </h4>
              <button
                onClick={() => setIsAddMethodModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomMethod} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="block text-slate-700 font-bold mb-1">Icône :</label>
                  <select
                    value={newMethodIcon}
                    onChange={(e) => setNewMethodIcon(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center text-base"
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
                  <label className="block text-slate-700 font-bold mb-1">Nom de la méthode :</label>
                  <input
                    type="text"
                    value={newMethodName}
                    onChange={(e) => setNewMethodName(e.target.value)}
                    placeholder="Ex: Virement Bancaire (RIB) / Sobflous / Western Union"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-semibold"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Numéro de Compte / RIB / Identifiant / Lien :</label>
                <input
                  type="text"
                  value={newMethodAccountNumber}
                  onChange={(e) => setNewMethodAccountNumber(e.target.value)}
                  placeholder="Ex: RIB: 08 000 000123456789 20 (Attijari Bank) ou contact@sobflous.tn"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Nom du Titulaire du Compte :</label>
                <input
                  type="text"
                  value={newMethodAccountHolder}
                  onChange={(e) => setNewMethodAccountHolder(e.target.value)}
                  placeholder="Ex: SOCIETE MY-CV TUNISIE SARL"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Instructions précises pour le client :</label>
                <textarea
                  rows={2}
                  value={newMethodInstructions}
                  onChange={(e) => setNewMethodInstructions(e.target.value)}
                  placeholder="Ex: Effectuez le transfert vers notre RIB bancaire puis téléversez l'ordre de virement ou le reçu."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddMethodModalOpen(false)}
                  className="px-4 py-2 text-slate-500 hover:text-slate-800 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl shadow-sm transition"
                >
                  Ajouter & Activer la Méthode
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
