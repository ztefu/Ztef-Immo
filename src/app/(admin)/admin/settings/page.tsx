"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { motion } from "framer-motion";
import { Save, Shield, User, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

function AdminSettingsContent() {
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "compte";
  const [activeTab, setActiveTab] = useState(defaultTab);
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
    { id: "compte", label: "Mon Compte", icon: User },
    { id: "securite", label: "Sécurité", icon: Shield },
  ];

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
      const updatePayload: any = { data: updates };
      if (email && email !== user?.email) {
        updatePayload.email = email;
      }
      const { error } = await supabase.auth.updateUser(updatePayload);
      if (error) throw error;
      toast.success("Informations administrateur enregistrées. Si vous avez changé d'email, un lien de confirmation a été envoyé.");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'enregistrement");
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

  return (
    <div className="w-full pb-32 sm:pb-0">
      <PageHeader
        title="Paramètres Administrateur"
        description="Gérez le compte principal de la plateforme Ztefu-Immo."
        actions={
          <button 
            type="submit"
            form={activeTab === "compte" ? "account-form" : "security-form"}
            disabled={isSaving}
            className="hidden sm:flex items-center gap-2 bg-slate-900 border border-slate-900 text-white px-5 py-2.5 rounded-full hover:bg-slate-800 transition-colors text-sm font-semibold shadow-sm disabled:opacity-50"
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
                    ? "bg-slate-900 border border-slate-900 text-white shadow-md"
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
          
          {activeTab === "compte" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300">
                <h2 className="text-[20px] font-bold text-slate-900 mb-6">Informations Administrateur</h2>
                {isLoadingUser ? (
                  <div className="h-40 flex items-center justify-center">
                    <span className="text-slate-400 font-medium">Chargement...</span>
                  </div>
                ) : (
                  <form id="account-form" className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSaveAccount}>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Prénom</label>
                      <input name="first_name" type="text" defaultValue={user?.user_metadata?.first_name || ""} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-slate-900 outline-none transition-all text-sm font-medium text-slate-900" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Nom</label>
                      <input name="last_name" type="text" defaultValue={user?.user_metadata?.last_name || ""} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-slate-900 outline-none transition-all text-sm font-medium text-slate-900" />
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email Administrateur</label>
                      <input name="email" type="email" defaultValue={user?.email || ""} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[20px] focus:ring-2 focus:ring-slate-900 outline-none transition-all text-sm font-medium text-slate-900" />
                      <p className="text-xs text-slate-500 mt-2">Attention : Si vous modifiez cet email, vous devrez confirmer le changement via votre boîte de réception.</p>
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
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nouveau mot de passe</label>
                    <div className="relative">
                      <input name="new_password" type={showPassword.new ? "text" : "password"} placeholder="••••••••" className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-slate-900 outline-none transition-all text-sm font-medium text-slate-900" />
                      <button type="button" onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none">
                        {showPassword.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Confirmer le mot de passe</label>
                    <div className="relative">
                      <input name="confirm_password" type={showPassword.confirm ? "text" : "password"} placeholder="••••••••" className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-slate-900 outline-none transition-all text-sm font-medium text-slate-900" />
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
          form={activeTab === "compte" ? "account-form" : "security-form"}
          disabled={isSaving}
          className="flex w-full items-center justify-center gap-2 bg-slate-900 border border-slate-900 text-white px-5 py-3.5 rounded-full hover:bg-slate-800 transition-colors text-base font-semibold shadow-sm disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </div>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 font-medium">Chargement des paramètres...</div>}>
      <AdminSettingsContent />
    </Suspense>
  );
}
