"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Plus, Search, Filter, Eye, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Unit, Property, Tenant } from "@/lib/mock-data";
import { getUnits, getProperties, getTenants, addUnit, updateUnit, deleteUnit } from "@/lib/supabase-api";
import { useUnits, useProperties, useTenants } from "@/hooks/useData";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable } from "@/components/ui/DataTable";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/Skeletons";
import Link from "next/link";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function UnitsPage() {
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("Toutes");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("Tous");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [newStatus, setNewStatus] = useState<any>("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editUnitId, setEditUnitId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const { units, isLoading: isUnitsLoading, refreshUnits } = useUnits();
  const { properties, isLoading: isPropsLoading } = useProperties();
  const { tenants, isLoading: isTenantsLoading } = useTenants();
  const isLoading = isUnitsLoading || isPropsLoading || isTenantsLoading;

  // Form states
  const [newRef, setNewRef] = useState("");
  const [newProp, setNewProp] = useState("");
  const [newType, setNewType] = useState("Appartement");
  const [newBeds, setNewBeds] = useState(2);
  const [newRent, setNewRent] = useState(150000);
  const [newFloor, setNewFloor] = useState("RDC");

  useEffect(() => {
    if (!newProp && properties.length > 0) {
      setNewProp(properties[0].id);
    }
  }, [properties, newProp]);

  useEffect(() => {
    if (newType === "Chambre" || newType === "Studio") {
      setNewBeds(1);
    }
  }, [newType]);

  const handleCreateUnit = async () => {
    if (!newRef || !newProp) return;
    
    setIsSaving(true);
    try {
      const createdUnit = await addUnit({
        propertyId: newProp,
        reference: newRef,
        type: newType,
        bedrooms: Number(newBeds),
        floor: newFloor,
        rent: Number(newRent),
        deposit: Number(newRent) * 2,
        status: "Vacant",
        tenantId: null
      });
      
      setHighlightedId(createdUnit.id);
      setTimeout(() => setHighlightedId(null), 10000);
      
      setIsModalOpen(false);
      setNewRef("");
      refreshUnits();
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditUnit = async () => {
    if (!editUnitId) return;
    setIsSaving(true);
    try {
      await updateUnit(editUnitId, {
        reference: newRef,
        propertyId: newProp,
        type: newType,
        bedrooms: Number(newBeds),
        floor: newFloor,
        rent: Number(newRent),
        status: newStatus || undefined
      });
      setEditUnitId(null);
      setNewRef("");
      setRefreshTrigger(t => t + 1);
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (unit: any) => {
    setEditUnitId(unit.id);
    setNewRef(unit.reference);
    setNewProp(unit.propertyId);
    setNewType(unit.type);
    setNewBeds(unit.bedrooms);
    setNewRent(unit.rent);
    setNewFloor(unit.floor);
    setNewStatus(unit.status);
  };

  const handleDeleteUnit = async () => {
    if (deleteId) {
      try {
        await deleteUnit(deleteId);
        setDeleteId(null);
        setRefreshTrigger(t => t + 1);
        toast.success("Logement supprimé avec succès");
      } catch (error: any) {
        toast.error(error.message || "Erreur lors de la suppression");
        setDeleteId(null);
      }
    }
  };

  const filteredUnits = units
    .filter(unit => {
      const matchesProperty = selectedPropertyId === "Toutes" || unit.propertyId === selectedPropertyId;
      const matchesStatus = filterStatus === "Tous" || unit.status === filterStatus;
      return matchesProperty && matchesStatus;
    })
    .sort((a, b) => a.reference.localeCompare(b.reference, undefined, { numeric: true, sensitivity: 'base' }));

  const statuses = ["Tous", "Occupé", "Vacant", "Maintenance"];

  const columns = [
    {
      header: "Référence",
      accessorKey: "reference" as const,
      cell: (item: any) => (
        <span className="font-bold text-slate-900">{item.reference}</span>
      ),
    },
    {
      header: "Propriété",
      cell: (item: any) => {
        const prop = properties.find(p => p.id === item.propertyId);
        return <span className="font-medium text-slate-700">{prop?.name || "Inconnue"}</span>;
      },
    },
    {
      header: "Étage",
      accessorKey: "floor" as const,
      cell: (item: any) => <span className="text-slate-500">{item.floor}</span>,
    },
    {
      header: "Type",
      accessorKey: "type" as const,
      cell: (item: any) => (
        <span className="text-slate-600">{item.type} <span className="text-slate-400 text-xs ml-1">({item.bedrooms} ch)</span></span>
      ),
    },
    {
      header: "Locataire",
      cell: (item: any) => {
        const tenant = tenants.find(t => t.unitId === item.id);
        return tenant ? (
          <span className="font-medium text-slate-900">{tenant.fullName}</span>
        ) : (
          <span className="text-slate-400 italic">—</span>
        );
      },
    },
    {
      header: "Loyer",
      accessorKey: "rent" as const,
      cell: (item: any) => (
        <span className="font-medium text-slate-900">{item.rent.toLocaleString()} FCFA</span>
      ),
    },
    {
      header: "Statut",
      accessorKey: "status" as const,
      cell: (item: any) => <StatusBadge status={item.status} />,
    },
    {
      header: "Actions",
      cell: (item: any) => (
        <div className="flex justify-end gap-1">
          <Link href={`/units/${item.id}`}>
            <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors" title="Voir détails">
              <Eye className="h-4 w-4" />
            </button>
          </Link>
          <button 
            onClick={() => openEditModal(item)}
            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors" title="Modifier"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
          </button>
          <button 
            onClick={() => setDeleteId(item.id)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Supprimer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
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

  return (
    <div className="flex flex-col gap-8">
      <PageHeader 
        title="Logements" 
        description="Gérez tous les logements de vos propriétés"
        actions={
          <>
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
              <select 
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
                className="h-11 pl-10 pr-10 rounded-full bg-white border-0 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full sm:w-64 transition-all appearance-none cursor-pointer text-slate-700"
              >
                <option value="Toutes">Toutes les propriétés</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                 <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-medium text-slate-700 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:bg-slate-50 transition-colors"
              >
                <Filter className="mr-2 h-4 w-4 text-slate-400" />
                {filterStatus === "Tous" ? "Filtres" : filterStatus}
              </button>
              
              {isFilterOpen && (
                <div className="absolute top-12 left-0 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                  <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Statut</div>
                  {statuses.map((status) => (
                    <button
                      key={status}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${filterStatus === status ? 'bg-primary/5 text-primary font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                      onClick={() => {
                        setFilterStatus(status);
                        setIsFilterOpen(false);
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="flex h-11 items-center justify-center rounded-full bg-white border border-slate-400 text-slate-900 px-5 text-sm font-medium  shadow-md hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors whitespace-nowrap"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Logement
            </motion.button>
          </>
        }
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouveau Logement">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Référence</label>
              <input 
                type="text" 
                value={newRef}
                onChange={(e) => setNewRef(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                placeholder="Ex: A01" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Propriété</label>
              <select 
                value={newProp}
                onChange={(e) => setNewProp(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select 
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option>Appartement</option>
                <option>Studio</option>
                <option>Chambre</option>
              </select>
            </div>
            {newType !== "Chambre" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chambres</label>
                <input 
                  type="number" 
                  value={newBeds}
                  onChange={(e) => setNewBeds(Number(e.target.value))}
                  disabled={newType === "Studio"}
                  className={`w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${newType === "Studio" ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
                  placeholder="Ex: 2" 
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loyer (FCFA)</label>
              <input 
                type="number" 
                value={newRent}
                onChange={(e) => setNewRent(Number(e.target.value))}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                placeholder="150000" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Étage</label>
              <input 
                type="text" 
                value={newFloor}
                onChange={(e) => setNewFloor(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                placeholder="Ex: RDC" 
              />
            </div>
          </div>
          <button 
            onClick={handleCreateUnit}
            disabled={isSaving}
            className="w-full h-11 mt-4 rounded-full bg-white border border-slate-400 text-slate-900  font-medium hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? "Enregistrement..." : "Créer le logement"}
          </button>
        </div>
      </Modal>

      <Modal isOpen={!!editUnitId} onClose={() => setEditUnitId(null)} title="Modifier Logement">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Référence</label>
              <input 
                type="text" 
                value={newRef}
                onChange={(e) => setNewRef(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Propriété</label>
              <select 
                value={newProp}
                onChange={(e) => setNewProp(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select 
                value={newType}
                onChange={(e) => setNewType(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option>Appartement</option>
                <option>Studio</option>
                <option>Chambre</option>
              </select>
            </div>
            {newType !== "Chambre" && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Chambres</label>
                <input 
                  type="number" 
                  value={newBeds}
                  onChange={(e) => setNewBeds(Number(e.target.value))}
                  disabled={newType === "Studio"}
                  className={`w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all ${newType === "Studio" ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}`}
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loyer (FCFA)</label>
              <input 
                type="number" 
                value={newRent}
                onChange={(e) => setNewRent(Number(e.target.value))}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Étage</label>
              <input 
                type="text" 
                value={newFloor}
                onChange={(e) => setNewFloor(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Statut du logement</label>
            <select 
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              disabled={newStatus === "Occupé"}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50 disabled:bg-slate-100 disabled:cursor-not-allowed"
            >
              <option value="Vacant">Vacant</option>
              <option value="Maintenance">En maintenance</option>
              {newStatus === "Occupé" && <option value="Occupé">Occupé</option>}
            </select>
            {newStatus === "Occupé" && (
              <p className="text-xs text-slate-500 mt-1.5 flex items-start gap-1">
                <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5" />
                Un logement occupé ne peut être modifié. Libérez d'abord le locataire associé.
              </p>
            )}
          </div>
          <button 
            onClick={handleEditUnit}
            disabled={isSaving}
            className="w-full h-11 mt-4 rounded-full bg-white border border-slate-400 text-slate-900  font-medium hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDeleteUnit}
        title="Supprimer ce logement ?"
        message="Êtes-vous sûr de vouloir supprimer ce logement ? Cette action est irréversible."
        confirmText="Supprimer"
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <DataTable data={filteredUnits.map(u => ({ ...u, isNew: u.id === highlightedId }))} columns={columns} emptyMessage="Aucun logement trouvé." />
      </motion.div>
    </div>
  );
}
