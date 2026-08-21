"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { ArrowLeft, User, Phone, Mail, MapPin, FileText, Wallet, Calendar, Download, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import { Tenant, Unit, Property, Payment } from "@/lib/mock-data";
import { addPayment, updateTenant } from "@/lib/supabase-api";
import { useTenants, useUnits, useProperties, usePayments } from "@/hooks/useData";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { DataTable } from "@/components/ui/DataTable";
import { Modal } from "@/components/ui/Modal";
import Link from "next/link";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { ContractTemplate } from "@/components/ui/ContractTemplate";
import { ReceiptTemplate } from "@/components/ui/ReceiptTemplate";
import { PDFPreviewModal } from "@/components/ui/PDFPreviewModal";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/Skeletons";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentAgency } from "@/hooks/useCurrentAgency";

export default function TenantDetailPage({ params }: { params: { id: string } }) {
  const { tenants, refreshTenants, isLoading: isTenantsLoading } = useTenants();
  const { units, isLoading: isUnitsLoading } = useUnits();
  const { properties, isLoading: isPropsLoading } = useProperties();
  const { payments: paymentsData, refreshPayments, isLoading: isPaymentsLoading } = usePayments();

  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [property, setProperty] = useState<Property | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const { currentAgency } = useCurrentAgency();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [paymentToAutoGenerate, setPaymentToAutoGenerate] = useState<Payment | null>(null);
  const [editIdCard, setEditIdCard] = useState("");
  const [editRent, setEditRent] = useState<number>(0);
  const [editEntryDate, setEditEntryDate] = useState("");
  const [editLeaseType, setEditLeaseType] = useState("Habitation");
  const [editLeaseEndDate, setEditLeaseEndDate] = useState("");
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [downloadingPaymentObj, setDownloadingPaymentObj] = useState<Payment | null>(null);
  const [pdfPreviewData, setPdfPreviewData] = useState<{ url: string, filename: string, title: string } | null>(null);

  // Payment form states
  const [paymentMonth, setPaymentMonth] = useState("Août 2026");
  const [amountPaid, setAmountPaid] = useState<number | "">("");
  const [paymentMethod, setPaymentMethod] = useState("Espèces");

  useEffect(() => {
    if (isTenantsLoading || isUnitsLoading || isPropsLoading || isPaymentsLoading) return;

    const t = tenants.find(ten => ten.id === params.id);
    if (t) {
      setTenant(t);
      setEditFullName(t.fullName);
      setEditPhone(t.phone);
      setEditEmail(t.email);
      setEditIdCard(t.idCardReference || "");
      setEditRent(t.rentAmount);
      setEditEntryDate(t.entryDate || "");
      setEditLeaseType(t.leaseType || "Habitation");
      setEditLeaseEndDate(t.leaseEndDate || "");
      
      const u = units.find(u => u.id === t.unitId);
      setUnit(u || null);
      if (u) {
        const p = properties.find(p => p.id === u.propertyId);
        setProperty(p || null);
      }
      
      const tenantPayments = paymentsData.filter(p => p.tenantId === t.id);
      setPayments(tenantPayments);
    }
  }, [params.id, tenants, units, properties, paymentsData, isTenantsLoading, isUnitsLoading, isPropsLoading, isPaymentsLoading]);

  const isLoading = isTenantsLoading || isUnitsLoading || isPropsLoading || isPaymentsLoading;

  const handleRegisterPayment = async () => {
    if (!amountPaid || !paymentMonth || !tenant) {
      toast.error("Veuillez remplir tous les champs.");
      return;
    }

    const paid = Number(amountPaid);
    const amountDue = tenant.rentAmount;
    const isFullPayment = paid >= amountDue;
    const newStatus = isFullPayment ? "Payé" : "Partiellement payé";

    setIsSaving(true);
    try {
      const newCreatedPayment = await addPayment({
        tenantId: tenant.id,
        month: paymentMonth,
        amountDue: amountDue,
        amountPaid: paid,
        date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
        status: newStatus as any,
        paymentMethod: paymentMethod as any
      });

      setIsPaymentModalOpen(false);
      setAmountPaid("");
      setPaymentMonth("Septembre 2026");
      setPaymentMethod("Espèces");
      refreshPayments();
      toast.success("Paiement enregistré");
      
      if (newCreatedPayment) {
        setPaymentToAutoGenerate(newCreatedPayment);
      }
    } catch (e) {
      toast.error("Erreur lors de l'enregistrement du paiement");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleUpdateProfile = async () => {
    if (!tenant) return;
    
    setIsSaving(true);
    try {
      await updateTenant(tenant.id, {
        fullName: editFullName,
        phone: editPhone,
        email: editEmail,
      });
      
      setIsEditModalOpen(false);
      refreshTenants();
      toast.success("Locataire mis à jour");
    } catch (e) {
      toast.error("Erreur lors de la mise à jour");
    } finally {
      setIsSaving(false);
    }
  };

  const formatFrenchDate = (dateStr?: string) => {
    if (!dateStr) return "";
    if (/[a-zA-Z]/.test(dateStr)) return dateStr; 
    
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };



  const handleDownloadContract = async () => {
    if (!tenant) return;
    setIsDownloading('contract');
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const template = document.getElementById(`contract-pdf-template-${tenant.id}`);
      if (!template) throw new Error("Template not found");
      const canvas = await html2canvas(template, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [794, 1123] });
      pdf.addImage(imgData, 'JPEG', 0, 0, 794, 1123);
      
      // 1. Generate Base64
      const pdfDataUri = pdf.output('datauristring');
      
      // 2. Upload to Supabase and update tenant via Server Action
      const { uploadContractAction } = await import('@/app/actions/uploadContract');
      const url = await uploadContractAction(tenant.id, pdfDataUri);
      
      if (!url) throw new Error("Échec de l'upload");
      
      setTenant({ ...tenant, contractUrl: url } as any);
      
      // 3. Open the preview instead of downloading automatically
      const filename = `Contrat_Bail_${tenant.fullName.replace(/\s+/g, '_')}.pdf`;
      setPdfPreviewData({ url, filename, title: "Contrat de Bail généré" });
      
      toast.success("Contrat généré et sauvegardé pour le locataire !");
    } catch (error) {
      console.error("Erreur lors de la génération du PDF", error);
      toast.error("Erreur lors de la génération du contrat");
    } finally {
      setIsDownloading(null);
    }
  };

  useEffect(() => {
    if (paymentToAutoGenerate) {
      generateReceiptPDF(paymentToAutoGenerate, false);
      setPaymentToAutoGenerate(null);
    }
  }, [paymentToAutoGenerate]);

  const generateReceiptPDF = async (payment: Payment, showPreview: boolean = true) => {
    if (!tenant) return;
    setIsDownloading(payment.id);
    setDownloadingPaymentObj(payment);
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const template = document.getElementById(`receipt-pdf-template-${payment.id}`);
      if (!template) throw new Error("Template not found");
      const canvas = await html2canvas(template, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [794, 1123] });
      pdf.addImage(imgData, 'JPEG', 0, 0, 794, 1123);
      
      const pdfDataUri = pdf.output('datauristring');
      
      const { uploadReceiptAction } = await import('@/app/actions/uploadContract');
      const url = await uploadReceiptAction(payment.id, pdfDataUri);
      
      if (!url) throw new Error("Échec de l'upload de la quittance");
      
      // Update local state to reflect the new receipt URL immediately
      setPayments(payments.map(p => p.id === payment.id ? { ...p, receiptUrl: url } : p) as any);
      
      const filename = `Quittance_${payment.month.replace(/\s+/g, '_')}_${tenant.fullName.replace(/\s+/g, '_')}.pdf`;
      
      if (showPreview) {
        setPdfPreviewData({ url, filename, title: "Quittance générée" });
        toast.success("Quittance générée et enregistrée avec succès !");
      }
    } catch (error) {
      toast.error("Erreur lors de la génération de la quittance");
    } finally {
      setIsDownloading(null);
      setDownloadingPaymentObj(null);
    }
  };

  const paymentColumns = [
    {
      header: "Période",
      accessorKey: "month" as const,
      cell: (item: any) => <span className="font-bold text-slate-900">{item.month}</span>,
    },
    {
      header: "Date de paiement",
      accessorKey: "date" as const,
      cell: (item: any) => <span className="text-slate-600">{item.date}</span>,
    },
    {
      header: "Montant Dû",
      cell: (item: any) => <span className="font-medium text-slate-900">{(item.amountDue || 0).toLocaleString()} FCFA</span>,
    },
    {
      header: "Montant Payé",
      cell: (item: any) => <span className="font-medium text-slate-900">{(item.amountPaid || 0).toLocaleString()} FCFA</span>,
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
      header: "Quittance",
      cell: (item: any) => (
        <div className="flex justify-end">
          <button 
            disabled={item.status !== "Payé" || isDownloading === item.id}
            onClick={() => generateReceiptPDF(item)}
            className={`p-2 rounded-full transition-colors ${
              item.status === "Payé" 
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
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-20">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
              <Skeleton className="h-24 w-24 rounded-full mx-auto mb-4" />
              <Skeleton className="h-6 w-3/4 mx-auto mb-2" />
              <Skeleton className="h-4 w-1/2 mx-auto mb-6" />
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]">
              <Skeleton className="h-8 w-1/3 mb-6" />
              <div className="grid grid-cols-2 gap-6">
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
                <Skeleton className="h-16 w-full rounded-2xl" />
              </div>
            </div>
            <TableSkeleton />
          </div>
        </div>
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Locataire introuvable</h2>
        <Link href="/tenants" className="text-primary hover:underline">Retour à la liste</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/tenants" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux locataires
        </Link>
        <PageHeader 
          title={tenant.fullName} 
          description="Profil du locataire et gestion du contrat"
          actions={
            <>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsEditModalOpen(true)}
                className="flex h-11 items-center justify-center rounded-full bg-white border border-slate-400 text-slate-900 px-5 text-sm font-medium  shadow-md hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors whitespace-nowrap"
              >
                Modifier le profil
              </motion.button>
            </>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="flex flex-col gap-6 lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-[32px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center text-center"
          >
            <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-4xl mb-4">
              {tenant.fullName.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{tenant.fullName}</h2>
            <div className="mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                tenant.status === "À jour" ? "bg-[#dcfce7] text-[#22c55e]" : "bg-[#fef08a] text-[#eab308]"
              }`}>
                {tenant.status}
              </span>
            </div>

            <div className="w-full flex flex-col gap-4 text-left border-t border-slate-100 pt-6">
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 text-slate-400 mr-3" />
                <span className="font-medium text-slate-700">{tenant.phone}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 text-slate-400 mr-3" />
                <span className="font-medium text-slate-700">{tenant.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 text-slate-400 mr-3" />
                <span className="font-medium text-slate-700">{tenant.address || "Adresse non renseignée"}</span>
              </div>
              <div className="flex items-center text-sm mt-2 p-3 bg-slate-50 rounded-xl">
                <FileText className="h-4 w-4 text-slate-400 mr-3" />
                <span className="font-medium text-slate-500 text-xs">CNI: {tenant.idCardReference}</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100"
          >
            <h3 className="text-[17px] font-bold text-slate-900 flex items-center mb-4">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Documents
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><FileText className="h-4 w-4" /></div>
                  <div>
                    <div className="text-sm font-bold text-slate-700">Contrat de Bail</div>
                    <div className="text-xs text-slate-500">Document généré automatiquement</div>
                  </div>
                </div>
                <div className="flex gap-2">

                  <button 
                    disabled={isDownloading === 'contract'}
                    onClick={handleDownloadContract} 
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold bg-white border border-slate-400 text-slate-900  rounded-md hover:bg-slate-900 hover:text-white hover:border-slate-900 disabled:opacity-50" 
                  >
                    {isDownloading === 'contract' ? (
                      <div className="animate-spin w-3 h-3 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <Download className="h-3 w-3" />
                    )}
                    Générer & Enregistrer
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-[32px] p-6 lg:p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Détails du Contrat</h3>
              <span className="px-3 py-1 bg-green-100 text-green-600 text-xs font-bold rounded-full uppercase tracking-wider">{tenant.leaseStatus || "Actif"}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-[20px] p-4 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center">
                  <MapPin className="h-3.5 w-3.5 mr-1" /> Logement Associé
                </div>
                {unit ? (
                  <>
                    <div className="font-bold text-slate-900">{unit.reference} - {unit.type}</div>
                    <div className="text-sm text-slate-500">{property?.name}</div>
                  </>
                ) : (
                  <div className="text-sm italic text-slate-400">Aucun logement assigné</div>
                )}
              </div>
              <div className="bg-slate-50 rounded-[20px] p-4 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center">
                  <FileText className="h-3.5 w-3.5 mr-1" /> Type de bail
                </div>
                <div className="font-bold text-slate-900">{tenant.leaseType || "Bail d'habitation"}</div>
              </div>

              <div className="bg-slate-50 rounded-[20px] p-4 border border-slate-100 flex items-center">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-4">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Loyer Mensuel</div>
                  <div className="text-lg font-bold text-slate-900">{(tenant.rentAmount || 0).toLocaleString()} FCFA</div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-[20px] p-4 border border-slate-100 flex items-center">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-4">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-500">Dépôt de Garantie</div>
                  <div className="text-lg font-bold text-slate-900">{(tenant.depositAmount || 0).toLocaleString()} FCFA</div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-[20px] p-4 border border-slate-100">
                <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center">
                  <Calendar className="h-3.5 w-3.5 mr-1" /> Date d'entrée
                </div>
                <div className="font-bold text-slate-900">{formatFrenchDate(tenant.entryDate)}</div>
              </div>
              {tenant.leaseEndDate ? (
                <div className="bg-slate-50 rounded-[20px] p-4 border border-slate-100">
                  <div className="text-xs font-semibold text-slate-500 mb-1 flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" /> Date de fin
                  </div>
                  <div className="font-bold text-slate-900">{formatFrenchDate(tenant.leaseEndDate)}</div>
                </div>
              ) : (
                <div className="hidden md:block"></div>
              )}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.25 }}
            className="flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Historique des Paiements</h3>
              <button onClick={() => setIsPaymentModalOpen(true)} className="text-sm font-medium text-primary hover:text-blue-700 transition-colors">
                Enregistrer un paiement
              </button>
            </div>
            
            {tenant.status === "En retard" && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-[20px] p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Paiement en retard</h4>
                  <p className="text-xs mt-1">Ce locataire a un ou plusieurs paiements en attente. Veuillez régulariser la situation.</p>
                </div>
              </div>
            )}
            
            <DataTable 
              data={payments} 
              columns={paymentColumns} 
              emptyMessage="Aucun historique de paiement pour le moment." 
            />
          </motion.div>
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modifier le Profil">
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom complet</label>
            <input 
              type="text" 
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
              <input 
                type="tel" 
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input 
                type="email" 
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" 
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-8">
            <button onClick={() => setIsEditModalOpen(false)} className="px-5 h-11 rounded-full text-slate-600 font-medium hover:bg-slate-100 transition-colors">
              Annuler
            </button>
            <button onClick={handleUpdateProfile} disabled={isSaving} className="px-5 h-11 rounded-full bg-white border border-slate-400 text-slate-900  font-medium hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed">
              {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={isPaymentModalOpen} onClose={() => setIsPaymentModalOpen(false)} title="Enregistrer un paiement">
        <div className="flex flex-col gap-5">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-2 flex items-center justify-between">
            <div>
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Locataire</div>
              <div className="font-bold text-slate-900">{tenant.fullName}</div>
            </div>
            <div className="text-right">
              <div className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Loyer Dû</div>
              <div className="font-bold text-slate-900">{(tenant.rentAmount || 0).toLocaleString()} FCFA</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Période (Mois)</label>
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Montant Payé</label>
            <div className="relative">
              <input 
                type="number" 
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value ? Number(e.target.value) : "")}
                placeholder={(tenant.rentAmount || 0).toString()}
                className="w-full h-11 px-4 pr-16 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-bold text-slate-900" 
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">FCFA</span>
            </div>
            {Number(amountPaid) > 0 && Number(amountPaid) < tenant.rentAmount && (
              <div className="text-xs text-orange-500 mt-2 font-medium flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Reste à payer: {(tenant.rentAmount - Number(amountPaid)).toLocaleString()} FCFA
              </div>
            )}
          </div>

          <button 
            onClick={handleRegisterPayment}
            disabled={!amountPaid || isSaving}
            className="w-full h-11 mt-2 rounded-full bg-white border border-slate-400 text-slate-900  font-medium hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Enregistrement..." : "Confirmer le paiement"}
          </button>
        </div>
      </Modal>

      {/* Hidden PDF Templates */}
      <div className="fixed top-0 left-0 -z-50 opacity-[0.01] pointer-events-none">
        {tenant && isDownloading === 'contract' && (
          <div key={`template-wrapper-contract-${tenant.id}`}>
             <ContractTemplate 
               tenant={tenant} 
               unit={unit || null} 
               agency={currentAgency}
               property={property || null}
             />
          </div>
        )}
        {downloadingPaymentObj && tenant && (
          <div key={`template-wrapper-${downloadingPaymentObj.id}`}>
             <ReceiptTemplate 
               tenant={tenant} 
               payment={downloadingPaymentObj} 
               unit={unit || null} 
               agency={currentAgency}
             />
          </div>
        )}
      </div>
      
      <PDFPreviewModal 
        isOpen={!!pdfPreviewData}
        onClose={() => setPdfPreviewData(null)}
        pdfUrl={pdfPreviewData?.url || null}
        fileName={pdfPreviewData?.filename}
        title={pdfPreviewData?.title}
      />
    </div>
  );
}
