"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Plus, Search, Filter, Eye, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Unit, Property, Tenant } from "@/lib/mock-data";
import { addTenant, updateTenant, deleteTenant, addPayment } from "@/lib/supabase-api";
import { useTenants, useUnits, useProperties } from "@/hooks/useData";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { DatePicker } from "@/components/ui/DatePicker";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/Skeletons";
import Link from "next/link";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

export default function TenantsPage() {
  const { tenants, isLoading: isTenantsLoading, refreshTenants } = useTenants();
  const { units, isLoading: isUnitsLoading } = useUnits();
  const { properties, isLoading: isPropsLoading } = useProperties();
  const isLoading = isTenantsLoading || isUnitsLoading || isPropsLoading;
  
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("Tous");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [idCardReference, setIdCardReference] = useState("");
  const [unitId, setUnitId] = useState(""); 
  const [rentAmount, setRentAmount] = useState(150000);
  const [entryDate, setEntryDate] = useState("");
  const [leaseType, setLeaseType] = useState<any>("Habitation");
  const [leaseEndDate, setLeaseEndDate] = useState("");
  const [advanceMonths, setAdvanceMonths] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("Espèces");

  const statuses = ["Tous", "À jour", "En retard"];

  const filteredTenants = tenants.filter(tenant => {
    const matchesSearch = tenant.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "Tous" || tenant.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const vacantUnits = units.filter(u => u.status === "Vacant");

  // Default unit ID if none selected
  useEffect(() => {
    if (!unitId && vacantUnits.length > 0 && !editId) {
      setUnitId(vacantUnits[0].id);
      setRentAmount(vacantUnits[0].rent);
    }
  }, [vacantUnits, unitId, editId]);

  const handleUnitChange = (newUnitId: string) => {
    setUnitId(newUnitId);
    const selectedUnit = units.find(u => u.id === newUnitId);
    if (selectedUnit) {
      setRentAmount(selectedUnit.rent);
    }
  };

  const handleSaveTenant = async () => {
    if (!fullName || !phone) return;
    
    setIsSaving(true);
    try {
      if (editId) {
        const updates = {
          fullName,
          phone,
          email,
          idCardReference: idCardReference || "N/A",
          unitId,
          rentAmount: Number(rentAmount),
          entryDate,
          leaseType,
          leaseEndDate: leaseEndDate || undefined,
          leaseStatus: "Actif"
        };
        await updateTenant(editId, updates);
        toast.success("Locataire modifié avec succès");
      } else {
        const newTenant = {
          fullName,
          phone,
          email,
          address: "Non renseigné",
          idCardReference: idCardReference || "N/A",
          unitId,
          entryDate: entryDate || new Date().toISOString().split('T')[0],
          leaseType,
          leaseEndDate: leaseEndDate || undefined,
          leaseStatus: "Actif" as const,
          rentAmount: Number(rentAmount),
          depositAmount: Number(rentAmount) * 2,
          status: "À jour" as const,
          advanceMonths: Number(advanceMonths),
          paymentMethod: paymentMethod
        };
        const createdTenant = await addTenant(newTenant);
        setHighlightedId(createdTenant.id);
        setTimeout(() => setHighlightedId(null), 10000);
        toast.success("Locataire ajouté avec succès");
      }
      
      setIsModalOpen(false);
      setEditId(null);
      setFullName("");
      setPhone("");
      setEmail("");
      setIdCardReference("");
      setEntryDate("");
      setLeaseEndDate("");
      setLeaseType("Habitation");
      refreshTenants();
    } catch (error) {
      toast.error("Une erreur est survenue");
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (tenant: any) => {
    setEditId(tenant.id);
    setFullName(tenant.fullName);
    setPhone(tenant.phone);
    setEmail(tenant.email);
    setIdCardReference(tenant.idCardReference || "");
    setUnitId(tenant.unitId || "");
    setRentAmount(tenant.rentAmount);
    setEntryDate(tenant.entryDate);
    setLeaseType(tenant.leaseType || "Habitation");
    setLeaseEndDate(tenant.leaseEndDate || "");
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditId(null);
    setFullName("");
    setPhone("");
    setEmail("");
    setIdCardReference("");
    const vacantUnits = units.filter(u => u.status === "Vacant");
    if (vacantUnits.length > 0) {
      setUnitId(vacantUnits[0].id);
      setRentAmount(vacantUnits[0].rent);
    } else {
      setUnitId("");
      setRentAmount(0);
    }
    setEntryDate(new Date().toISOString().split('T')[0]);
    setLeaseType("Habitation");
    setLeaseEndDate("");
    setAdvanceMonths(1);
    setPaymentMethod("Espèces");
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteTenant(deleteId);
      setDeleteId(null);
      refreshTenants();
      toast.success("Locataire supprimé");
    }
  };

  const columns = [
    {
      header: "Locataire",
      cell: (item: any) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-slate-100 hidden sm:flex items-center justify-center text-slate-600 font-bold text-sm">
            {item.fullName.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-slate-900 whitespace-normal break-words leading-tight">{item.fullName}</div>
            <div className="text-xs text-slate-500">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Logement",
      cell: (item: any) => {
        const unit = units.find(u => u.id === item.unitId);
        const prop = properties.find(p => p.id === unit?.propertyId);
        return unit ? (
          <div>
            <div className="font-medium text-slate-700">{unit.reference} - {unit.type}</div>
            <div className="text-xs text-slate-500">{prop?.name}</div>
          </div>
        ) : (
          <span className="text-slate-400 italic">Non assigné</span>
        );
      },
    },
    {
      header: "Téléphone",
      accessorKey: "phone" as const,
      cell: (item: any) => <span className="text-slate-600 font-medium">{item.phone}</span>,
    },
    {
      header: "Loyer actuel",
      cell: (item: any) => (
        <span className="font-medium text-slate-900">{item.rentAmount.toLocaleString()} FCFA</span>
      ),
    },
    {
      header: "Statut",
      cell: (item: any) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          item.status === "À jour" ? "bg-[#dcfce7] text-[#22c55e]" : "bg-[#fef08a] text-[#eab308]"
        }`}>
          {item.status}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (item: any) => (
        <div className="flex justify-end gap-1">
          <button 
            onClick={() => {
              // Ensure we have a valid format (e.g. 237699... without '+')
              // Note: If users store phone as '06...', it might need country code.
              // For a simple wa.me link, we strip everything except numbers.
              const formattedPhone = item.phone.replace(/[^0-9]/g, '');
              const message = item.status === "En retard" 
                ? `Bonjour ${item.fullName},\nSauf erreur de notre part, nous n'avons pas encore reçu le paiement de votre loyer.\nMerci de régulariser la situation au plus vite.\nCordialement.`
                : `Bonjour ${item.fullName},`;
              window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
            }}
            className="p-2 text-slate-400 hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-full transition-colors" title="Contacter sur WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
          <Link href={`/tenants/${item.id}`}>
            <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors" title="Voir profil">
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
        title="Locataires" 
        description="Gérez tous vos locataires et leurs contrats"
        actions={
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher (nom, email)..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 pl-10 pr-4 rounded-full bg-white border-0 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full sm:w-64 transition-all"
              />
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
                  <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Statut Paiement</div>
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
              onClick={openAddModal}
              className="flex h-11 items-center justify-center rounded-full bg-white border border-slate-400 text-slate-900 px-5 text-sm font-medium  shadow-md hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors whitespace-nowrap"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouveau Locataire
            </motion.button>
          </>
        }
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Modifier le Locataire" : "Nouveau Locataire"}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
              <input 
                type="tel" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Numéro de CNI / Passeport</label>
              <input 
                type="text" 
                value={idCardReference}
                onChange={(e) => setIdCardReference(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                placeholder="Ex: 123456789"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Assigner un logement</label>
            <select 
              value={unitId}
              onChange={(e) => handleUnitChange(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">Sélectionner un logement (Optionnel)</option>
              {units.filter(u => u.status === "Vacant" || u.id === unitId).map(u => (
                <option key={u.id} value={u.id}>{u.reference} - {u.type}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Loyer mensuel (FCFA)</label>
              <input 
                type="number" 
                value={rentAmount}
                onChange={(e) => setRentAmount(Number(e.target.value))}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date d'entrée / Début du contrat</label>
              <DatePicker 
                value={entryDate}
                onChange={setEntryDate}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type de bail</label>
              <select 
                value={leaseType}
                onChange={(e) => setLeaseType(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="Habitation">Bail d'habitation</option>
                <option value="Commercial">Bail commercial</option>
                <option value="Meublé">Bail meublé</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Date de fin du bail (Optionnel)</label>
              <DatePicker 
                value={leaseEndDate}
                onChange={setLeaseEndDate}
              />
            </div>
          </div>
          
          {!editId && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mois de loyer d'avance payés</label>
                <input 
                  type="number" 
                  min="0"
                  value={advanceMonths}
                  onChange={(e) => setAdvanceMonths(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Moyen de paiement</label>
                <select 
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={advanceMonths === 0}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
                >
                  <option value="Espèces">Espèces</option>
                  <option value="Mobile Money">Mobile Money</option>
                  <option value="Virement">Virement Bancaire</option>
                  <option value="Chèque">Chèque</option>
                </select>
              </div>
            </div>
          )}

          <button 
            onClick={handleSaveTenant}
            disabled={isSaving}
            className="w-full h-11 mt-4 rounded-full bg-white border border-slate-400 text-slate-900  font-medium hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? "Enregistrement..." : (editId ? "Enregistrer" : "Créer le locataire")}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer ce locataire ?"
        message="Êtes-vous sûr de vouloir supprimer ce locataire ? Toutes ses données seront effacées."
        confirmText="Supprimer"
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <DataTable 
          data={filteredTenants.map(t => ({ ...t, isNew: t.id === highlightedId }))} 
          columns={columns} 
          emptyMessage="Aucun locataire trouvé." 
        />
      </motion.div>
    </div>
  );
}
