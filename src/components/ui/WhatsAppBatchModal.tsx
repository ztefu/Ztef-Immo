"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, AlertCircle, CheckCircle2 } from "lucide-react";
import { Tenant } from "@/lib/mock-data";
import { useState } from "react";
import { APP_NAME } from "@/lib/config";

interface LateTenant {
  tenant: Tenant;
  amountDue: number;
}

interface WhatsAppBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  lateTenants: LateTenant[];
}

export function WhatsAppBatchModal({ isOpen, onClose, lateTenants }: WhatsAppBatchModalProps) {
  const [sentList, setSentList] = useState<Set<string>>(new Set());

  const handleSend = (lateTenant: LateTenant) => {
    const formattedPhone = lateTenant.tenant.phone.replace(/[^0-9]/g, '');
    const message = `Bonjour ${lateTenant.tenant.fullName},\n\nSauf erreur de notre part, nous n'avons pas encore reçu le paiement de votre loyer d'un montant de ${lateTenant.amountDue.toLocaleString()} FCFA.\n\nMerci de régulariser la situation au plus vite pour éviter des pénalités.\n\nCordialement,\nL'équipe de gestion.`;
    
    // Open WhatsApp Web/App
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
    
    // Mark as sent in our local state
    setSentList(new Set(sentList).add(lateTenant.tenant.id));
  };

  const progress = lateTenants.length > 0 ? (sentList.size / lateTenants.length) * 100 : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#25D366]/10 text-[#25D366] rounded-2xl flex items-center justify-center shadow-sm">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Relances Rapides</h2>
                  <p className="text-sm font-medium text-slate-500">
                    {lateTenants.length} locataire(s) en retard
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-slate-100">
              <div 
                className="h-full bg-[#25D366] transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Content List */}
            <div className="p-8 overflow-y-auto flex-1 bg-slate-50/30">
              {lateTenants.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">Aucun retard !</h3>
                  <p className="text-sm text-slate-500">Tous vos locataires sont à jour dans leurs paiements.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {lateTenants.map(({ tenant, amountDue }, index) => {
                    const isSent = sentList.has(tenant.id);
                    return (
                      <div 
                        key={tenant.id}
                        className={`flex items-center justify-between p-4 rounded-[20px] border transition-all ${
                          isSent 
                            ? "bg-slate-50 border-slate-200 opacity-70" 
                            : "bg-white border-slate-200 hover:border-[#25D366]/50 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSent ? "bg-[#25D366] text-white" : "bg-slate-100 text-slate-500"
                          }`}>
                            {isSent ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{tenant.fullName}</p>
                            <p className="text-xs font-semibold text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Reste à payer : {amountDue.toLocaleString()} FCFA
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleSend({ tenant, amountDue })}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-[16px] font-bold text-sm transition-all ${
                            isSent
                              ? "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              : "bg-[#25D366] text-white shadow-lg shadow-[#25D366]/20 hover:bg-[#1fa952]"
                          }`}
                        >
                          <MessageCircle className="w-4 h-4" />
                          {isSent ? "Renvoyer" : "Relancer"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-8 py-5 border-t border-slate-100 bg-white flex justify-between items-center">
              <span className="text-sm font-semibold text-slate-500">
                {sentList.size} / {lateTenants.length} messages envoyés
              </span>
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-full shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all"
              >
                Terminer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
