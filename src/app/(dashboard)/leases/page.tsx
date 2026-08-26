"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Search, FileText, Download, Calendar, Filter, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Tenant, Unit, Property } from "@/lib/mock-data";
import { getTenants, getUnits, getProperties, updateTenant } from "@/lib/supabase-api";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/Skeletons";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { DatePicker } from "@/components/ui/DatePicker";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ContractTemplate } from "@/components/ui/ContractTemplate";
import { AvenantTemplate } from "@/components/ui/AvenantTemplate";
import { PDFPreviewModal } from "@/components/ui/PDFPreviewModal";
import { useCurrentAgency } from "@/hooks/useCurrentAgency";

export default function LeasesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("Tous");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [pdfPreviewData, setPdfPreviewData] = useState<{ url: string, filename: string, title?: string } | null>(null);
  const { currentAgency } = useCurrentAgency();

  // Renewal Modal State
  const [renewalTenantId, setRenewalTenantId] = useState<string | null>(null);
  const [newEndDate, setNewEndDate] = useState<string>("");
  const [newRent, setNewRent] = useState<number | "">("");
  const [isRenewing, setIsRenewing] = useState(false);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [ten, uni, prop] = await Promise.all([
          getTenants(),
          getUnits(),
          getProperties()
        ]);
        setTenants(ten);
        setUnits(uni);
        setProperties(prop);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const formatFrenchDate = (dateStr?: string) => {
    if (!dateStr || dateStr === "Non défini") return "Non défini";
    if (/[a-zA-Z]/.test(dateStr)) return dateStr;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const parseFrenchDateToTime = (dateStr: string): number => {
    if (!dateStr || dateStr === "Non défini") return NaN;
    // If it's already a standard format (e.g. 2026-08-15)
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) return d.getTime();
    
    // Fallback for French strings like "15 septembre 2026"
    const parts = dateStr.trim().split(/\s+/);
    if (parts.length >= 3) {
      const day = parseInt(parts[0], 10);
      const months: Record<string, number> = { 
        "janvier": 0, "février": 1, "mars": 2, "avril": 3, "mai": 4, "juin": 5, 
        "juillet": 6, "août": 7, "septembre": 8, "octobre": 9, "novembre": 10, "décembre": 11,
        "Janvier": 0, "Février": 1, "Mars": 2, "Avril": 3, "Mai": 4, "Juin": 5, 
        "Juillet": 6, "Août": 7, "Septembre": 8, "Octobre": 9, "Novembre": 10, "Décembre": 11
      };
      const month = months[parts[1]] !== undefined ? months[parts[1]] : 0;
      const year = parseInt(parts[2], 10);
      return new Date(year, month, day).getTime();
    }
    return NaN;
  };

  // Enrich tenants data with property/unit info to form "Leases"
  const leases = tenants.map(tenant => {
    const unit = units.find(u => u.id === tenant.unitId);
    const property = properties.find(p => p.id === unit?.propertyId);
    
    // Calculate if lease is expiring soon (less than 30 days)
    let isExpiringSoon = false;
    if (tenant.leaseEndDate && tenant.leaseEndDate !== "Non défini") {
      const endDTime = parseFrenchDateToTime(tenant.leaseEndDate);
      if (!isNaN(endDTime)) {
        const now = new Date().getTime();
        const diffTime = endDTime - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 30 && diffDays >= 0) {
          isExpiringSoon = true;
        } else if (diffDays < 0) {
          isExpiringSoon = true; // Already expired
        }
      }
    }

    const computedStatus = isExpiringSoon && tenant.leaseStatus !== "Ancien" ? "Expire bientôt" : (tenant.leaseStatus || "En attente");

    return {
      id: tenant.id,
      tenantName: tenant.fullName,
      property: property ? property.name : "N/A",
      unitRef: unit ? unit.reference : "N/A",
      type: tenant.leaseType || "Habitation",
      startDate: formatFrenchDate(tenant.entryDate),
      endDate: formatFrenchDate(tenant.leaseEndDate || "Non défini"),
      rent: tenant.rentAmount,
      status: tenant.leaseStatus || "En attente",
      computedStatus,
      isExpiringSoon
    };
  });

  const handleUpdateStatus = async (tenantId: string, newStatus: "Actif" | "Ancien") => {
    try {
      toast.loading("Mise à jour en cours...", { id: "update-status" });
      await updateTenant(tenantId, { leaseStatus: newStatus });
      setTenants(tenants.map(t => t.id === tenantId ? { ...t, leaseStatus: newStatus } : t));
      toast.success("Statut du bail mis à jour", { id: "update-status" });
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors de la mise à jour", { id: "update-status" });
    }
  };

  const handleRenewSubmit = async () => {
    if (!renewalTenantId || !newEndDate) {
      toast.error("Veuillez renseigner la nouvelle date de fin.");
      return;
    }
    setIsRenewing(true);
    try {
      const updates: any = {
        leaseEndDate: newEndDate,
        leaseStatus: "Actif"
      };
      if (newRent !== "") {
        updates.rentAmount = Number(newRent);
      }
      
      await updateTenant(renewalTenantId, updates);
      
      setTenants(tenants.map(t => {
        if (t.id === renewalTenantId) {
          return {
            ...t,
            leaseEndDate: newEndDate,
            leaseStatus: "Actif",
            rentAmount: newRent !== "" ? Number(newRent) : t.rentAmount
          };
        }
        return t;
      }));
      
      toast.success("Le bail a été renouvelé avec succès !");
      setRenewalTenantId(null);
      // Wait a moment for state to update, then trigger addendum generation
      setTimeout(() => {
        generateAddendumPDF(renewalTenantId);
      }, 500);
      
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors du renouvellement");
    } finally {
      setIsRenewing(false);
    }
  };

  const filteredLeases = leases.filter(lease => {
    const matchesSearch = lease.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          lease.property.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "Tous" || lease.type === filterType;
    return matchesSearch && matchesType;
  });

  const generateContractPDF = async (tenantId: string) => {
    setIsDownloading(tenantId);
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const template = document.getElementById(`contract-pdf-template-${tenantId}`);
      if (!template) {
        throw new Error("Template not found");
      }

      const canvas = await html2canvas(template, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [794, 1123]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, 794, 1123);
      
      const pdfDataUri = pdf.output('datauristring');
      const { uploadContractAction } = await import('@/app/actions/uploadContract');
      const url = await uploadContractAction(tenantId, pdfDataUri);
      
      if (!url) throw new Error("Échec de l'upload du contrat");
      
      const tenant = tenants.find(t => t.id === tenantId);
      if (tenant) {
        setTenants(tenants.map(t => t.id === tenantId ? { ...t, contractUrl: url } : t) as any);
      }
      
      const filename = `Contrat_Bail_${tenant?.fullName.replace(/\s+/g, '_') || "Locataire"}.pdf`;
      setPdfPreviewData({ url, filename, title: "Contrat de Bail généré" });
      
      toast.success("Contrat généré et enregistré avec succès !");
    } catch (error) {
      console.error("PDF generation failed", error);
      toast.error("Erreur lors de la génération du contrat");
    } finally {
      setIsDownloading(null);
    }
  };

  const generateAddendumPDF = async (tenantId: string) => {
    setIsDownloading(tenantId);
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const template = document.getElementById(`avenant-pdf-template-${tenantId}`);
      if (!template) {
        throw new Error("Template d'avenant introuvable");
      }

      const canvas = await html2canvas(template, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [794, 1123]
      });

      pdf.addImage(imgData, 'JPEG', 0, 0, 794, 1123);
      const pdfDataUri = pdf.output('datauristring');
      
      // Upload could go here in future if we want to store addendums
      // const url = await uploadContractAction(tenantId + "_avenant", pdfDataUri);
      
      const tenant = tenants.find(t => t.id === tenantId);
      const filename = `Avenant_Renouvellement_${tenant?.fullName.replace(/\s+/g, '_') || "Locataire"}.pdf`;
      setPdfPreviewData({ url: pdfDataUri, filename, title: "Avenant généré avec succès" });
      
    } catch (error) {
      console.error("Avenant PDF generation failed", error);
      toast.error("Erreur lors de la génération de l'avenant");
    } finally {
      setIsDownloading(null);
    }
  };

  const columns = [
    {
      header: "Locataire",
      cell: (item: any) => (
        <Link href={`/tenants/${item.id}`} className="font-bold text-slate-900 hover:text-primary transition-colors">
          {item.tenantName}
        </Link>
      ),
    },
    {
      header: "Propriété / Lot",
      cell: (item: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-slate-900">{item.property}</span>
          <span className="text-xs text-slate-500">Lot: {item.unitRef}</span>
        </div>
      ),
    },
    {
      header: "Type de Bail",
      cell: (item: any) => (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {item.type}
        </span>
      ),
    },
    {
      header: "Période",
      cell: (item: any) => (
        <div className="flex flex-col">
          <span className="text-sm text-slate-700">Début: {item.startDate}</span>
          <span className={`text-xs font-medium ${item.isExpiringSoon ? "text-orange-500" : "text-slate-500"}`}>
            Fin: {item.endDate}
          </span>
        </div>
      ),
    },
    {
      header: "Loyer (FCFA)",
      accessorKey: "rent" as const,
      cell: (item: any) => <span className="font-bold text-slate-900">{item.rent.toLocaleString()}</span>,
    },
    {
      header: "Statut",
      cell: (item: any) => {
        const isDraft = item.computedStatus === "Brouillon" || item.computedStatus === "En attente";
        const isActive = item.computedStatus === "Actif";
        const isExpiring = item.computedStatus === "Expire bientôt";
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            isDraft ? "bg-yellow-100 text-yellow-700" :
            isActive ? "bg-green-100 text-green-700" :
            isExpiring ? "bg-orange-100 text-orange-700" :
            "bg-slate-100 text-slate-700"
          }`}>
            {item.computedStatus}
          </span>
        );
      }
    },
    {
      header: "Actions",
      cell: (item: any) => (
        <div className="flex justify-end gap-2 items-center">
          {item.computedStatus === "En attente" && (
            <button 
              onClick={() => handleUpdateStatus(item.id, "Actif")}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold hover:bg-green-200 transition-colors"
            >
              Signer
            </button>
          )}
          {item.computedStatus === "Expire bientôt" && (
            <button 
              onClick={() => {
                setRenewalTenantId(item.id);
                setNewEndDate("");
                setNewRent("");
              }}
              className="px-3 py-1 bg-orange-100 text-orange-700 border border-orange-200 rounded-full text-xs font-bold hover:bg-orange-200 transition-colors"
            >
              Renouveler
            </button>
          )}
          {item.computedStatus === "Actif" && (
            <button 
              onClick={() => {
                if(confirm("Voulez-vous vraiment terminer ce bail ? Le logement sera libéré.")) {
                  handleUpdateStatus(item.id, "Ancien");
                }
              }}
              className="px-3 py-1 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-bold hover:bg-red-100 transition-colors"
            >
              Terminer
            </button>
          )}
          <button 
            disabled={isDownloading === item.id}
            onClick={() => generateContractPDF(item.id)}
            className={`p-2 rounded-full transition-colors ${
              isDownloading === item.id ? "text-slate-300 cursor-not-allowed" : "text-blue-500 hover:bg-blue-50"
            }`} 
            title="Télécharger le contrat (PDF)"
          >
            {isDownloading === item.id ? (
              <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
            ) : (
              <Download className="h-4 w-4" />
            )}
          </button>
        </div>
      ),
    },
  ];

  const leaseTypes = ["Tous", "Habitation", "Commercial", "Meublé"];
  const expiringCount = leases.filter(l => l.isExpiringSoon).length;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 relative w-full">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-slate-200 animate-pulse border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]"></div>
          ))}
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <PageHeader 
        title="Contrats de Bail" 
        description="Vue d'ensemble de tous les contrats actifs et arrivant à échéance"
        actions={
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Chercher un contrat..." 
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
                {filterType === "Tous" ? "Type" : filterType}
              </button>
              
              {isFilterOpen && (
                <div className="absolute top-12 left-0 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
                  <div className="px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">Type de bail</div>
                  {leaseTypes.map((type) => (
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
          </>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-5"
        >
          <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Contrats Actifs</div>
            <div className="text-2xl font-bold text-slate-900 leading-none">{leases.length}</div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-5"
        >
          <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Renouvellements proches</div>
            <div className="text-2xl font-bold text-slate-900 leading-none">{expiringCount}</div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-5"
        >
          <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Volume Locatif Mensuel</div>
            <div className="text-2xl font-bold text-slate-900 leading-none">
              {leases.reduce((acc, l) => acc + (l.rent || 0), 0).toLocaleString()} <span className="text-sm text-slate-500 font-medium">FCFA</span>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-[32px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100"
      >
        <DataTable data={filteredLeases} columns={columns} emptyMessage="Aucun contrat trouvé." />
      </motion.div>

      {/* Hidden PDF templates for currently downloaded contract */}
      <div className="fixed top-0 left-0 -z-50 opacity-[0.01] pointer-events-none">
        {tenants.map(tenant => {
          if (isDownloading !== tenant.id) return null;
          const unit = units.find(u => u.id === tenant.unitId);
          const property = properties.find(p => p.id === unit?.propertyId);
          
          return (
            <div key={`template-wrapper-${tenant.id}`}>
               {/* Contrat principal (pour le bouton Télécharger) */}
               <ContractTemplate 
                 tenant={tenant} 
                 unit={unit || null} 
                 agency={currentAgency}
                 property={property || null}
               />
               
               {/* Avenant (pour le bouton Renouveler) */}
               <AvenantTemplate
                 tenant={tenant}
                 unit={unit || null}
                 agency={currentAgency}
                 property={property || null}
                 newEndDate={tenant.leaseEndDate || ""}
                 newRent={tenant.rentAmount}
               />
            </div>
          );
        })}
      </div>

      <PDFPreviewModal 
        isOpen={!!pdfPreviewData}
        onClose={() => setPdfPreviewData(null)}
        pdfUrl={pdfPreviewData?.url || null}
        fileName={pdfPreviewData?.filename}
        title={pdfPreviewData?.title || "Aperçu du Document"}
      />

      <Modal isOpen={!!renewalTenantId} onClose={() => setRenewalTenantId(null)} title="Renouveler le Bail">
        {renewalTenantId && (
          <div className="flex flex-col gap-4">
            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
              <p className="text-sm text-orange-800 font-medium mb-1">
                Le bail de <strong>{leases.find(l => l.id === renewalTenantId)?.tenantName}</strong> arrive à échéance.
              </p>
              <p className="text-xs text-orange-600">
                Loyer actuel : <strong>{leases.find(l => l.id === renewalTenantId)?.rent?.toLocaleString()} FCFA</strong>
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nouvelle date de fin <span className="text-red-500">*</span></label>
              <DatePicker 
                value={newEndDate}
                onChange={setNewEndDate}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nouveau loyer mensuel (FCFA) - <span className="text-slate-400 italic">Optionnel</span></label>
              <input 
                type="number" 
                value={newRent}
                onChange={(e) => setNewRent(e.target.value ? Number(e.target.value) : "")}
                placeholder={`Ex: ${leases.find(l => l.id === renewalTenantId)?.rent}`}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
              />
              <p className="text-xs text-slate-500 mt-1">Laissez vide si le loyer reste inchangé.</p>
            </div>

            <button 
              onClick={handleRenewSubmit}
              disabled={isRenewing}
              className="w-full h-11 mt-4 rounded-full bg-primary text-white font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isRenewing ? "Enregistrement..." : "Renouveler et générer l'avenant"}
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
