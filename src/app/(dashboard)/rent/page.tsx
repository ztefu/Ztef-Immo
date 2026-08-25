"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { Plus, Search, Filter, Wallet, TrendingUp, AlertCircle, Download, CheckCircle2, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Payment, Tenant } from "@/lib/mock-data";
import { getPayments, getTenants, addPayment, getUnits, getProperties, getOwners } from "@/lib/supabase-api";
import { usePayments, useTenants, useUnits, useProperties, useOwners } from "@/hooks/useData";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Modal } from "@/components/ui/Modal";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/Skeletons";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ReceiptTemplate } from "@/components/ui/ReceiptTemplate";
import { PDFPreviewModal } from "@/components/ui/PDFPreviewModal";
import { WhatsAppBatchModal } from "@/components/ui/WhatsAppBatchModal";
import { useCurrentAgency } from "@/hooks/useCurrentAgency";

export default function RentPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const { currentAgency } = useCurrentAgency();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [paymentToAutoGenerate, setPaymentToAutoGenerate] = useState<Payment | null>(null);

  const { payments, refreshPayments, isLoading: isPaymentsLoading } = usePayments();
  const { tenants, isLoading: isTenantsLoading } = useTenants();
  const { units, isLoading: isUnitsLoading } = useUnits();
  const { properties, isLoading: isPropsLoading } = useProperties();
  const { owners, isLoading: isOwnersLoading } = useOwners();
  
  const isLoading = isPaymentsLoading || isTenantsLoading || isUnitsLoading || isPropsLoading || isOwnersLoading;

  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [downloadingPaymentObj, setDownloadingPaymentObj] = useState<Payment | null>(null);
  const [pdfPreviewData, setPdfPreviewData] = useState<{ url: string, filename: string, title?: string } | null>(null);

  // Form states for new payment
  const [selectedTenantId, setSelectedTenantId] = useState("");
  const [paymentMonth, setPaymentMonth] = useState("Août 2026");
  const [numberOfMonths, setNumberOfMonths] = useState(1);
  const [amountPaid, setAmountPaid] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("Espèces");

  const frenchMonths = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

  const getNextMonth = (currentMonthStr: string, offset: number) => {
    const [mStr, yStr] = currentMonthStr.split(" ");
    const monthIndex = frenchMonths.indexOf(mStr);
    if (monthIndex === -1) return currentMonthStr; 
    let newMonthIndex = monthIndex + offset;
    let newYear = parseInt(yStr);
    while (newMonthIndex > 11) {
      newMonthIndex -= 12;
      newYear++;
    }
    return `${frenchMonths[newMonthIndex]} ${newYear}`;
  };

  // Get tenant info if selected
  const selectedTenant = tenants.find(t => t.id === selectedTenantId);
  const baseRent = selectedTenant ? selectedTenant.rentAmount : 0;
  const amountDue = baseRent * numberOfMonths;

  // Filter payments
  const enrichedPayments = payments.map(payment => {
    const tenant = tenants.find(t => t.id === payment.tenantId);
    return {
      ...payment,
      tenantName: tenant?.fullName || "Locataire inconnu",
      tenantUnit: tenant ? (tenant as any).unitId : "N/A"
    };
  }).filter(p => p.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) || p.month.toLowerCase().includes(searchTerm.toLowerCase()));

  // Stats
  const totalCollected = enrichedPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const totalDue = enrichedPayments.reduce((sum, p) => sum + (p.amountDue || 0), 0);
  const totalPending = totalDue - totalCollected;

  // Calculate late tenants for WhatsApp Batch Reminder
  const lateTenantsList = enrichedPayments
    .filter(p => p.status === "En retard" || p.status === "Partiellement payé")
    .map(p => {
      const tenant = tenants.find(t => t.id === p.tenantId);
      return tenant ? { tenant, amountDue: p.amountDue - p.amountPaid } : null;
    })
    .filter(Boolean) as { tenant: Tenant; amountDue: number }[];

  // Commission Calculation
  let totalCommission = 0;
  payments.forEach(payment => {
    if (payment.amountPaid) {
      const tenant = tenants.find(t => t.id === payment.tenantId);
      if (tenant) {
        const unit = units.find(u => u.id === tenant.unitId);
        if (unit) {
          const property = properties.find(p => p.id === unit.propertyId);
          if (property) {
            const owner = owners.find(o => o.id === property.ownerId);
            if (owner && owner.commissionRate) {
              totalCommission += payment.amountPaid * (owner.commissionRate / 100);
            }
          }
        }
      }
    }
  });

  const handleRegisterPayment = async () => {
    if (!selectedTenantId || !amountPaid || !paymentMonth) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    const paid = Number(amountPaid);

    setIsSaving(true);
    try {
      let remainingToAllocate = paid;
      let lastCreatedPaymentId = null;

      for (let i = 0; i < numberOfMonths; i++) {
        const currentMonthName = getNextMonth(paymentMonth, i);
        
        let amountForThisMonth = 0;
        let monthStatus = "En attente";
        
        if (remainingToAllocate >= baseRent) {
          amountForThisMonth = baseRent;
          monthStatus = "Payé";
          remainingToAllocate -= baseRent;
        } else if (remainingToAllocate > 0) {
          amountForThisMonth = remainingToAllocate;
          monthStatus = "Partiellement payé";
          remainingToAllocate = 0;
        } else {
          amountForThisMonth = 0;
          monthStatus = "En attente";
        }
        
        const newPayment = {
          tenantId: selectedTenantId,
          month: currentMonthName,
          amountDue: baseRent,
          amountPaid: amountForThisMonth,
          date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
          status: monthStatus as any,
          paymentMethod: paymentMethod as any
        };
        
        const createdPayment = await addPayment(newPayment);
        lastCreatedPaymentId = createdPayment.id;
      }

      toast.success("Paiement enregistré avec succès");
      if (lastCreatedPaymentId) {
        setHighlightedId(lastCreatedPaymentId);
        setTimeout(() => setHighlightedId(null), 10000);
        
        // Trigger auto-generation of the receipt for the last created payment
        const newPayment = await getPayments().then(res => res.find(p => p.id === lastCreatedPaymentId));
        if (newPayment) {
          setPaymentToAutoGenerate(newPayment);
        }
      }
      setIsModalOpen(false);
      setSelectedTenantId("");
      setAmountPaid("");
      setNumberOfMonths(1);
      refreshPayments();
    } catch (error) {
      toast.error("Erreur lors de l'enregistrement.");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (paymentToAutoGenerate) {
      generatePDF(paymentToAutoGenerate, false);
      setPaymentToAutoGenerate(null);
    }
  }, [paymentToAutoGenerate]);

  const generatePDF = async (payment: Payment, showPreview: boolean = true) => {
    setIsDownloading(payment.id);
    setDownloadingPaymentObj(payment);
    await new Promise(resolve => setTimeout(resolve, 500)); // Laisse le temps à React de monter le template
    try {
      const template = document.getElementById(`receipt-pdf-template-${payment.id}`);
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
      const { uploadReceiptAction } = await import('@/app/actions/uploadContract');
      const url = await uploadReceiptAction(payment.id, pdfDataUri);
      
      if (!url) throw new Error("Échec de l'upload de la quittance");
      
      // Update local state to reflect the new receipt URL immediately
      refreshPayments();
      
      const tenantName = tenants.find(t => t.id === payment.tenantId)?.fullName || "Inconnu";
      const filename = `Quittance_${payment.month.replace(/\s+/g, '_')}_${tenantName.replace(/\s+/g, '_')}.pdf`;
      
      if (showPreview) {
        setPdfPreviewData({ url, filename, title: "Quittance générée" });
        toast.success("Quittance générée et enregistrée avec succès !");
      }
    } catch (error) {
      console.error("PDF generation failed", error);
      toast.error("Erreur lors de la génération du PDF");
    } finally {
      setIsDownloading(null);
      setDownloadingPaymentObj(null);
    }
  };

  const columns = [
    {
      header: "Locataire",
      cell: (item: any) => (
        <Link href={`/tenants/${item.tenantId}`} className="font-bold text-slate-900 hover:text-primary transition-colors">
          {item.tenantName}
        </Link>
      ),
    },
    {
      header: "Mois concerné",
      accessorKey: "month" as const,
      cell: (item: any) => <span className="text-slate-600">{item.month}</span>,
    },
    {
      header: "Dû / Payé",
      cell: (item: any) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{item.amountPaid.toLocaleString()} <span className="text-xs font-normal text-slate-500">FCFA payé</span></span>
          {item.amountDue > item.amountPaid && (
            <span className="text-xs font-medium text-orange-500">Reste: {(item.amountDue - item.amountPaid).toLocaleString()} FCFA</span>
          )}
        </div>
      ),
    },
    {
      header: "Date & Méthode",
      cell: (item: any) => (
        <div className="flex flex-col">
          <span className="text-sm text-slate-700">{item.date !== "-" ? item.date : "En attente"}</span>
          <span className="text-xs text-slate-400">{item.paymentMethod || "-"}</span>
        </div>
      ),
    },
    {
      header: "Statut",
      cell: (item: any) => (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
          item.status === "Payé" ? "bg-[#dcfce7] text-[#22c55e]" : 
          item.status === "Partiellement payé" ? "bg-orange-100 text-orange-600" :
          "bg-[#fef08a] text-[#eab308]"
        }`}>
          {item.status}
        </span>
      ),
    },
    {
      header: "Reçu & Relances",
      cell: (item: any) => (
        <div className="flex justify-end gap-1">
          {/* Action 1: Quittance ou Relance selon le statut */}
          {item.status === "Payé" || item.status === "Partiellement payé" ? (
            <button 
              onClick={() => {
                const tenant = tenants.find(t => t.id === item.tenantId);
                if (tenant) {
                  const formattedPhone = tenant.phone.replace(/[^0-9]/g, '');
                  const message = `Bonjour ${tenant.fullName},\n\nVotre quittance de loyer pour le mois de ${item.month} est disponible.\nVous pouvez la télécharger directement depuis votre espace locataire.\n\nCordialement, l'équipe de gestion.`;
                  window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
                }
              }}
              className="p-2 text-slate-400 hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-full transition-colors"
              title="Envoyer notification WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          ) : (
            <button 
              onClick={() => {
                const tenant = tenants.find(t => t.id === item.tenantId);
                if (tenant) {
                  const formattedPhone = tenant.phone.replace(/[^0-9]/g, '');
                  const amountToPay = item.amountDue - item.amountPaid;
                  const message = `Bonjour ${tenant.fullName},\n\nSauf erreur de notre part, nous n'avons pas encore reçu le paiement de votre loyer d'un montant de ${amountToPay.toLocaleString()} FCFA.\n\nMerci de régulariser la situation au plus vite.\n\nCordialement.`;
                  window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
                }
              }}
              className="p-2 text-slate-400 hover:text-[#25D366] hover:bg-[#25D366]/10 rounded-full transition-colors"
              title="Relancer sur WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          )}
          
          <button 
            disabled={item.status === "En retard" || item.status === "En attente" || isDownloading === item.id}
            onClick={() => generatePDF(item)}
            className={`p-2 rounded-full transition-colors ${
              item.status === "Payé" || item.status === "Partiellement payé"
                ? "text-blue-500 hover:bg-blue-50" 
                : "text-slate-300 cursor-not-allowed"
            }`} 
            title="Télécharger la quittance"
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

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 relative w-full">
        <PageHeaderSkeleton />
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 pb-10">
      <PageHeader 
        title="Loyers & Paiements" 
        description="Suivi des encaissements et génération des quittances"
        actions={
          <div className="hidden sm:flex items-center gap-3">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsWhatsAppModalOpen(true)}
              className="group flex h-11 items-center justify-center rounded-full bg-primary text-white border border-primary px-5 text-sm font-bold shadow-lg shadow-primary/20 hover:bg-transparent hover:text-primary transition-colors whitespace-nowrap"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Relances Rapides
              {lateTenantsList.length > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-white text-primary text-xs group-hover:bg-primary group-hover:text-white transition-colors">
                  {lateTenantsList.length}
                </span>
              )}
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="flex h-11 items-center justify-center rounded-full bg-transparent border border-slate-400 text-slate-900 px-5 text-sm font-medium shadow-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors whitespace-nowrap"
            >
              <Plus className="mr-2 h-4 w-4" />
              Enregistrer un paiement
            </motion.button>
          </div>
        }
      />

      {/* Stats financiers du mois (Simulés sur le global pour la démo) */}
      <div className={`grid grid-cols-1 md:grid-cols-${(currentAgency as any)?._isOwner ? '2' : '3'} gap-6`}>
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-5"
        >
          <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Total Encaissé</div>
            <div className="text-2xl font-bold text-slate-900 leading-none">{totalCollected.toLocaleString()} <span className="text-sm text-slate-500 font-medium">FCFA</span></div>
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-5"
        >
          <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 flex-shrink-0">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-500 mb-1">Reste à payer (Retards)</div>
            <div className="text-2xl font-bold text-slate-900 leading-none">{totalPending > 0 ? totalPending.toLocaleString() : "0"} <span className="text-sm text-slate-500 font-medium">FCFA</span></div>
          </div>
        </motion.div>

        {!(currentAgency as any)?._isOwner && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.4, delay: 0.15 }}
            className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-5"
          >
            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-500 mb-1">Revenus Agence (Commissions)</div>
              <div className="text-2xl font-bold text-slate-900 leading-none">{totalCommission.toLocaleString()} <span className="text-sm text-slate-500 font-medium">FCFA</span></div>
              <div className="text-xs text-slate-400 mt-1">Calculé selon les taux des propriétaires</div>
            </div>
          </motion.div>
        )}
      </div>
      {/* Mobile only add button (below stats) */}
      <div className="sm:hidden block w-full mt-2">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsModalOpen(true)}
          className="flex w-full h-11 items-center justify-center rounded-full bg-transparent border border-slate-400 text-slate-900 px-5 text-sm font-medium shadow-sm hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors whitespace-nowrap"
        >
          <Plus className="mr-2 h-4 w-4" />
          Enregistrer un paiement
        </motion.button>
      </div>


      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-white rounded-[32px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100"
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h3 className="text-xl font-bold text-slate-900">Historique des transactions</h3>
          <div className="relative w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Chercher un locataire..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-11 pl-10 pr-4 rounded-full bg-slate-50 border border-slate-200 text-sm focus:ring-2 focus:ring-primary/20 outline-none w-full sm:w-64 transition-all"
            />
          </div>
        </div>
        <DataTable data={enrichedPayments.map(p => ({ ...p, isNew: p.id === highlightedId }))} columns={columns} emptyMessage="Aucun paiement trouvé." />
      </motion.div>

      {/* Modal d'enregistrement de paiement */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Enregistrer un paiement">
        <div className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Locataire</label>
            <select 
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">Sélectionner un locataire...</option>
              {tenants.map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.fullName} - {tenant.status}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Période de début</label>
              <select 
                value={paymentMonth}
                onChange={(e) => setPaymentMonth(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option>Septembre 2026</option>
                <option>Août 2026</option>
                <option>Juillet 2026</option>
                <option>Juin 2026</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de mois</label>
              <input 
                type="number"
                min="1"
                value={numberOfMonths}
                onChange={(e) => setNumberOfMonths(Math.max(1, Number(e.target.value)))}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Méthode</label>
              <select 
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option>Espèces</option>
                <option>Mobile Money</option>
                <option>Virement bancaire</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Montant Dû</label>
              <div className="text-xl font-bold text-slate-900">{amountDue > 0 ? amountDue.toLocaleString() : "---"} FCFA</div>
              {selectedTenantId && <div className="text-xs text-slate-400 mt-1">
                {numberOfMonths > 1 ? `${numberOfMonths} x ${baseRent.toLocaleString()} FCFA` : "Loyer mensuel contractuel"}
              </div>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Montant Payé</label>
              <div className="relative">
                <input 
                  type="number" 
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value ? Number(e.target.value) : "")}
                  placeholder={amountDue.toString()}
                  className="w-full h-11 px-4 pr-16 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-900" 
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">FCFA</span>
              </div>
              {Number(amountPaid) > 0 && Number(amountPaid) < amountDue && (
                <div className="text-xs text-orange-500 mt-1 font-medium flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  Reste à payer: {(amountDue - Number(amountPaid)).toLocaleString()} FCFA
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={handleRegisterPayment}
            disabled={!selectedTenantId || !amountPaid || isSaving}
            className="w-full h-11 mt-2 rounded-full bg-white border border-slate-400 text-slate-900  font-medium hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Enregistrement..." : "Confirmer le paiement"}
          </button>
        </div>
      </Modal>

      {/* Hidden PDF templates for currently downloaded receipt */}
      <div className="fixed top-0 left-0 -z-50 opacity-[0.01] pointer-events-none">
        {downloadingPaymentObj && (() => {
          const tenant = tenants.find(t => t.id === downloadingPaymentObj.tenantId);
          if (!tenant) return null;
          const unit = units.find(u => u.id === tenant.unitId);
          return (
            <div key={`template-wrapper-${downloadingPaymentObj.id}`}>
               <ReceiptTemplate 
                 tenant={tenant} 
                 payment={downloadingPaymentObj} 
                 unit={unit || null} 
                 agency={currentAgency}
               />
            </div>
          );
        })()}
      </div>

      <PDFPreviewModal 
        isOpen={!!pdfPreviewData}
        onClose={() => setPdfPreviewData(null)}
        pdfUrl={pdfPreviewData?.url || null}
        fileName={pdfPreviewData?.filename}
        title="Aperçu de la Quittance"
      />
      
      <WhatsAppBatchModal 
        isOpen={isWhatsAppModalOpen}
        onClose={() => setIsWhatsAppModalOpen(false)}
        lateTenants={lateTenantsList}
      />
    </div>
  );
}
