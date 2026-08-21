"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { ArrowLeft, Building2, MapPin, Users, Home, Wallet, Eye, Info, Building, Trees } from "lucide-react";
import { motion } from "framer-motion";
import { Property, Owner, Unit, Tenant } from "@/lib/mock-data";
import { getUnits, getProperties, getTenants, getOwners, deleteProperty, updateProperty, addUnit, updateUnit, deleteUnit } from "@/lib/supabase-api";
import { useProperties, useOwners, useUnits, useTenants } from "@/hooks/useData";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PageHeaderSkeleton, FormSkeleton } from "@/components/ui/Skeletons";
import Link from "next/link";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAgency } from "@/hooks/useAgency";

const PropertyIcon = ({ type, className }: { type: string, className?: string }) => {
  const t = (type || "").toLowerCase();
  if (t.includes('appartement')) return <Building className={className} strokeWidth={1} />;
  if (t.includes('immeuble')) return <Building2 className={className} strokeWidth={1} />;
  if (t.includes('villa') || t.includes('maison')) return <Home className={className} strokeWidth={1} />;
  if (t.includes('cité')) return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" 
      className={className}
    >
      <path d="M3 13l4-3 4 3v6H3z" />
      <path d="M6 19v-3h2v3" />
      <path d="M11 11l5-4 5 4v8h-10z" />
      <path d="M15 19v-4h2v4" />
    </svg>
  );
  return <Building className={className} strokeWidth={1} />;
};

