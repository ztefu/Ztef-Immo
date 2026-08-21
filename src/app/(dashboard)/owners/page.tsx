"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Plus, Search, Filter, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Owner, Property } from "@/lib/mock-data";
import { getOwners, getProperties, addOwner, deleteOwner, updateOwner } from "@/lib/supabase-api";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/Skeletons";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function OwnersPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("Tous");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [managementType, setManagementType] = useState<"Déléguée" | "Autonome">("Déléguée");
  const [commissionRate, setCommissionRate] = useState(10);

  const managementTypes = ["Tous", "Déléguée", "Autonome"];

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [o, p] = await Promise.all([
          getOwners(),
          getProperties()
        ]);
        setOwners(o);
        setProperties(p);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [refreshTrigger]);

  const filteredOwners = owners.filter(owner => {
    const matchesSearch = owner.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          owner.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "Tous" || owner.managementType === filterType;
    return matchesSearch && matchesType;
  });

  const handleSaveOwner = async () => {
    if (!fullName || !phone) return;
    
    setIsSaving(true);
    try {
      if (editId) {
        const updates = {
          fullName,
          phone,
          email,
          address,
          managementType,
          commissionRate: managementType === "Déléguée" ? Number(commissionRate) : 0,
        };
        await updateOwner(editId, updates);
      } else {
        const newOwner = {
          fullName,
          phone,
          email,
          address,
          managementType,
          commissionRate: managementType === "Déléguée" ? Number(commissionRate) : 0,
          joinDate: new Date().toISOString().split('T')[0],
        };
        const createdOwner = await addOwner(newOwner as any);
        setHighlightedId(createdOwner.id);
        setTimeout(() => setHighlightedId(null), 10000);
      }
      
      setIsModalOpen(false);
      setEditId(null);
      setFullName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setManagementType("Déléguée");
      setCommissionRate(10);
      setRefreshTrigger(t => t + 1);
    } finally {
      setIsSaving(false);
    }
  };

  const openEditModal = (owner: any) => {
    setEditId(owner.id);
    setFullName(owner.fullName);
    setPhone(owner.phone);
    setEmail(owner.email);
    setAddress(owner.address);
    setManagementType(owner.managementType);
    setCommissionRate(owner.commissionRate);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditId(null);
    setFullName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setManagementType("Déléguée");
    setCommissionRate(10);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteOwner(deleteId);
      setDeleteId(null);
      setRefreshTrigger(t => t + 1);
    }
  };

  const columns = [
    {
      header: "Propriétaire",
      accessorKey: "fullName" as const,
      cell: (item: any) => (
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold mr-3">
            {item.fullName ? item.fullName.charAt(0) : '?'}
          </div>
          <div>
            <div className="font-bold text-slate-900">{item.fullName}</div>
            <div className="text-sm text-slate-500">{item.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: "Contact",
      accessorKey: "phone" as const,
      cell: (item: any) => <span className="text-slate-600 font-medium">{item.phone}</span>,
    },
    {
      header: "Propriétés",
      cell: (item: any) => {
        const props = properties.filter(p => p.ownerId === item.id);
        return <span className="font-bold text-slate-700">{props.length} {props.length > 1 ? 'biens' : 'bien'}</span>;
      },
    },
    {
      header: "Type de Gestion",
      accessorKey: "managementType" as const,
      cell: (item: any) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          item.managementType === "Déléguée" ? "bg-[#dbeafe] text-[#3b82f6]" : "bg-[#f3e8ff] text-[#a855f7]"
        }`}>
          {item.managementType} {item.managementType === "Déléguée" && `(${item.commissionRate}%)`}
        </span>
      ),
    },
    {
      header: "Actions",
      cell: (item: any) => (
        <div className="flex items-center gap-2">
          <Link href={`/owners/${item.id}`}>
            <button className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-full transition-colors">
              <Eye className="h-4 w-4" />
            </button>
          </Link>
          <button 
            onClick={() => openEditModal(item)}
            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          </button>
          <button 
            onClick={() => setDeleteId(item.id)}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
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
    <div className="flex flex-col gap-8 relative">
      <PageHeader 
        title="Propriétaires" 
        description="Gérez vos propriétaires et leurs commissions"
        actions={
          <>
            <div className="relative z-10">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher un propriétaire..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 h-11 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-full sm:w-64 bg-white shadow-sm"
                />
              </div>
            </div>
            <div className="relative">
              <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="flex h-11 items-center gap-2 rounded-full border border-slate-200 bg-white px-5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Type de gestion</span>
              </button>
              
              {isFilterOpen && (
                <div className="absolute top-12 left-0 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                  <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Type de Gestion</div>
                  {managementTypes.map((type) => (
                    <button
                      key={type}
                      className={`w-full text-left px-4 py-2 text-sm transition-colors ${filterType === type ? 'bg-primary/5 text-primary font-medium' : 'text-slate-700 hover:bg-slate-50'}`}
                      onClick={() => {
                        setFilterType(type);
                        setIsFilterOpen(false);
                      }}
                    >
                      {type}
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
              Nouveau Propriétaire
            </motion.button>
          </>
        }
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editId ? "Modifier le Propriétaire" : "Nouveau Propriétaire"}>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet / Entreprise</label>
            <input 
              type="text" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
              placeholder="Ex: Dr. Kamga"
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
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
            <input 
              type="text" 
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
            />
          </div>
          
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mt-2">
            <h4 className="font-bold text-slate-900 mb-3 text-sm">Contrat & Gestion</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type de gestion</label>
                <select 
                  value={managementType}
                  onChange={(e) => setManagementType(e.target.value as any)}
                  className="w-full h-11 px-4 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  disabled
                >
                  <option value="Déléguée">Déléguée (Agence)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Commission Agence (%)</label>
                <input 
                  type="number" 
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  disabled={managementType === "Autonome"}
                  className="w-full h-11 px-4 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all disabled:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed" 
                />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-3">
              {managementType === "Déléguée" 
                ? "L'agence prélève ce pourcentage sur les loyers encaissés avant le reversement au propriétaire." 
                : "Le propriétaire gère lui-même. Aucune commission d'agence ne s'applique."}
            </p>
          </div>

          <button 
            onClick={handleSaveOwner}
            disabled={isSaving}
            className="w-full h-11 mt-4 rounded-full bg-white border border-slate-400 text-slate-900  font-medium hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? "Enregistrement..." : (editId ? "Enregistrer" : "Créer le propriétaire")}
          </button>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Supprimer ce propriétaire ?"
        message="Êtes-vous sûr de vouloir supprimer ce propriétaire ? Attention, cette action ne supprimera pas ses propriétés mais les laissera sans propriétaire assigné."
        confirmText="Supprimer"
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <DataTable data={filteredOwners.map(o => ({ ...o, isNew: o.id === highlightedId }))} columns={columns} emptyMessage="Aucun propriétaire trouvé." />
      </motion.div>
    </div>
  );
}
