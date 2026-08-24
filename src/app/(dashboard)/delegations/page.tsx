"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { motion } from "framer-motion";
import { ArrowRightLeft, Building2, CheckCircle2, XCircle, Clock, RotateCcw, MapPin, User } from "lucide-react";
import { DataTable } from "@/components/ui/DataTable";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/Skeletons";
import { useDelegations } from "@/hooks/useDelegations";
import { useAgency } from "@/hooks/useAgency";
import { acceptDelegation, rejectDelegation, revokeDelegation, PropertyDelegation } from "@/lib/supabase-api";
import { useState } from "react";
import toast from "react-hot-toast";

export default function DelegationsPage() {
  const { delegations, isLoading, refreshDelegations } = useDelegations();
  const { isOwner } = useAgency();
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: 'accept' | 'reject' | 'revoke' } | null>(null);

  const handleAction = async () => {
    if (!confirmAction) return;
    try {
      if (confirmAction.action === 'accept') {
        await acceptDelegation(confirmAction.id);
        toast.success("Demande acceptée ! La propriété est maintenant sous votre gestion.");
      } else if (confirmAction.action === 'reject') {
        await rejectDelegation(confirmAction.id);
        toast.success("Demande refusée.");
      } else if (confirmAction.action === 'revoke') {
        await revokeDelegation(confirmAction.id);
        toast.success("Gestion révoquée. La propriété est de nouveau sous votre contrôle.");
      }
      refreshDelegations();
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'action.");
    } finally {
      setConfirmAction(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'En attente':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#fef08a] text-[#eab308] border border-yellow-200">
            <Clock className="h-3 w-3" /> En attente
          </span>
        );
      case 'Acceptée':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#dcfce7] text-[#22c55e] border border-green-200">
            <CheckCircle2 className="h-3 w-3" /> Acceptée
          </span>
        );
      case 'Refusée':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-500 border border-red-200">
            <XCircle className="h-3 w-3" /> Refusée
          </span>
        );
      case 'Révoquée':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
            <RotateCcw className="h-3 w-3" /> Révoquée
          </span>
        );
      default:
        return <span className="text-xs text-slate-400">{status}</span>;
    }
  };

  const columns = [
    {
      header: "Propriété",
      cell: (item: PropertyDelegation) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="font-bold text-slate-900 leading-tight">{item.propertyName || 'Propriété'}</div>
          </div>
        </div>
      ),
    },
    {
      header: isOwner ? "Agence" : "Propriétaire",
      cell: (item: PropertyDelegation) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-slate-400" />
          <span className="font-medium text-slate-700">
            {isOwner ? (item.agencyName || 'Agence') : (item.ownerName || 'Propriétaire')}
          </span>
        </div>
      ),
    },
    {
      header: "Statut",
      cell: (item: PropertyDelegation) => getStatusBadge(item.status),
    },
    {
      header: "Date",
      cell: (item: PropertyDelegation) => (
        <span className="text-sm text-slate-500 font-medium">
          {new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (item: PropertyDelegation) => (
        <div className="flex justify-end gap-2">
          {/* Agency actions: Accept/Reject pending requests */}
          {!isOwner && item.status === 'En attente' && (
            <>
              <button
                onClick={() => setConfirmAction({ id: item.id, action: 'accept' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#dcfce7] text-[#22c55e] hover:bg-[#22c55e] hover:text-white transition-colors"
              >
                <CheckCircle2 className="h-3 w-3" /> Accepter
              </button>
              <button
                onClick={() => setConfirmAction({ id: item.id, action: 'reject' })}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
              >
                <XCircle className="h-3 w-3" /> Refuser
              </button>
            </>
          )}
          {/* Owner action: Revoke accepted delegation */}
          {isOwner && item.status === 'Acceptée' && (
            <button
              onClick={() => setConfirmAction({ id: item.id, action: 'revoke' })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Révoquer
            </button>
          )}
          {/* No actions for rejected/revoked */}
          {(item.status === 'Refusée' || item.status === 'Révoquée') && (
            <span className="text-xs text-slate-400 italic">Aucune action</span>
          )}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 relative w-full">
        <PageHeaderSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  const pendingCount = delegations.filter(d => d.status === 'En attente').length;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Gestion Déléguée"
        description={isOwner 
          ? "Suivez les demandes de délégation de gestion de vos propriétés." 
          : "Gérez les demandes de gestion de propriétés envoyées par des propriétaires autonomes."
        }
        actions={
          pendingCount > 0 ? (
            <div className="flex items-center gap-2 bg-[#fef08a] text-[#eab308] px-4 py-2 rounded-full text-sm font-bold border border-yellow-200">
              <Clock className="h-4 w-4" />
              {pendingCount} en attente
            </div>
          ) : undefined
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300"
        >
          <div className="text-[32px] font-bold text-slate-900 leading-none">{delegations.length}</div>
          <div className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Total</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300"
        >
          <div className="text-[32px] font-bold text-[#eab308] leading-none">{pendingCount}</div>
          <div className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">En attente</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300"
        >
          <div className="text-[32px] font-bold text-[#22c55e] leading-none">{delegations.filter(d => d.status === 'Acceptée').length}</div>
          <div className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Actives</div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300"
        >
          <div className="text-[32px] font-bold text-slate-400 leading-none">{delegations.filter(d => d.status === 'Refusée' || d.status === 'Révoquée').length}</div>
          <div className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">Terminées</div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <DataTable
          data={delegations}
          columns={columns}
          emptyMessage="Aucune demande de délégation trouvée."
        />
      </motion.div>

      <ConfirmModal
        isOpen={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={handleAction}
        title={
          confirmAction?.action === 'accept' ? "Accepter cette demande ?" :
          confirmAction?.action === 'reject' ? "Refuser cette demande ?" :
          "Révoquer cette délégation ?"
        }
        message={
          confirmAction?.action === 'accept' 
            ? "En acceptant, vous prendrez en charge la gestion de cette propriété et de ses locataires." 
            : confirmAction?.action === 'reject'
            ? "Le propriétaire sera informé que sa demande a été refusée."
            : "Vous reprendrez le contrôle de cette propriété. L'agence perdra l'accès à la gestion."
        }
        confirmText={
          confirmAction?.action === 'accept' ? "Accepter" :
          confirmAction?.action === 'reject' ? "Refuser" :
          "Révoquer"
        }
      />
    </div>
  );
}
