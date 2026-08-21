"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wrench, CheckCircle2, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/Skeletons";
import { Tenant } from "@/lib/mock-data";
import { getTenants, addTicket } from "@/lib/supabase-api";
import { useCurrentTenant } from "@/hooks/useCurrentTenant";

export default function TenantMaintenance() {
  const { currentTenant, isLoadingTenant } = useCurrentTenant();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Plomberie");
  const [priority, setPriority] = useState("Moyenne");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const isLoading = isLoadingTenant;

  const managerTitle = currentTenant?.agencyId ? "l'agence" : "votre propriétaire";
  const managerNameText = currentTenant?.agencyId ? "L'agence" : "Votre propriétaire";
  const managerPronoun = currentTenant?.agencyId ? "Votre agence" : "Votre propriétaire";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !currentTenant) return;
    
    setIsSending(true);
    
    try {
      await addTicket({
        title,
        description,
        status: "Nouveau",
        priority: priority,
        category: category,
        tenantId: currentTenant.id,
        unitId: currentTenant.unitId
      });
      
      setIsSubmitted(true);
      toast.success(`Votre demande a bien été envoyée à ${managerTitle}.`);
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de l'envoi de la demande");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading || isLoadingTenant) {
    return (
      <div className="flex flex-col gap-8 relative w-full p-6 md:p-8 max-w-7xl mx-auto">
        <PageHeaderSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  if (!currentTenant) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <AlertCircle className="w-12 h-12 text-slate-400" />
        <p className="text-slate-500 font-medium">Profil locataire introuvable.</p>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="p-5 flex flex-col items-center justify-center flex-1 text-center h-full pt-20">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Demande envoyée !</h2>
        <p className="text-slate-500 mb-8 max-w-[280px]">
          {managerNameText} a bien reçu votre signalement. Vous serez notifié dès qu'un technicien sera assigné.
        </p>
        <button 
          onClick={() => {
            setIsSubmitted(false);
            setTitle("");
            setDescription("");
          }}
          className="bg-slate-100 text-slate-900 font-bold py-3.5 px-8 rounded-full active:scale-95 transition-transform"
        >
          Signaler un autre problème
        </button>
      </div>
    );
  }

  return (
    <div className="p-5 flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <Wrench className="w-4 h-4 text-orange-600" />
          </div>
          Dépannage
        </h2>
        <p className="text-sm font-medium text-slate-500">
          Un problème dans votre logement ? Signalez-le directement à {managerTitle}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-white p-5 rounded-[24px] shadow-sm border border-slate-100">
        
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Quel est le problème ?</label>
          <input 
            type="text"
            required
            placeholder="Ex: Fuite d'eau sous l'évier"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[16px] focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Catégorie</label>
          <select 
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[16px] focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium"
          >
            <option value="Plomberie">Plomberie</option>
            <option value="Électricité">Électricité</option>
            <option value="Menuiserie">Menuiserie</option>
            <option value="Gros œuvre">Gros œuvre</option>
            <option value="Autre">Autre</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Priorité</label>
          <select 
            value={priority}
            onChange={e => setPriority(e.target.value)}
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[16px] focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium"
          >
            <option value="Basse">Basse - Pas urgent</option>
            <option value="Moyenne">Moyenne - Problème gênant mais pas critique</option>
            <option value="Haute">Haute - Urgent (Fuite, Panne d'électricité, etc.)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Détails supplémentaires</label>
          <textarea 
            required
            placeholder="Précisez la pièce, l'étendue des dégâts, etc."
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[16px] focus:ring-2 focus:ring-primary outline-none transition-all text-sm font-medium resize-none"
          />
        </div>

        <div className="bg-blue-50 p-4 rounded-[16px] flex items-start gap-3 mt-2">
          <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-xs font-medium text-blue-800 leading-relaxed">
            {managerPronoun} recevra votre demande instantanément. Si le problème est urgent (ex: inondation majeure), veuillez appeler {managerTitle} directement.
          </p>
        </div>

        <button 
          type="submit" 
          disabled={isSending}
          className="w-full mt-2 bg-white border border-slate-400 text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 font-bold py-4 rounded-[16px] shadow-xl shadow-slate-900/20 active:scale-95 transition-transform disabled:opacity-70 flex justify-center items-center"
        >
          {isSending ? "Envoi..." : "Envoyer ma demande"}
        </button>

      </form>
    </div>
  );
}
