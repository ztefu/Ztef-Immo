"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Search, Wrench, Calendar, MapPin, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import toast from "react-hot-toast";
import { Ticket, Unit } from "@/lib/mock-data";
import { getTickets, getUnits, addTicket, updateTicket } from "@/lib/supabase-api";
import { useTickets, useUnits } from "@/hooks/useData";
import { createClient } from "@/utils/supabase/client";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/Skeletons";

export default function MaintenancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tous");
  
  // Data State
  const { tickets, refreshTickets, isLoading: isTicketsLoading } = useTickets();
  const { units, isLoading: isUnitsLoading } = useUnits();
  const isLoading = isTicketsLoading || isUnitsLoading;

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Form State for Add
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Ticket["priority"]>("Moyenne");
  const [category, setCategory] = useState<Ticket["category"]>("Autre");
  const [unitId, setUnitId] = useState("");

  // Set up real-time subscription for tickets
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('realtime-maintenance-tickets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        (payload) => {
          refreshTickets();
          if (payload.eventType === 'INSERT') {
            toast.success("Nouveau ticket reçu !");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "Tous" || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !unitId) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    const unit = units.find(u => u.id === unitId);
    
    const newTicket: any = {
      title,
      description,
      priority,
      category,
      status: "Nouveau",
      unitId: unitId || undefined,
      propertyId: unit?.propertyId || undefined,
      tenantId: unit?.tenantId || undefined,
    };

    setIsSaving(true);
    try {
      const createdTicket = await addTicket(newTicket);
      toast.success("Ticket créé");
      setHighlightedId(createdTicket.id);
      setTimeout(() => setHighlightedId(null), 10000);
      setIsAddModalOpen(false);
      setTitle("");
      setDescription("");
      setPriority("Moyenne");
      setUnitId("");
      refreshTickets();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la création du ticket.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStatus = async (newStatus: Ticket["status"]) => {
    if (!selectedTicket || isSaving) return;
    
    setIsSaving(true);
    const updates: Partial<Ticket> = { status: newStatus };
    try {
      await updateTicket(selectedTicket.id, updates);
      setSelectedTicket({ ...selectedTicket, ...updates });
      toast.success(`Statut mis à jour : ${newStatus}`);
      refreshTickets();
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de la mise à jour.");
    } finally {
      setIsSaving(false);
    }
  };

  // --- Render Helpers ---

  const getPriorityBadge = (p: Ticket["priority"]) => {
    switch(p) {
      case "Urgente": return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 shadow-sm"><AlertCircle className="w-3 h-3 mr-1" />Urgente</span>;
      case "Haute": return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 border border-orange-200"><AlertCircle className="w-3 h-3 mr-1" />Haute</span>;
      case "Moyenne": return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">Moyenne</span>;
      case "Basse": return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">Basse</span>;
    }
  };

  const getStatusBadge = (s: Ticket["status"]) => {
    switch(s) {
      case "Nouveau": return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200"><AlertCircle className="w-3 h-3 mr-1" />Nouveau</span>;
      case "En cours": return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200"><Clock className="w-3 h-3 mr-1" />En cours</span>;
      case "Résolu": return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />Résolu</span>;
    }
  };

  const columns = [
    {
      header: "Problème",
      cell: (ticket: Ticket) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-900 line-clamp-1">{ticket.title}</span>
          <span className="text-xs text-slate-500 line-clamp-1 mt-0.5">{ticket.description}</span>
        </div>
      )
    },
    {
      header: "Logement",
      cell: (ticket: Ticket) => {
        const unit = units.find(u => u.id === ticket.unitId);
        return (
          <div className="flex items-center text-slate-700">
            <MapPin className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <span className="truncate max-w-[150px]">{unit ? `Réf: ${unit.reference}` : "N/A"}</span>
          </div>
        );
      }
    },
    {
      header: "Priorité",
      cell: (ticket: Ticket) => getPriorityBadge(ticket.priority)
    },
    {
      header: "Statut",
      cell: (ticket: Ticket) => getStatusBadge(ticket.status)
    },
    {
      header: "Date",
      cell: (ticket: Ticket) => (
        <div className="flex items-center text-slate-500">
          <Calendar className="w-4 h-4 mr-2 shrink-0" />
          <span className="text-sm">{new Date(ticket.createdAt).toLocaleDateString()}</span>
        </div>
      )
    }
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
    <div className="w-full">
      <PageHeader
        title="Maintenance"
        description="Gérez les tickets d'intervention et suivez l'état des logements."
        actions={
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-white border border-slate-400 text-slate-900  px-5 py-2.5 rounded-full hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors text-sm font-semibold shadow-sm w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            Nouveau Ticket
          </button>
        }
      />

      <div className="bg-white rounded-[32px] p-4 sm:p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100">
        
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Rechercher un problème..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400"
            />
          </div>
          <div className="flex overflow-x-auto gap-2 pb-2 sm:pb-0 scrollbar-hide" style={{ scrollbarWidth: 'none' }}>
            {["Tous", "Nouveau", "En cours", "Résolu"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-full text-sm font-semibold transition-all ${
                  filterStatus === status 
                    ? "bg-white border border-slate-400 text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 shadow-md" 
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        <DataTable 
          data={filteredTickets.map(t => ({ ...t, isNew: t.id === highlightedId }))} 
          columns={columns} 
          onRowClick={(ticket) => {
            setSelectedTicket(ticket as Ticket);
            setIsViewModalOpen(true);
          }}
        />

      </div>

      {/* --- ADD TICKET MODAL --- */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsAddModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-900/10 flex items-center justify-center">
                    <Wrench className="w-4 h-4 text-slate-900" />
                  </div>
                  Nouveau Ticket
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Titre du problème</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ex: Fuite d'eau dans la salle de bain"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[16px] focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description détaillée</label>
                    <textarea 
                      required
                      placeholder="Décrivez le problème..."
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-[16px] focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm font-medium resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Logement (Optionnel)</label>
                      <select 
                        value={unitId}
                        onChange={e => setUnitId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[16px] focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm font-medium"
                      >
                        <option value="">Sélectionner</option>
                        {units.map(u => (
                          <option key={u.id} value={u.id}>{u.reference} ({u.status})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Catégorie</label>
                      <select 
                        value={category}
                        onChange={e => setCategory(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[16px] focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm font-medium"
                      >
                        <option value="Plomberie">Plomberie</option>
                        <option value="Électricité">Électricité</option>
                        <option value="Menuiserie">Menuiserie</option>
                        <option value="Gros œuvre">Gros œuvre</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Priorité</label>
                      <select 
                        value={priority}
                        onChange={e => setPriority(e.target.value as any)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[16px] focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all text-sm font-medium"
                      >
                        <option value="Basse">Basse</option>
                        <option value="Moyenne">Moyenne</option>
                        <option value="Haute">Haute</option>
                        <option value="Urgente">Urgente</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="flex-1 px-4 py-2.5 rounded-full border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors">
                    Annuler
                  </button>
                  <button type="submit" disabled={isSaving} className="flex-1 px-4 py-2.5 rounded-full bg-white border border-slate-400 text-slate-900  font-semibold text-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
                    {isSaving ? "Création..." : "Créer le ticket"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- VIEW/UPDATE TICKET MODAL --- */}
      <AnimatePresence>
        {isViewModalOpen && selectedTicket && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsViewModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[32px] shadow-2xl overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">Détails du Ticket</h3>
                <button onClick={() => setIsViewModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  {getStatusBadge(selectedTicket.status)}
                  {getPriorityBadge(selectedTicket.priority)}
                </div>

                <h4 className="text-xl font-bold text-slate-900 mb-2">{selectedTicket.title}</h4>
                <p className="text-slate-600 text-sm bg-slate-50 p-4 rounded-[16px] leading-relaxed mb-6">
                  {selectedTicket.description}
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-medium">Logement</p>
                      <p className="text-slate-900 font-semibold">{units.find(u => u.id === selectedTicket.unitId)?.reference || "N/A"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                      <Calendar className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs font-medium">Créé le</p>
                      <p className="text-slate-900 font-semibold">{new Date(selectedTicket.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-6">
                  <p className="text-sm font-semibold text-slate-700 mb-3">Mettre à jour le statut</p>
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => handleUpdateStatus("Nouveau")}
                      disabled={isSaving}
                      className={`py-2 px-3 rounded-[12px] text-xs font-bold transition-all ${selectedTicket.status === "Nouveau" ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-500' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Nouveau
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus("En cours")}
                      disabled={isSaving}
                      className={`py-2 px-3 rounded-[12px] text-xs font-bold transition-all ${selectedTicket.status === "En cours" ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-500' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      En cours
                    </button>
                    <button 
                      onClick={() => handleUpdateStatus("Résolu")}
                      disabled={isSaving}
                      className={`py-2 px-3 rounded-[12px] text-xs font-bold transition-all ${selectedTicket.status === "Résolu" ? 'bg-green-100 text-green-700 ring-2 ring-green-500' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'} disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      Résolu
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
