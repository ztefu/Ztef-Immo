"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { motion } from "framer-motion";
import { Save, Bell, Shield, User, Building, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useCurrentAgency } from "@/hooks/useCurrentAgency";
import { updateAgency, updateOwner } from "@/lib/supabase-api";
import { Link2, Copy } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

function SettingsContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "agence";
  const [activeTab, setActiveTab] = useState(defaultTab);
  const { currentAgency, isLoadingAgency: isLoading, setCurrentAgency } = useCurrentAgency();
  const agencyId = currentAgency?.id;
  const agencySlug = currentAgency?.slug || currentAgency?.id;
  const isOwner = (currentAgency as any)?._isOwner === true;
  const portalParam = isOwner ? `owner=${agencySlug}` : `agency=${agencySlug}`;
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false });
  const [user, setUser] = useState<any>(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } finally {
        setIsLoadingUser(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    if (searchParams.get("tab")) {
      setActiveTab(searchParams.get("tab") as string);
    }
  }, [searchParams]);

  const tabs = [
    { id: "agence", label: isOwner ? "Mon Profil" : "Profil Agence", icon: Building },
    ...(isOwner ? [] : [{ id: "compte", label: "Mon Compte", icon: User }]),
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "securite", label: "Sécurité", icon: Shield },
  ];

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentAgency) return;
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const updates = {
      name: formData.get("name") as string,
      contactEmail: formData.get("email") as string,
      contactPhone: formData.get("phone") as string,
      address: formData.get("address") as string,
      tenantAccessCode: formData.get("tenantAccessCode") as string,
    };
    
    try {
      let updated;
      if (isOwner) {
        const ownerUpdates = {
          fullName: updates.name,
          email: updates.contactEmail,
          phone: updates.contactPhone,
          address: updates.address,
          tenantAccessCode: updates.tenantAccessCode,
        };
        const updatedOwner = await updateOwner(currentAgency.id, ownerUpdates);
        updated = {
          id: updatedOwner.id,
          name: updatedOwner.fullName,
          slug: updatedOwner.slug,
          _isOwner: true
        } as any;
      } else {
        updated = await updateAgency(currentAgency.id, updates);
      }
      setCurrentAgency(updated);
      toast.success(isOwner ? "Informations personnelles sauvegardées" : "Paramètres de l'agence sauvegardés avec succès");
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAccount = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const updates = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
    };
    const email = formData.get("email") as string;
    const supabase = createClient();
    
    try {
      const { error } = await supabase.auth.updateUser({ 
        email: email !== user?.email ? email : undefined,
        data: updates 
      });
      if (error) throw error;
      toast.success("Informations personnelles enregistrées");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    const formData = new FormData(e.currentTarget);
    const notifications = {
      payments: formData.get("notif_payments") === "on",
      tickets: formData.get("notif_tickets") === "on",
      delays: formData.get("notif_delays") === "on",
    };
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.updateUser({ data: { notifications } });
      if (error) throw error;
      toast.success("Préférences de notifications enregistrées");
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSecurity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPassword = formData.get("new_password") as string;
    const confirmPassword = formData.get("confirm_password") as string;

    if (!newPassword) {
      toast.error("Veuillez entrer un nouveau mot de passe");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    setIsSaving(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Mot de passe mis à jour avec succès");
      setShowPassword({ current: false, new: false, confirm: false });
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  const copyLink = () => {
    if (agencySlug) {
      const link = `${window.location.origin}/portal?${portalParam}`;
      navigator.clipboard.writeText(link);
      toast.success("Lien copié dans le presse-papier !");
    } else {
      toast.error("Veuillez vous authentifier pour générer votre lien.");
    }
  };

  return (
    <div className="w-full pb-32 sm:pb-0">
      <PageHeader
        title="Paramètres"
        description={isOwner ? "Gérez vos préférences et vos configurations." : "Gérez les préférences de votre agence et les configurations globales."}
        actions={
          <button 
            type="submit"
            form={activeTab === "agence" ? "agency-form" : activeTab === "compte" ? "account-form" : activeTab === "notifications" ? "notifications-form" : "security-form"}
            disabled={isSaving}
            className="hidden sm:flex items-center gap-2 bg-white border border-slate-400 text-slate-900  px-5 py-2.5 rounded-full hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors text-sm font-semibold shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "Enregistrement..." : "Enregistrer"}
          </button>
        }
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col gap-6"
      >
        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center sm:justify-start gap-2 sm:gap-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full transition-all font-semibold text-xs sm:text-sm whitespace-nowrap ${
                  isActive
                    ? "bg-white border border-slate-400 text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-md"
                    : "bg-white text-slate-600 hover:text-slate-900 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex flex-col gap-6">
          
          {activeTab === "agence" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300">
                <h2 className="text-[20px] font-bold text-slate-900 mb-6">{isOwner ? "Informations Personnelles" : "Informations de l'Agence"}</h2>
                
                {isLoading ? (
                  <div className="h-40 flex items-center justify-center">
                    <span className="text-slate-400 font-medium">Chargement...</span>
                  </div>
                ) : (
                  <form id="agency-form" className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSave}>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">{isOwner ? "Nom complet" : "Nom de l'Agence"}</label>
                      <input 
                        name="name"
                        type="text" 
                        defaultValue={currentAgency?.name || ""}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[20px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-slate-900"
                      />
                    </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email de contact</label>
                    <input 
                      name="email"
                      type="email" 
                      defaultValue={currentAgency?.contactEmail || ""}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Téléphone principal</label>
                    <input 
                      name="phone"
                      type="tel" 
                      defaultValue={currentAgency?.contactPhone || ""}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-slate-900"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Adresse physique</label>
                    <textarea 
                      name="address"
                      rows={3}
                      defaultValue={currentAgency?.address || ""}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[20px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-slate-900 resize-none"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 mt-2 pt-6 border-t border-slate-100">
                    <h3 className="text-[17px] font-bold text-slate-900 mb-4">Accès Locataires</h3>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Code d'accès par défaut (Portail Locataire)</label>
                      <input 
                        name="tenantAccessCode"
                        type="text" 
                        defaultValue={currentAgency?.tenantAccessCode || "Locat@12345"}
                        placeholder="Ex: MonAgence2026"
                        className="w-full md:w-1/2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-slate-900"
                      />
                      <p className="text-xs text-slate-500 mt-2">Ce code de connexion sera attribué à tous vos nouveaux locataires.</p>
                    </div>
                  </div>
                </form>
                )}
              </div>

              {/* Tenant Portal Link Card */}
              <div className="bg-gradient-to-br from-primary/10 to-transparent rounded-[24px] p-8 border border-primary/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Link2 className="w-24 h-24 text-primary" />
                </div>
                <div className="relative z-10">
                  <h2 className="text-[20px] font-bold text-slate-900 mb-2">Lien Portail Locataire</h2>
                  <p className="text-sm text-slate-600 mb-6 max-w-lg">
                    Partagez ce lien unique avec vos locataires. Il contient votre identifiant pour leur permettre de se connecter en toute sécurité.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 bg-white border border-primary/30 rounded-[20px] px-4 py-3 flex items-center overflow-hidden">
                      <span className="text-sm font-medium text-slate-500 truncate select-all">
                        {isLoading 
                          ? "Chargement..." 
                          : agencySlug 
                            ? `${typeof window !== 'undefined' ? window.location.origin : ''}/portal?${portalParam}` 
                            : "Veuillez vous authentifier via /signup ou /login"}
                      </span>
                    </div>
                    <button 
                      onClick={copyLink}
                      className="flex items-center justify-center gap-2 bg-white border border-primary/40 text-primary px-5 py-3 rounded-[20px] hover:bg-primary hover:text-white hover:border-primary transition-colors text-sm font-bold shadow-sm shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                      Copier le lien
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300">
                <h2 className="text-[20px] font-bold text-slate-900 mb-6">Préférences Régionales</h2>
                
                <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={(e) => { e.preventDefault(); toast.success("Préférences sauvegardées"); }}>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Devise par défaut</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-slate-900">
                      <option value="XAF">Franc CFA (FCFA)</option>
                      <option value="EUR">Euro (€)</option>
                      <option value="USD">Dollar Américain ($)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Fuseau horaire</label>
                    <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-slate-900">
                      <option value="Africa/Douala">Afrique/Douala (GMT+1)</option>
                      <option value="Africa/Libreville">Afrique/Libreville (GMT+1)</option>
                      <option value="Europe/Paris">Europe/Paris (GMT+1/GMT+2)</option>
                    </select>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

          {activeTab === "compte" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300">
                <h2 className="text-[20px] font-bold text-slate-900 mb-6">Informations Personnelles</h2>
                {isLoadingUser ? (
                  <div className="h-40 flex items-center justify-center">
                    <span className="text-slate-400 font-medium">Chargement...</span>
                  </div>
                ) : (
                  <form id="account-form" className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSaveAccount}>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Prénom</label>
                      <input name="first_name" type="text" defaultValue={user?.user_metadata?.first_name || ""} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Nom</label>
                      <input name="last_name" type="text" defaultValue={user?.user_metadata?.last_name || ""} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium text-slate-900" />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                      <input name="email" type="email" defaultValue={user?.email || ""} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium text-slate-900" />
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "notifications" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300">
                <h2 className="text-[20px] font-bold text-slate-900 mb-6">Préférences de Notifications</h2>
                {isLoadingUser ? (
                  <div className="h-40 flex items-center justify-center">
                    <span className="text-slate-400 font-medium">Chargement...</span>
                  </div>
                ) : (
                  <form id="notifications-form" className="space-y-6" onSubmit={handleSaveNotifications}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Paiements de loyer</h3>
                        <p className="text-xs text-slate-500 mt-1">Être alerté lors de la réception d'un paiement.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input name="notif_payments" type="checkbox" className="sr-only peer" defaultChecked={user?.user_metadata?.notifications?.payments !== false} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e]"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Tickets de maintenance</h3>
                        <p className="text-xs text-slate-500 mt-1">Notifications lors de la création d'un nouveau ticket.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input name="notif_tickets" type="checkbox" className="sr-only peer" defaultChecked={user?.user_metadata?.notifications?.tickets !== false} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e]"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-900">Retards de paiement</h3>
                        <p className="text-xs text-slate-500 mt-1">Alertes automatiques pour les loyers non réglés.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input name="notif_delays" type="checkbox" className="sr-only peer" defaultChecked={user?.user_metadata?.notifications?.delays === true} />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#22c55e]"></div>
                      </label>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === "securite" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300">
                <h2 className="text-[20px] font-bold text-slate-900 mb-6">Changer de Mot de passe</h2>
                <form id="security-form" className="flex flex-col gap-6" onSubmit={handleSaveSecurity}>
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Mot de passe actuel</label>
                    <div className="relative">
                      <input type={showPassword.current ? "text" : "password"} placeholder="••••••••" className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium text-slate-900" />
                      <button type="button" onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                        {showPassword.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nouveau mot de passe</label>
                    <div className="relative">
                      <input name="new_password" type={showPassword.new ? "text" : "password"} placeholder="••••••••" className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium text-slate-900" />
                      <button type="button" onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                        {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Confirmer le mot de passe</label>
                    <div className="relative">
                      <input name="confirm_password" type={showPassword.confirm ? "text" : "password"} placeholder="••••••••" className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium text-slate-900" />
                      <button type="button" onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                        {showPassword.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}

        </div>
      </motion.div>

      {/* Mobile Sticky Save Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sm:hidden z-40">
        <button 
          type="submit"
          form={activeTab === "agence" ? "agency-form" : activeTab === "compte" ? "account-form" : activeTab === "notifications" ? "notifications-form" : "security-form"}
          disabled={isSaving}
          className="flex w-full items-center justify-center gap-2 bg-white border border-slate-400 text-slate-900  px-5 py-3.5 rounded-full hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors text-base font-semibold shadow-sm disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Chargement des paramètres...</div>}>
      <SettingsContent />
    </Suspense>
  );
}
