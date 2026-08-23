"use client";

import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import { ExternalLink, MoreVertical, Ban, CheckCircle } from "lucide-react";
import { useState, useTransition } from "react";
import { toggleAgencyStatus } from "@/app/actions/admin-actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

function AgencyActionCell({ agency }: { agency: any }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const currentStatus = agency.status || "Actif";
  const isSuspended = currentStatus === "Suspendu";

  const handleToggleStatus = () => {
    setIsOpen(false);
    startTransition(async () => {
      try {
        await toggleAgencyStatus(agency.id, currentStatus);
        toast.success(`L'agence ${agency.name} a été ${isSuspended ? "activée" : "suspendue"}.`);
        router.refresh();
      } catch (error) {
        toast.error("Erreur lors de la modification du statut.");
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-2 relative">
      <Link
        href={`/portal?agency=${agency.slug}`}
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
                {isSuspended ? "Activer l'agence" : "Suspendre l'agence"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function AgenciesTable({ agencies }: { agencies: any[] }) {
  return (
    <div className="bg-white rounded-[24px] p-2 sm:p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 overflow-visible">
      <DataTable
        columns={[
          {
            header: "Agence",
            cell: (agency: any) => (
              <div className="flex items-center gap-3">
                {agency.logo_url ? (
                  <img src={agency.logo_url} alt="Logo" className="w-10 h-10 rounded-xl object-contain bg-slate-50 border border-slate-100" />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold border border-slate-200 uppercase shrink-0">
                    {agency.name?.charAt(0) || '?'}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-bold text-slate-900 truncate">{agency.name}</p>
                  <p className="text-xs text-slate-500 truncate">{agency.slug}</p>
                </div>
              </div>
            ),
          },
          {
            header: "Contact",
            cell: (agency: any) => (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{agency.contact_phone || "Non renseigné"}</p>
                <p className="text-xs text-slate-500 truncate">{agency.contact_email || "Non renseigné"}</p>
              </div>
            ),
          },
          {
            header: "Statut",
            cell: (agency: any) => {
              const currentStatus = agency.status || "Actif";
              return <StatusBadge status={currentStatus} />;
            },
          },
          {
            header: "Action",
            cell: (agency: any) => <AgencyActionCell agency={agency} />,
          },
        ]}
        data={agencies || []}
      />
    </div>
  );
}
