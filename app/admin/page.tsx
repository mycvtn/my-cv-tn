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
  getPaymentRequests, getPaymentSettings, savePaymentSettings,
  approvePaymentRequest, rejectPaymentRequest, fetchServerPaymentRequests,
  PaymentRequest, PaymentSettings
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
    flouciAccount: "",
    flouciAccountHolder: "",
    flouciInstructions: "",
  });

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
    const interval = setInterval(refreshAllData, 2000); // 2s polling from server

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
    showToast("Coordonnées D17 & Flouci enregistrées avec succès !");
  };

  const handleLogout = () => {
    logoutUser();
    router.push("/admin/login");
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2 text-xs font-bold animate-in slide-in-from-top-2 duration-150">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Admin Header */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white font-black text-sm shadow-md">
            AD
          </div>
          <div>
            <h1 className="text-sm font-black text-white flex items-center gap-1.5">
              <span>Portail Administrateur</span>
              <span className="text-[10px] bg-rose-600/30 text-rose-300 px-1.5 py-0.5 rounded border border-rose-500/30">
                my-cv.tn
              </span>
            </h1>
            <p className="text-[10px] text-slate-400">Gestion des utilisateurs & virements D17 / Flouci</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/builder")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Éditeur de CV</span>
          </button>

          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-rose-300 hover:text-white bg-rose-950/40 hover:bg-rose-900/60 rounded-xl border border-rose-800/40 transition"
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
          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Utilisateurs Inscrits</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-black text-white">{users.length}</div>
            <div className="text-[10px] text-slate-500">Comptes actifs sur my-cv.tn</div>
          </div>

          <div 
            onClick={() => setActiveTab("payments")}
            className="p-4 bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl space-y-1 shadow-lg cursor-pointer transition"
          >
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Paiements en Attente</span>
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-400 flex items-center gap-2">
              <span>{pendingCount}</span>
              {pendingCount > 0 && (
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold animate-pulse">
                  À vérifier
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-500">Demandes D17 & Flouci</div>
          </div>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Volume Ventes Validées</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-400">{totalVolumeTND.toFixed(3)} <span className="text-sm font-bold">TND</span></div>
            <div className="text-[10px] text-slate-500">Virements approuvés</div>
          </div>

          <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-1 shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs">
              <span>Solde Global Crédits</span>
              <Ticket className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-400">
              {users.reduce((sum, u) => sum + (u.credits || 0), 0)}
            </div>
            <div className="text-[10px] text-slate-500">Crédits en circulation</div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-fit">
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "users"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-blue-400" />
            <span>Gestion Utilisateurs ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === "payments"
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-amber-400" />
            <span>Vérification Paiements D17 / Flouci</span>
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
                ? "bg-slate-800 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paramètres Coordonnées D17 & Flouci</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: USERS LIST & MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === "users" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl animate-in fade-in duration-150">
            {/* Action & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <select
                  value={filterStatus}
                  onChange={(e: any) => setFilterStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs px-3 py-2 rounded-xl focus:outline-none"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="suspended">Suspendus</option>
                </select>

                <button
                  onClick={handleDeleteAllUsers}
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-xs font-bold rounded-xl transition"
                  title="Supprimer tous les comptes utilisateurs sauf Admin"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Vider Utilisateurs</span>
                </button>

                <button
                  onClick={() => setIsAddUserModal(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter Utilisateur</span>
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Utilisateur</th>
                    <th className="p-3.5">Rôle</th>
                    <th className="p-3.5">Solde Crédits</th>
                    <th className="p-3.5">Statut</th>
                    <th className="p-3.5">Inscrit le</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                          u.role === "admin" 
                            ? "bg-rose-950 text-rose-300 border border-rose-800/40" 
                            : "bg-slate-800 text-slate-300"
                        }`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-amber-400">
                        {u.credits} <span className="text-[10px] text-slate-500 font-normal">Crédits</span>
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === "active"
                            ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                            : "bg-rose-950/60 text-rose-400 border border-rose-800/40"
                        }`}>
                          {u.status === "active" ? "Actif" : "Suspendu"}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="p-3.5 text-right space-x-1.5">
                        <button
                          onClick={() => handleUpdateCredits(u.id, 10)}
                          className="px-2 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 rounded-lg border border-emerald-800/30 text-[11px] font-bold"
                          title="+10 Crédits"
                        >
                          +10 Cr
                        </button>
                        <button
                          onClick={() => handleUpdateCredits(u.id, -10)}
                          className="px-2 py-1 bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 rounded-lg border border-amber-800/30 text-[11px] font-bold"
                          title="-10 Crédits"
                        >
                          -10 Cr
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg"
                          title="Changer Statut"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                        {u.role !== "admin" && (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.name)}
                            className="p-1.5 text-rose-400 hover:text-rose-200 bg-rose-950/40 rounded-lg border border-rose-800/30"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: PAYMENT PROOFS & VALIDATION */}
        {/* ========================================================================= */}
        {activeTab === "payments" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-amber-400" />
                  Demandes de Paiement & Justificatifs D17 / Flouci
                </h3>
                <p className="text-xs text-slate-400">Vérifiez les captures d'écran des virements avant d'octroyer les crédits</p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(["all", "pending", "approved", "rejected"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterPaymentStatus(st)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition capitalize ${
                      filterPaymentStatus === st
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    {st === "all" ? "Tous" : st === "pending" ? "En attente" : st === "approved" ? "Validés" : "Refusés"}
                  </button>
                ))}
              </div>
            </div>

            {/* Payments Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950/80 text-[11px] uppercase font-bold text-slate-400 border-b border-slate-800">
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
                <tbody className="divide-y divide-slate-800/60">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500">
                        Aucune demande trouvée pour ce filtre.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5">
                          <div className="font-bold text-white">{p.userName}</div>
                          <div className="text-[11px] text-slate-400">{p.userEmail}</div>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                            p.method === "d17"
                              ? "bg-rose-950/80 text-rose-300 border border-rose-800/40"
                              : "bg-emerald-950/80 text-emerald-300 border border-emerald-800/40"
                          }`}>
                            {p.method}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-white">
                          {p.amountTND.toFixed(3)} DT
                        </td>
                        <td className="p-3.5 font-black text-amber-400">
                          +{p.credits} Cr
                        </td>
                        <td className="p-3.5">
                          <button
                            type="button"
                            onClick={() => setSelectedReceiptUrl(p.receiptImageUrl)}
                            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition"
                          >
                            <Eye className="w-3.5 h-3.5 text-blue-400" />
                            <span>Voir capture</span>
                          </button>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.status === "approved"
                              ? "bg-emerald-950 text-emerald-400 border border-emerald-800/40"
                              : p.status === "rejected"
                              ? "bg-rose-950 text-rose-400 border border-rose-800/40"
                              : "bg-amber-950 text-amber-400 border border-amber-800/40"
                          }`}>
                            {p.status === "approved" ? "Validé" : p.status === "rejected" ? "Refusé" : "En attente"}
                          </span>
                          {p.rejectionReason && (
                            <div className="text-[10px] text-rose-400 mt-1 italic max-w-xs">
                              Motif : {p.rejectionReason}
                            </div>
                          )}
                        </td>
                        <td className="p-3.5 text-slate-400 text-[11px]">
                          {new Date(p.createdAt).toLocaleString("fr-FR")}
                        </td>
                        <td className="p-3.5 text-right space-x-1.5">
                          {p.status === "pending" ? (
                            <>
                              <button
                                onClick={() => handleApprovePayment(p.id, p.userName, p.credits)}
                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold shadow-md transition"
                              >
                                Valider & Créditer
                              </button>
                              <button
                                onClick={() => handleOpenReject(p.id)}
                                className="px-2.5 py-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 rounded-xl text-xs font-bold border border-rose-800/50 transition"
                              >
                                Refuser
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-500 text-[11px] italic">
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
        {/* TAB 3: PAYMENT COORDINATES SETTINGS */}
        {/* ========================================================================= */}
        {activeTab === "settings" && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl animate-in fade-in duration-150">
            <form onSubmit={handleSaveSettings} className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-sm font-black text-white flex items-center gap-2">
                  <Settings className="w-4 h-4 text-emerald-400" />
                  Configuration des Coordonnées de Paiement
                </h3>
                <p className="text-xs text-slate-400">Ces informations seront affichées directement aux utilisateurs lors de leur demande de recharge.</p>
              </div>

              {/* D17 Settings */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-rose-400 flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Coordonnées D17 (Poste Tunisienne)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Numéro D17 :</label>
                    <input
                      type="text"
                      value={settingsForm.d17PhoneNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, d17PhoneNumber: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                      placeholder="Ex: 98 123 456"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nom du Titulaire :</label>
                    <input
                      type="text"
                      value={settingsForm.d17AccountHolder}
                      onChange={(e) => setSettingsForm({ ...settingsForm, d17AccountHolder: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                      placeholder="Ex: my-cv.tn Administration"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Instructions client :</label>
                  <textarea
                    rows={2}
                    value={settingsForm.d17Instructions}
                    onChange={(e) => setSettingsForm({ ...settingsForm, d17Instructions: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Flouci Settings */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-2">
                  <Landmark className="w-3.5 h-3.5" />
                  <span>Coordonnées Flouci & RIB Bancaire</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Lien / RIB Flouci :</label>
                    <input
                      type="text"
                      value={settingsForm.flouciAccount}
                      onChange={(e) => setSettingsForm({ ...settingsForm, flouciAccount: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="Ex: flouci.me/mycv_tn ou RIB"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nom du Titulaire :</label>
                    <input
                      type="text"
                      value={settingsForm.flouciAccountHolder}
                      onChange={(e) => setSettingsForm({ ...settingsForm, flouciAccountHolder: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="Ex: SARL MY-CV TN"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Instructions client :</label>
                  <textarea
                    rows={2}
                    value={settingsForm.flouciInstructions}
                    onChange={(e) => setSettingsForm({ ...settingsForm, flouciInstructions: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-2xl shadow-lg transition"
              >
                <Check className="w-4 h-4" />
                <span>Enregistrer les Coordonnées</span>
              </button>
            </form>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODALS */}
      {/* ========================================================================= */}

      {/* 1. Modal Visualisation du Reçu */}
      {selectedReceiptUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-blue-400" />
                Justificatif / Capture d'écran du client
              </h4>
              <button
                onClick={() => setSelectedReceiptUrl(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-2 rounded-2xl border border-slate-800 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedReceiptUrl}
                alt="Reçu client"
                className="max-h-[60vh] max-w-full object-contain rounded-xl"
              />
            </div>

            <button
              onClick={() => setSelectedReceiptUrl(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* 2. Modal Motif de Refus */}
      {rejectingRequestId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                <XCircle className="w-4 h-4" />
                Motif du Refus de Paiement
              </h4>
              <button
                onClick={() => setRejectingRequestId(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Indiquez la raison du refus (affichée au client) :
              </label>
              <textarea
                rows={3}
                value={rejectionReasonInput}
                onChange={(e) => setRejectionReasonInput(e.target.value)}
                className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                placeholder="Ex: Montant reçu incomplet, Capture illisible..."
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setRejectingRequestId(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-400 hover:text-white"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md"
              >
                Confirmer le Refus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Modal Ajouter Utilisateur */}
      {isAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-500" />
                Ajouter un Nouvel Utilisateur
              </h4>
              <button
                onClick={() => setIsAddUserModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nom complet :</label>
                <input
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="Ex: Yassine Ben Salem"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email :</label>
                <input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="yassine@example.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mot de passe provisoire :</label>
                <input
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  placeholder="password123"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="p-2.5 bg-rose-950/30 border border-rose-800/30 rounded-xl text-[11px] text-rose-300">
                ✨ L'utilisateur recevra automatiquement <strong>10 crédits de bienvenue</strong> à la création.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddUserModal(false)}
                  className="px-3.5 py-2 text-slate-400 hover:text-white font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-extrabold rounded-xl shadow-md"
                >
                  Créer le Compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
