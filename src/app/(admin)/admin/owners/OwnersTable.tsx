"use client";

import { DataTable } from "@/components/ui/DataTable";
import { CheckCircle, ExternalLink, MoreVertical, Ban } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { useState, useTransition } from "react";
import { toggleOwnerStatus } from "@/app/actions/admin-actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function OwnerActionCell({ owner }: { owner: any }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentStatus = owner.status || "Actif";
  const isSuspended = currentStatus === "Suspendu";

  const handleToggleStatus = () => {
    setIsOpen(false);
    startTransition(async () => {
      try {
        await toggleOwnerStatus(owner.id, currentStatus);
        toast.success(`Le propriétaire ${owner.full_name} a été ${isSuspended ? "activé" : "suspendu"}.`);
        router.refresh();
      } catch (error) {
        toast.error("Erreur lors de la modification du statut.");
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-2 relative">
      <Link
        href={`/portal?owner=${owner.slug}`}
        target="_blank"
        className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-colors flex items-center justify-center"
        title="Voir le portail locataire"
      >
        <ExternalLink className="w-4 h-4" />
      </Link>
      
      <div className="relative">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          disabled={isPending}
          className={`p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors ${isPending ? "opacity-50 cursor-not-allowed animate-pulse" : ""}`}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-100 z-20 py-2">
              <button
                onClick={handleToggleStatus}
                className={`w-full text-left px-4 py-2 text-sm font-semibold flex items-center gap-2 hover:bg-slate-50 transition-colors ${
                  isSuspended ? "text-emerald-600 hover:text-emerald-700" : "text-red-600 hover:text-red-700"
                }`}
              >
                {isSuspended ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                {isSuspended ? "Activer le compte" : "Suspendre le compte"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function OwnersTable({ owners }: { owners: any[] }) {
  return (
    <div className="bg-white rounded-[24px] p-2 sm:p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-visible">
      <DataTable
        columns={[
          {
            header: "Propriétaire",
            cell: (owner: any) => (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 uppercase shrink-0">
                  {owner.full_name?.charAt(0) || '?'}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{owner.full_name}</p>
                  <p className="text-xs text-slate-500 truncate">{owner.slug}</p>
                </div>
              </div>
            ),
          },
          {
            header: "Contact",
            cell: (owner: any) => (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{owner.phone || "Non renseigné"}</p>
                <p className="text-xs text-slate-500 truncate">{owner.email || "Non renseigné"}</p>
              </div>
            ),
          },
          {
            header: "Mode & Statut",
            cell: (owner: any) => {
              const currentStatus = owner.status || "Actif";
              return (
                <div className="flex flex-col gap-1 items-start">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                    <CheckCircle className="w-3 h-3" />
                    {owner.management_type}
                  </div>
                  <StatusBadge status={currentStatus} />
                </div>
              );
            },
          },
          {
            header: "Action",
            cell: (owner: any) => <OwnerActionCell owner={owner} />,
          },
        ]}
        data={owners || []}
      />
    </div>
  );
}
