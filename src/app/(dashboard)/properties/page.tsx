"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Plus, Search, Filter, MapPin, Building2, Home, Users, Building, Trees } from "lucide-react";
import { motion } from "framer-motion";
import { Property, Owner, Unit } from "@/lib/mock-data";
import { getProperties, getOwners, getUnits, addProperty } from "@/lib/supabase-api";
import { useProperties, useOwners, useUnits } from "@/hooks/useData";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { PageHeaderSkeleton, PropertyCardSkeleton, FormSkeleton } from "@/components/ui/Skeletons";
import Link from "next/link";
import { useState, useEffect } from "react";
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

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("Tous");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0); 
  const [isSaving, setIsSaving] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  const { isOwner, agencyId, userName, isLoading: isAgencyLoading } = useAgency();

  const { properties, isLoading: isPropsLoading, refreshProperties } = useProperties();
  const { owners, isLoading: isOwnersLoading } = useOwners();
  const { units, isLoading: isUnitsLoading } = useUnits();
  const isLoading = isPropsLoading || isOwnersLoading || isUnitsLoading;

  // Form states
  const [newName, setNewName] = useState("");
  const [newType, setNewType] = useState("Immeuble résidentiel");
  const [newOwner, setNewOwner] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newArea, setNewArea] = useState(0);

  const handleCreateProperty = async () => {
    if (!newName || !newLocation || (!isOwner && !newOwner)) return;
    
    setIsSaving(true);
    try {
      let selectedOwnerId = newOwner;
      let selectedOwnerName = "Inconnu";

      if (isOwner && agencyId) {
        selectedOwnerId = agencyId; // agencyId holds the owner ID for autonomous owners
        selectedOwnerName = userName;
      } else if (newOwner) {
        const selectedOwnerObj = owners.find(o => o.id === newOwner);
        if (selectedOwnerObj) selectedOwnerName = selectedOwnerObj.fullName;
      }
      
      const parts = newLocation.split(',');
      
      const createdProperty = await addProperty({
        name: newName,
        type: newType,
        address: newLocation,
        city: parts.length > 1 ? parts[parts.length - 1].trim() : parts[0].trim(),
        neighborhood: parts.length > 1 ? parts.slice(0, -1).join(", ").trim() : "",
        ownerId: isOwner ? agencyId || "" : newOwner,
        owner: isOwner ? userName : owners.find(o => o.id === newOwner)?.fullName || "Inconnu",
        status: "Actif",
        area: Number(newArea),
        description: "Nouvelle propriété",
        imageUrl: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=400&h=300"
      });
      
      setHighlightedId(createdProperty.id);
      setTimeout(() => setHighlightedId(null), 10000);
      
      setIsModalOpen(false);
      setNewName("");
      setNewType("Immeuble résidentiel");
      setNewOwner("");
      setNewLocation("");
      setNewArea(0);
      refreshProperties();
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          property.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          property.neighborhood.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "Tous" || property.type === filterType;
    return matchesSearch && matchesType;
  });

  const propertyTypes = ["Tous", "Immeuble résidentiel", "Cité résidentielle", "Résidence", "Villa"];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 relative w-full">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeader 
        title="Propriétés" 
        description="Gérez votre parc immobilier"
        actions={
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher..." 
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
                {filterType === "Tous" ? "Filtres" : filterType}
              </button>
              
              {isFilterOpen && (
                <div className="absolute top-12 left-0 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                  <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Type de propriété</div>
                  {propertyTypes.map((type) => (
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
              onClick={() => setIsModalOpen(true)}
              className="flex h-11 items-center justify-center rounded-full bg-white border border-slate-400 text-slate-900 px-5 text-sm font-medium  shadow-md hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors whitespace-nowrap"
            >
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Propriété
            </motion.button>
          </>
        }
      />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Nouvelle Propriété">
        {isAgencyLoading ? (
          <FormSkeleton />
        ) : (
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la propriété</label>
              <input 
                type="text" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                placeholder="Ex: Résidence Les Palmiers" 
              />
            </div>
            <div className={isOwner ? "grid grid-cols-1 gap-4" : "grid grid-cols-2 gap-4"}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                <select 
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                >
                  <option>Immeuble résidentiel</option>
                  <option>Cité résidentielle</option>
                  <option>Résidence</option>
                  <option>Villa</option>
                </select>
              </div>
              {!isOwner && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Propriétaire</label>
                  <select 
                    value={newOwner}
                    onChange={(e) => setNewOwner(e.target.value)}
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
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                  placeholder="Ex: Yaoundé, Bastos" 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Superficie totale (m²)</label>
                <input 
                  type="number" 
                  value={newArea}
                  onChange={(e) => setNewArea(Number(e.target.value))}
                  className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
                />
              </div>
            </div>
            <button 
              onClick={handleCreateProperty}
              disabled={isSaving}
              className="w-full h-11 mt-4 rounded-full bg-white border border-slate-400 text-slate-900  font-medium hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSaving ? "Enregistrement..." : "Créer la propriété"}
            </button>
          </div>
        )}
      </Modal>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {filteredProperties.map((property) => {
          const propUnits = units.filter(u => u.propertyId === property.id);
          const stats = {
            total: propUnits.length,
            occupied: propUnits.filter(u => u.status === "Occupé").length,
            vacant: propUnits.filter(u => u.status === "Vacant").length,
            maintenance: propUnits.filter(u => u.status === "Maintenance").length
          };
          
          return (
            <Link href={`/properties/${property.id}`} key={property.id}>
              <div className={`bg-white rounded-[24px] overflow-hidden shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1.5 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300 group flex flex-col h-full border border-slate-100 ${property.id === highlightedId ? 'animate-highlight' : ''}`}>
                {/* Property Type Icon Drawing */}
                <div className="h-48 w-full relative bg-slate-50 flex items-center justify-center overflow-hidden">
                  <PropertyIcon type={property.type} className="h-28 w-28 text-slate-300 group-hover:text-primary/40 transition-colors duration-500 group-hover:scale-110" />
                  <div className="absolute top-4 right-4 z-10">
                    <StatusBadge status={property.status} />
                  </div>
                  <div className="absolute bottom-4 left-4 z-10 flex items-center gap-2">
                    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center text-xs font-bold text-slate-700 shadow-sm">
                      <Building2 className="h-3.5 w-3.5 mr-1.5 text-primary" />
                      {property.type}
                    </div>
                  </div>
                </div>

                <div className="p-6 flex flex-col grow">
                  <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-primary transition-colors">{property.name}</h3>
                  <div className="flex items-center text-sm font-medium text-slate-500 mb-6">
                    <MapPin className="h-4 w-4 mr-1 text-slate-400" />
                    {property.neighborhood}, {property.city}
                  </div>

                  <div className="grid grid-cols-4 gap-2 mb-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center truncate">
                        <Home className="h-3 w-3 mr-1 shrink-0" /> Total
                      </span>
                      <span className="text-lg font-bold text-slate-900">{stats.total}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center truncate">
                        <Users className="h-3 w-3 mr-1 shrink-0" /> Occ.
                      </span>
                      <span className="text-lg font-bold text-[#22c55e]">{stats.occupied}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center truncate">
                        <Building className="h-3 w-3 mr-1 shrink-0" /> Vac.
                      </span>
                      <span className="text-lg font-bold text-[#eab308]">{stats.vacant}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1 flex items-center truncate">
                        <svg className="h-3 w-3 mr-1 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m14.7 6.3-1.4 1.4"></path><path d="m21.6 12-4.1 4.1c-1.2 1.2-3.1 1.2-4.2 0-1.2-1.2-1.2-3.1 0-4.2l4.1-4.1c1.2-1.2 3.1-1.2 4.2 0 1.2 1.2 1.2 3.1 0 4.2Z"></path><path d="m2.8 21.2 7-7"></path></svg> Maint.
                      </span>
                      <span className="text-lg font-bold text-[#3b82f6]">{stats.maintenance}</span>
                    </div>
                  </div>

                  <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex items-center text-sm">
                      <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold mr-2">
                        {property.owner ? property.owner.charAt(0) : '?'}
                      </div>
                      <span className="font-medium text-slate-700">{property.owner}</span>
                    </div>
                    <div className="text-sm font-bold text-primary">
                      Voir détails &rarr;
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </motion.div>
    </div>
  );
}
