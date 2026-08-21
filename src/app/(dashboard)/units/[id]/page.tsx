"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { ArrowLeft, Home, User, Wallet, Calendar, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Unit, Property, Tenant } from "@/lib/mock-data";
import { getUnits, getProperties, getTenants, updateUnit } from "@/lib/supabase-api";
import { useUnits, useProperties, useTenants } from "@/hooks/useData";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { PageHeaderSkeleton, StatCardSkeleton } from "@/components/ui/Skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function UnitDetailPage({ params }: { params: { id: string } }) {
  const { units, refreshUnits, isLoading: isUnitsLoading } = useUnits();
  const { properties, isLoading: isPropsLoading } = useProperties();
  const { tenants, isLoading: isTenantsLoading } = useTenants();

  const [unit, setUnit] = useState<Unit | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [isEditUnitModalOpen, setIsEditUnitModalOpen] = useState(false);
  
  // Unit form state
  const [editRef, setEditRef] = useState("");
  const [editType, setEditType] = useState("");
  const [editBeds, setEditBeds] = useState(0);
  const [editRent, setEditRent] = useState(0);
  const [editFloor, setEditFloor] = useState("");
  const [editStatus, setEditStatus] = useState<any>("Vacant");

  useEffect(() => {
    if (isUnitsLoading || isPropsLoading || isTenantsLoading) return;

    const u = units.find(un => un.id === params.id);
    if (u) {
      setUnit(u);
      setEditRef(u.reference);
      setEditType(u.type);
      setEditBeds(u.bedrooms);
      setEditRent(u.rent || 0);
      setEditFloor(u.floor || "");
      setEditStatus(u.status || "Vacant");
      
      const p = properties.find(prop => prop.id === u.propertyId);
      setProperty(p || null);
      
      const t = tenants.find(ten => ten.unitId === u.id);
      setTenant(t || null);
    }
  }, [params.id, units, properties, tenants, isUnitsLoading, isPropsLoading, isTenantsLoading]);

  const isLoading = isUnitsLoading || isPropsLoading || isTenantsLoading;

  const handleUpdateUnit = async () => {
    if (!editRef || !unit) return;
    setIsSaving(true);
    try {
      await updateUnit(unit.id, {
        reference: editRef,
        type: editType,
        bedrooms: Number(editBeds),
        rent: Number(editRent),
        floor: editFloor,
        status: editStatus
      });
      setIsEditUnitModalOpen(false);
      refreshUnits();
      toast.success("Logement mis à jour");
    } catch (e) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8">
        <Skeleton className="h-4 w-32 mb-2" />
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="bg-white rounded-[32px] p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Logement introuvable</h2>
        <Link href="/units" className="text-primary hover:underline">Retour à la liste</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/units" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux logements
        </Link>
        <PageHeader 
          title={`Logement ${unit.reference}`} 
          description={`Détails du logement - ${property?.name || "Propriété inconnue"}`}
          actions={
            <>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditUnitModalOpen(true)}
                className="flex h-11 items-center justify-center rounded-full bg-white border border-slate-400 text-slate-900 px-5 text-sm font-medium  shadow-md hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors whitespace-nowrap"
              >
                Modifier
              </motion.button>
            </>
          }
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="text-[17px] font-bold text-slate-900 flex items-center">
              <Home className="h-5 w-5 mr-2 text-primary" />
              Informations
            </h3>
            <StatusBadge status={unit.status} />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase">Type</div>
              <div className="text-sm font-bold text-slate-700 mt-1">{unit.type}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase">Étage</div>
              <div className="text-sm font-bold text-slate-700 mt-1">{unit.floor}</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase">Chambres</div>
              <div className="text-sm font-bold text-slate-700 mt-1">{unit.bedrooms}</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="text-[17px] font-bold text-slate-900 flex items-center">
              <Wallet className="h-5 w-5 mr-2 text-green-500" />
              Finances
            </h3>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-2">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase">Loyer Mensuel</div>
              <div className="text-lg font-bold text-slate-900 mt-1">{(unit.rent || 0).toLocaleString()} FCFA</div>
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase">Dépôt de garantie</div>
              <div className="text-lg font-bold text-slate-900 mt-1">{(unit.deposit || 0).toLocaleString()} FCFA</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col gap-4 md:col-span-2">
          <div className="flex justify-between items-center border-b border-slate-100 pb-4">
            <h3 className="text-[17px] font-bold text-slate-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-blue-500" />
              Locataire Actuel
            </h3>
          </div>
          {tenant ? (
            <div className="flex items-center gap-4 mt-2">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xl">
                {tenant.fullName.charAt(0)}
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">{tenant.fullName}</div>
                <div className="text-sm text-slate-500">Depuis le {tenant.entryDate || "N/A"}</div>
              </div>
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center justify-center text-slate-400">
              <p>Aucun locataire assigné à ce logement.</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Edit Unit Modal */}
      <Modal isOpen={isEditUnitModalOpen} onClose={() => setIsEditUnitModalOpen(false)} title="Modifier le Logement">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Référence</label>
              <input 
                type="text" 
                value={editRef}
                onChange={(e) => setEditRef(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select 
                value={editType}
                onChange={(e) => setEditType(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option>Appartement</option>
                <option>Studio</option>
                <option>Chambre</option>
                <option>Villa entière</option>
                <option>Dépendance</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loyer (FCFA)</label>
              <input 
                type="number" 
                value={editRent}
                onChange={(e) => setEditRent(Number(e.target.value))}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Étage</label>
              <input 
                type="text" 
                value={editFloor}
                onChange={(e) => setEditFloor(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Chambres</label>
            <input 
              type="number" 
              value={editBeds}
              onChange={(e) => setEditBeds(Number(e.target.value))}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Statut du logement</label>
            <select 
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              disabled={editStatus === "Occupé"}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="Vacant">Vacant</option>
              <option value="Maintenance">En maintenance</option>
              {editStatus === "Occupé" && <option value="Occupé">Occupé</option>}
            </select>
            {editStatus === "Occupé" && (
              <p className="text-xs text-slate-500 mt-1.5 flex items-start gap-1">
                <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                Un logement occupé ne peut être modifié. Libérez d'abord le locataire associé.
              </p>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button onClick={() => setIsEditUnitModalOpen(false)} className="px-5 h-11 rounded-full text-slate-600 font-medium hover:bg-slate-100 transition-colors">
              Annuler
            </button>
            <button onClick={handleUpdateUnit} disabled={isSaving} className="px-5 h-11 rounded-full bg-white border border-slate-400 text-slate-900  font-medium hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
              {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
