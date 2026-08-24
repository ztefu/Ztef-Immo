"use client";

import { Modal } from "@/components/ui/Modal";
import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Building2, MapPin, Mail, Phone, Send, CheckCircle2, Loader2 } from "lucide-react";
import { searchAgencyBySlug, requestDelegation } from "@/lib/supabase-api";
import toast from "react-hot-toast";

type FoundAgency = {
  id: string;
  name: string;
  slug: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
};

export function DelegationModal({
  isOpen,
  onClose,
  propertyId,
  propertyName,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string;
  propertyName: string;
  onSuccess?: () => void;
}) {
  const [slug, setSlug] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [foundAgency, setFoundAgency] = useState<FoundAgency | null>(null);
  const [searchError, setSearchError] = useState("");
  const [sent, setSent] = useState(false);

  const handleSearch = async () => {
    if (!slug.trim()) return;
    setIsSearching(true);
    setSearchError("");
    setFoundAgency(null);
    
    try {
      const agency = await searchAgencyBySlug(slug.trim().toLowerCase());
      if (agency) {
        setFoundAgency(agency);
      } else {
        setSearchError("Aucune agence trouvée avec cet identifiant. Vérifiez l'orthographe.");
      }
    } catch (error: any) {
      setSearchError(error.message || "Erreur lors de la recherche.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async () => {
    if (!foundAgency) return;
    setIsSending(true);
    try {
      await requestDelegation(propertyId, foundAgency.slug);
      setSent(true);
      toast.success(`Demande envoyée à ${foundAgency.name} !`);
      onSuccess?.();
      setTimeout(() => {
        onClose();
        // Reset state
        setSlug("");
        setFoundAgency(null);
        setSent(false);
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'envoi de la demande.");
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    onClose();
    setSlug("");
    setFoundAgency(null);
    setSearchError("");
    setSent(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Déléguer la gestion">
      <div className="flex flex-col gap-5">
        {/* Info */}
        <div className="bg-blue-50 rounded-[20px] p-4 border border-blue-100">
          <p className="text-sm text-blue-800 font-medium">
            Vous souhaitez confier la gestion de <span className="font-bold">{propertyName}</span> à une agence.
            Entrez l'identifiant (slug) de l'agence pour lui envoyer une demande.
          </p>
        </div>

        {/* Search input */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Identifiant de l'agence</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setFoundAgency(null);
                  setSearchError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="Ex: mon-agence-immobiliere"
                className="w-full h-11 pl-10 pr-4 rounded-[20px] bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium text-slate-900"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              disabled={isSearching || !slug.trim()}
              className="flex items-center gap-2 h-11 px-5 rounded-[20px] bg-white border border-slate-400 text-slate-900 font-semibold text-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Rechercher
            </motion.button>
          </div>
          {searchError && (
            <p className="text-xs text-red-500 mt-2 font-medium">{searchError}</p>
          )}
        </div>

        {/* Found agency card */}
        {foundAgency && !sent && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[20px] border border-slate-200 p-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]"
          >
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-slate-900">{foundAgency.name}</h3>
                {foundAgency.address && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{foundAgency.address}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-3 mt-2">
                  {foundAgency.contactEmail && (
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Mail className="h-3 w-3" /> {foundAgency.contactEmail}
                    </div>
                  )}
                  {foundAgency.contactPhone && (
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Phone className="h-3 w-3" /> {foundAgency.contactPhone}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendRequest}
              disabled={isSending}
              className="w-full h-11 mt-5 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              {isSending ? "Envoi en cours..." : "Envoyer la demande de gestion"}
            </motion.button>
          </motion.div>
        )}

        {/* Success state */}
        {sent && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 gap-3"
          >
            <div className="h-16 w-16 rounded-full bg-[#dcfce7] flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-[#22c55e]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Demande envoyée !</h3>
            <p className="text-sm text-slate-500 text-center">
              L'agence <span className="font-semibold">{foundAgency?.name}</span> recevra votre demande et pourra l'accepter depuis son espace.
            </p>
          </motion.div>
        )}
      </div>
    </Modal>
  );
}