export default function PropertyDetailPage({ params }: { params: { id: string } }) {
  const { properties, refreshProperties, isLoading: isPropsLoading } = useProperties();
  const { owners, isLoading: isOwnersLoading } = useOwners();
  const { units: unitsData, refreshUnits, isLoading: isUnitsLoading } = useUnits();
  const { tenants: tenantsData, isLoading: isTenantsLoading } = useTenants();

  const [property, setProperty] = useState<Property | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const { isOwner, isLoading: isAgencyLoading } = useAgency();

  const [stats, setStats] = useState({ total: 0, occupied: 0, vacant: 0, maintenance: 0, expectedRent: 0 });

  const [isEditPropModalOpen, setIsEditPropModalOpen] = useState(false);
  const [isDeletePropModalOpen, setIsDeletePropModalOpen] = useState(false);
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [deleteUnitId, setDeleteUnitId] = useState<string | null>(null);
  const [editUnitId, setEditUnitId] = useState<string | null>(null);

  // Property edit form state
  const [propName, setPropName] = useState("");
  const [propType, setPropType] = useState("");
  const [propOwnerId, setPropOwnerId] = useState("");
  const [propAddress, setPropAddress] = useState("");
  const [propArea, setPropArea] = useState(0);

  // Unit form state
  const [newRef, setNewRef] = useState("");
  const [newType, setNewType] = useState("Appartement");
  const [newBeds, setNewBeds] = useState(2);
  const [newRent, setNewRent] = useState(150000);
  const [newFloor, setNewFloor] = useState("RDC");
  const [newStatus, setNewStatus] = useState<any>("Vacant");

  useEffect(() => {
    if (isPropsLoading || isOwnersLoading || isUnitsLoading || isTenantsLoading) {
      setIsLoading(true);
      return;
    }

    const p = properties.find(prop => prop.id === params.id);
    if (p) {
      setProperty(p);
      setPropName(p.name);
      setPropType(p.type);
      setPropOwnerId(p.ownerId || "");
      setPropAddress(`${p.neighborhood || ""}, ${p.city || ""}`.replace(/^,\s*/, ""));
      setPropArea(p.area || 0);
      
      const propUnits = unitsData.filter(u => u.propertyId === p.id);
      setUnits(propUnits);
      setTenants(tenantsData);

      // Calculate stats
      const total = propUnits.length;
      const occupied = propUnits.filter(u => u.status === "Occupé").length;
      const vacant = propUnits.filter(u => u.status === "Vacant").length;
      const maintenance = propUnits.filter(u => u.status === "Maintenance").length;
      const expectedRent = propUnits.reduce((sum, u) => sum + (u.rent || 0), 0);
      
      setStats({ total, occupied, vacant, maintenance, expectedRent });
    }
    
    setIsLoading(false);
  }, [params.id, properties, unitsData, tenantsData, isPropsLoading, isOwnersLoading, isUnitsLoading, isTenantsLoading]);

  const handleUpdateProperty = async () => {
    if (!propName || !propAddress || (!isOwner && !propOwnerId) || !property) return;
    const selectedOwnerObj = owners.find(o => o.id === propOwnerId);
    
    setIsSaving(true);
    try {
      await updateProperty(property.id, {
        name: propName,
        type: propType,
        ownerId: isOwner ? undefined : propOwnerId,
        owner: isOwner ? undefined : (selectedOwnerObj ? selectedOwnerObj.fullName : "Inconnu"),
        city: propAddress.split(',')[0]?.trim() || propAddress,
        neighborhood: propAddress.split(',')[1]?.trim() || "",
        area: Number(propArea),
      });
      setIsEditPropModalOpen(false);
      refreshProperties();
      toast.success("Propriété mise à jour");
    } catch (e) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProperty = async () => {
    if (!property) return;
    setIsSaving(true);
    try {
      await deleteProperty(property.id);
      toast.success("Propriété supprimée avec succès");
      window.location.href = "/properties";
    } catch (e) {
      toast.error("Erreur lors de la suppression de la propriété");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveUnit = async () => {
    if (!newRef || !property) return;
    
    setIsSaving(true);
    try {
      if (editUnitId) {
        await updateUnit(editUnitId, {
          reference: newRef,
          type: newType,
          bedrooms: Number(newBeds),
          rent: Number(newRent),
          floor: newFloor,
          status: newStatus || undefined
        });
        toast.success("Logement mis à jour");
      } else {
        await addUnit({
          propertyId: property.id,
          reference: newRef,
          type: newType,
          bedrooms: Number(newBeds),
          floor: newFloor,
          rent: Number(newRent),
          deposit: Number(newRent) * 2,
          status: newStatus || "Vacant",
          tenantId: null
        } as any);
        toast.success("Logement ajouté");
      }
      
      setIsUnitModalOpen(false);
      setEditUnitId(null);
      setNewRef("");
      refreshUnits();
    } catch (e) {
      toast.error("Erreur lors de la sauvegarde du logement");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditUnitModal = (unit: any) => {
    setEditUnitId(unit.id);
    setNewRef(unit.reference);
    setNewType(unit.type);
    setNewBeds(unit.bedrooms || 2);
    setNewRent(unit.rent || 150000);
    setNewFloor(unit.floor || "");
    setNewStatus(unit.status);
    setIsUnitModalOpen(true);
  };

  const openAddUnitModal = () => {
    setEditUnitId(null);
    setNewRef("");
    setNewType("Appartement");
    setNewBeds(2);
    setNewRent(150000);
    setNewFloor("RDC");
    setNewStatus("Vacant");
    setIsUnitModalOpen(true);
  };

  const handleDeleteUnit = async () => {
    if (!deleteUnitId) return;
    setIsSaving(true);
    try {
      await deleteUnit(deleteUnitId);
      setDeleteUnitId(null);
      refreshUnits();
      toast.success("Logement supprimé");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la suppression");
    } finally {
      setIsSaving(false);
    }
  };

  const getUnitTenant = (unitId: string) => tenants.find(t => t.unitId === unitId);

  const columns = [
    {
      header: "Logement",
      accessorKey: "reference" as const,
      cell: (item: any) => (
        <span className="font-bold text-slate-900">{item.reference}</span>
      ),
    },
    {
      header: "Type",
      accessorKey: "type" as const,
      cell: (item: any) => (
        <span className="text-slate-600">{item.type}</span>
      ),
    },
    {
      header: "Locataire",
      cell: (item: any) => {
        const tenant = getUnitTenant(item.id);
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
        <span className="font-medium text-slate-900">{(item.rent || 0).toLocaleString()} FCFA</span>
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
            onClick={() => openEditUnitModal(item)}
            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors" title="Modifier"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-pencil"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
          </button>
          <button 
            onClick={() => setDeleteUnitId(item.id)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Supprimer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
          </button>
        </div>
      ),
    },
  ];

  if (isLoading || isAgencyLoading) {
    return (
      <div className="flex flex-col gap-8 relative w-full">
        <PageHeaderSkeleton />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Propriété introuvable</h2>
        <Link href="/properties" className="text-primary hover:underline">Retour à la liste</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/properties" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux propriétés
        </Link>
        <PageHeader 
          title={property.name} 
          description="Détails et gestion de la propriété"
          actions={
            <>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditPropModalOpen(true)}
                className="flex h-11 items-center justify-center rounded-full bg-white border border-slate-400 text-slate-900 px-5 text-sm font-medium  shadow-md hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors whitespace-nowrap"
              >
                Modifier
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsDeletePropModalOpen(true)}
                className="flex h-11 items-center justify-center rounded-full bg-white border border-red-200 px-5 text-sm font-medium text-red-600 shadow-sm hover:bg-red-50 hover:border-red-300 transition-colors whitespace-nowrap"
              >
                Supprimer
              </motion.button>
            </>
          }
        />
      </div>

      {/* Property Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.1 }}
        className="bg-white rounded-[32px] p-6 lg:p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col lg:flex-row gap-8"
      >
        <div className="lg:w-1/3 flex flex-col">
          <div className="h-48 w-full rounded-[20px] relative bg-slate-50 flex items-center justify-center overflow-hidden mb-6 group cursor-default">
            <PropertyIcon type={property.type} className="h-28 w-28 text-slate-300 group-hover:text-primary/40 transition-colors duration-500 group-hover:scale-110" />
            <div className="absolute top-4 right-4 z-10">
              <StatusBadge status={property.status} />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">{property.name}</h2>
          <div className="flex items-start text-sm font-medium text-slate-500 mb-4">
            <MapPin className="h-4 w-4 mr-2 text-slate-400 mt-0.5" />
            <span>{property.address}</span>
          </div>
          
          <div className="pt-6 mt-auto border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Propriétaire</div>
            <div className="flex items-center text-sm">
              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold mr-3 text-lg">
                {(property.owner || "?").charAt(0)}
              </div>
              <span className="font-bold text-slate-700 text-base">{property.owner}</span>
            </div>
          </div>
        </div>

        <div className="lg:w-2/3 flex flex-col">
          <h3 className="text-[17px] font-bold text-slate-900 mb-6">Statistiques</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 rounded-[20px] p-5 border border-slate-100 flex items-center">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                <Home className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-500">Logements</div>
                <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-[20px] p-5 border border-slate-100 flex items-center">
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-4">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-500">Taux d'occupation</div>
                <div className="text-2xl font-bold text-slate-900">{stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0}%</div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-[20px] p-5 border border-slate-100 flex items-center">
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-4">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-500">Revenus Mensuels Estimés</div>
                <div className="text-2xl font-bold text-slate-900">{stats.expectedRent.toLocaleString()} FCFA</div>
              </div>
            </div>
            <div className="bg-slate-50 rounded-[20px] p-5 border border-slate-100 flex flex-col justify-center">
               <div className="flex justify-between items-center mb-2">
                 <span className="text-sm font-medium text-slate-500">Occupés</span>
                 <span className="text-sm font-bold text-slate-900">{stats.occupied}</span>
               </div>
               <div className="flex justify-between items-center mb-2">
                 <span className="text-sm font-medium text-slate-500">Vacants</span>
                 <span className="text-sm font-bold text-slate-900">{stats.vacant}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-sm font-medium text-slate-500">En maintenance</span>
                 <span className="text-sm font-bold text-slate-900">{stats.maintenance}</span>
               </div>
            </div>
          </div>
          
          <div className="mt-8">
            <h3 className="text-[17px] font-bold text-slate-900 mb-3">Informations complémentaires</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {property.description || "Aucune description fournie pour cette propriété."}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Units Table */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col gap-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-bold text-slate-900">Logements de la propriété</h2>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openAddUnitModal}
            className="flex h-10 items-center justify-center rounded-full bg-white border border-slate-200 px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            Ajouter un logement
          </motion.button>
        </div>
        
        <DataTable data={units} columns={columns} emptyMessage="Aucun logement n'est enregistré pour cette propriété." />
      </motion.div>

      {/* Edit Property Modal */}
      <Modal isOpen={isEditPropModalOpen} onClose={() => setIsEditPropModalOpen(false)} title="Modifier la Propriété">
        {isAgencyLoading ? (
          <FormSkeleton />
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la propriété</label>
              <input 
                type="text" 
                value={propName}
                onChange={(e) => setPropName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
            <div className={isOwner ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 gap-4"}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select 
                  value={propType}
                  onChange={(e) => setPropType(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option>Immeuble Résidentiel</option>
                  <option>Cité résidentielle</option>
                  <option>Résidence</option>
                  <option>Villa</option>
                </select>
              </div>
              {!isOwner && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Propriétaire</label>
                  <select 
                    value={propOwnerId}
                    onChange={(e) => setPropOwnerId(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    <option value="">Sélectionner un propriétaire</option>
                    {owners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                <input 
                  type="text" 
                  value={propAddress}
                  onChange={(e) => setPropAddress(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Superficie totale (m²)</label>
                <input 
                  type="number" 
                  value={propArea}
                  onChange={(e) => setPropArea(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button onClick={() => setIsEditPropModalOpen(false)} className="px-5 h-11 rounded-full text-slate-600 font-medium hover:bg-slate-100 transition-colors">
                Annuler
              </button>
              <button onClick={handleUpdateProperty} disabled={isSaving} className="px-5 h-11 rounded-full bg-white border border-slate-400 text-slate-900  font-medium hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmModal
        isOpen={isDeletePropModalOpen}
        onClose={() => setIsDeletePropModalOpen(false)}
        onConfirm={handleDeleteProperty}
        title="Supprimer la propriété"
        message="Êtes-vous sûr de vouloir supprimer cette propriété ? Cette action est irréversible et supprimera également tous les logements associés."
        confirmText="Supprimer"
        cancelText="Annuler"
      />

      {/* Add / Edit Unit Modal */}
      <Modal isOpen={isUnitModalOpen} onClose={() => setIsUnitModalOpen(false)} title={editUnitId ? "Modifier Logement" : "Nouveau Logement"}>
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
            <label className="block text-sm font-medium text-slate-700 mb-1">Chambres</label>
            <input 
              type="number" 
              value={newBeds}
              onChange={(e) => setNewBeds(Number(e.target.value))}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
            />
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
          <div className="flex justify-end gap-3 mt-8">
            <button onClick={() => setIsUnitModalOpen(false)} className="px-5 h-11 rounded-full text-slate-600 font-medium hover:bg-slate-100 transition-colors">
              Annuler
            </button>
            <button onClick={handleSaveUnit} disabled={isSaving} className="px-5 h-11 rounded-full bg-white border border-slate-400 text-slate-900  font-medium hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
              {isSaving ? "Enregistrement..." : (editUnitId ? "Enregistrer" : "Ajouter le logement")}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteUnitId}
        onClose={() => setDeleteUnitId(null)}
        onConfirm={handleDeleteUnit}
        title="Supprimer ce logement ?"
        message="Êtes-vous sûr de vouloir supprimer ce logement ? Cette action est irréversible."
        confirmText="Supprimer"
      />
    </div>
  );
}
