"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertCircle, CreditCard, Smartphone, ChevronRight, FileText, Download, Receipt, Phone, Mail } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Tenant, Unit, Payment } from "@/lib/mock-data";
import { getTenants, getUnits, getPayments, addPayment, getProperties } from "@/lib/supabase-api";
import { useUnits, usePayments, useProperties } from "@/hooks/useData";
import { useCurrentTenant } from "@/hooks/useCurrentTenant";
import { useCurrentAgency } from "@/hooks/useCurrentAgency";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { PortalDashboardSkeleton } from "@/components/ui/Skeletons";
import { ContractTemplate } from "@/components/ui/ContractTemplate";
import { ReceiptTemplate } from "@/components/ui/ReceiptTemplate";
import { PDFPreviewModal } from "@/components/ui/PDFPreviewModal";

export default function TenantDashboard() {
  const { currentTenant, isLoadingTenant } = useCurrentTenant();
  const [currentAgency, setCurrentAgency] = useState<any>(null);
  
  useEffect(() => {
    if (currentTenant?.agencyId) {
      const agencyId = currentTenant.agencyId;
      import("@/lib/supabase-api").then((m) => {
        m.getAgencyById(agencyId).then((agency) => {
          if (agency) setCurrentAgency(agency);
        }).catch(console.error);
      });
    }
  }, [currentTenant]);
  
  const { units: unitsData, isLoading: isUnitsLoading } = useUnits();
  const { payments: paymentsData, refreshPayments, isLoading: isPaymentsLoading } = usePayments();
  const { properties: propertiesData, isLoading: isPropsLoading } = useProperties();
  
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const [currentProperty, setCurrentProperty] = useState<any>(null);
  const [tenantPayments, setTenantPayments] = useState<Payment[]>([]);

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payMethod, setPayMethod] = useState<"momo" | "card" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [advanceMonths, setAdvanceMonths] = useState(0);

  const [status, setStatus] = useState<"retard" | "ajour">("ajour");
  const [displayAmount, setDisplayAmount] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [pdfPreviewData, setPdfPreviewData] = useState<{ url: string, filename: string, title?: string } | null>(null);
  const [receiptQueue, setReceiptQueue] = useState<Payment[]>([]);

  useEffect(() => {
    if (!currentTenant || isUnitsLoading || isPaymentsLoading || isPropsLoading) return;

    const unit = unitsData.find(u => u.id === currentTenant.unitId);
    setCurrentUnit(unit || null);
    
    if (unit) {
      const property = propertiesData.find(p => p.id === unit.propertyId);
      setCurrentProperty(property || null);
    }

    const payments = paymentsData.filter(p => p.tenantId === currentTenant.id);
    setTenantPayments(payments);

    // Calculate remaining amount
    const remainingAmount = payments.reduce((sum, p) => sum + ((p.amountDue || 0) - (p.amountPaid || 0)), 0);
    setDisplayAmount(remainingAmount);
    setStatus(remainingAmount > 0 ? "retard" : "ajour");
  }, [currentTenant, unitsData, paymentsData, propertiesData, isUnitsLoading, isPaymentsLoading, isPropsLoading]);

  const isLoading = isLoadingTenant || isUnitsLoading || isPaymentsLoading || isPropsLoading;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const baseRent = currentTenant?.rentAmount || 0;
    const totalToPay = displayAmount + (advanceMonths * baseRent);
    
    if (!currentTenant || totalToPay <= 0) return;
    
    setIsProcessing(true);
    
    try {
      // 1. Pay off existing debt (simplified mock)
      if (displayAmount > 0) {
        await addPayment({
          tenantId: currentTenant.id,
          month: "Règlement dette " + new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
          amountDue: displayAmount,
          amountPaid: displayAmount,
          date: new Date().toLocaleDateString('fr-FR'),
          status: "Payé",
          paymentMethod: payMethod === "momo" ? "Mobile Money" : "Carte Bancaire"
        });
      }
      
      // 2. Generate advance payments if requested
      if (advanceMonths > 0) {
        const frenchMonths = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        const today = new Date();
        // Start from next month for advances (approximation for mock)
        
        for (let i = 0; i < advanceMonths; i++) {
          const nextDate = new Date(today.getFullYear(), today.getMonth() + 1 + i, 1);
          const monthStr = `${frenchMonths[nextDate.getMonth()]} ${nextDate.getFullYear()}`;
          
          await addPayment({
            tenantId: currentTenant.id,
            month: monthStr,
            amountDue: baseRent,
            amountPaid: baseRent,
            date: new Date().toLocaleDateString('fr-FR'),
            status: "Payé",
            paymentMethod: payMethod === "momo" ? "Mobile Money" : "Carte Bancaire"
          });
        }
      }
      
      setIsProcessing(false);
      setIsPayModalOpen(false);
      setStatus("ajour");
      setDisplayAmount(0);
      setAdvanceMonths(0);
      toast.success("Paiement effectué avec succès !");
      refreshPayments();
      
      // Enqueue created payments for background receipt generation
      getPayments().then(allPayments => {
        const sortedPayments = allPayments.filter(p => p.tenantId === currentTenant.id).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
        // Take the latest newly created payments based on advanceMonths + (displayAmount > 0 ? 1 : 0)
        const count = advanceMonths + (displayAmount > 0 ? 1 : 0);
        const newPayments = sortedPayments.slice(0, count);
        setReceiptQueue(prev => [...prev, ...newPayments]);
      });

    } catch (e) {
      console.error(e);
      toast.error("Erreur lors du paiement");
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (receiptQueue.length > 0 && currentTenant) {
      const processNextReceipt = async () => {
        const payment = receiptQueue[0];
        try {
          await new Promise(resolve => setTimeout(resolve, 500)); // wait for DOM
          const template = document.getElementById(`receipt-pdf-template-${payment.id}`);
          if (template) {
            const canvas = await html2canvas(template, { scale: 2, useCORS: true });
            const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [794, 1123] });
            pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 0, 0, 794, 1123);
            
            const pdfDataUri = pdf.output('datauristring');
            const { uploadReceiptAction } = await import('@/app/actions/uploadContract');
            await uploadReceiptAction(payment.id, pdfDataUri);
          }
        } catch (err) {
          console.error("Background receipt generation failed", err);
        } finally {
          setReceiptQueue(prev => prev.slice(1));
        }
      };
      
      processNextReceipt();
    }
  }, [receiptQueue, currentTenant]);

  const generateContractPDF = async () => {
    setIsDownloading(true);
    try {
      // Logic for PDF generation would go here
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Contrat généré avec succès");
    } catch (error) {
      console.error("PDF generation failed", error);
      toast.error("Erreur lors de la génération de la quittance");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadContract = async () => {
    if (!currentTenant) return;
    
    if (currentTenant.contractUrl) {
      setPdfPreviewData({ 
        url: currentTenant.contractUrl, 
        filename: `Contrat_Bail_${currentTenant.fullName.replace(/\s+/g, '_')}.pdf`, 
        title: "Contrat de Bail" 
      });
      return;
    }
    
    toast.error("Votre contrat n'a pas encore été finalisé par l'agence. Veuillez les contacter.");
  };


  if (isLoading || isLoadingTenant) {
    return <PortalDashboardSkeleton />;
  }

  if (!currentTenant) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <AlertCircle className="w-12 h-12 text-slate-400" />
        <p className="text-slate-500 font-medium">Profil locataire introuvable.</p>
      </div>
    );
  }

  return (
    <div className="p-5 flex flex-col gap-6">
      
      {/* Big Status Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`w-full rounded-[32px] p-6 text-white shadow-xl relative overflow-hidden ${
          status === "retard" 
            ? "bg-gradient-to-br from-red-500 to-rose-600 shadow-red-500/20" 
            : "bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20"
        }`}
      >
        <div className="relative z-10 flex flex-col items-center text-center">
          {status === "retard" ? (
            <>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-sm font-semibold opacity-90 uppercase tracking-widest mb-1">Montant dû</h2>
              <p className="text-4xl font-extrabold tracking-tight mb-6">{displayAmount.toLocaleString()} <span className="text-2xl font-semibold opacity-80">FCFA</span></p>
              
              <button 
                onClick={() => setIsPayModalOpen(true)}
                className="w-full bg-white border-2 border-white text-red-600 hover:bg-transparent hover:text-white font-bold py-3.5 rounded-full shadow-lg hover:shadow-none active:scale-95 transition-all"
              >
                Payer maintenant
              </button>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2">Vous êtes à jour !</h2>
              <p className="text-sm opacity-90 font-medium mb-6">Aucun montant n'est dû pour ce mois-ci.</p>
              <button 
                //onClick={() => {
                  //setAdvanceMonths(1);
                  //setIsPayModalOpen(true);
                //</>}}
                className="px-6 py-2.5 bg-white border-2 border-white text-emerald-600 font-bold rounded-full shadow-lg hover:bg-transparent hover:text-white hover:shadow-none active:scale-95 transition-all"
              >
                Payer une avance
              </button>
            </>
          )}
        </div>
        
        {/* Decorative background shapes */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-black/10 rounded-full blur-xl"></div>
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3 px-1">Mon Logement</h3>
        <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col gap-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{currentUnit?.type || "Logement"}</p>
              <p className="text-base font-bold text-slate-900">Réf: {currentUnit?.reference || "N/A"}</p>
            </div>
            <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-slate-400" />
            </div>
          </div>
          <button 
            disabled={isDownloading}
            onClick={handleDownloadContract}
            className="flex items-center justify-between text-sm font-semibold text-primary hover:text-primary/80 transition-colors py-1 disabled:opacity-50"
          >
            <span className="flex items-center gap-2">
              {isDownloading ? (
                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloading ? "Génération..." : "Télécharger mon contrat"}
            </span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Historique récent */}
        {tenantPayments.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3 px-1">
              <h3 className="text-sm font-bold text-slate-900">Derniers Paiements</h3>
              <Link href="/portal/payments" className="text-xs font-semibold text-primary hover:underline">Voir tout</Link>
            </div>
            <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col gap-3">
              {tenantPayments.slice(0, 3).map((payment, i) => (
                <div key={payment.id} className={cn("flex justify-between items-center", i !== 0 && "pt-3 border-t border-slate-50")}>
                  <div className="flex items-center gap-3">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0", payment.status === "Payé" ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600")}>
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{payment.month}</p>
                      <p className="text-xs font-medium text-slate-500">{payment.date}</p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-slate-900">
                    {(payment.amountPaid || 0).toLocaleString()} <span className="text-xs font-semibold text-slate-500">FCFA</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Contact Gestionnaire */}
        {currentAgency && (
          <div className="mt-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3 px-1">Mon Gestionnaire</h3>
            <div className="bg-white rounded-[24px] p-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm shrink-0">
                  <span className="text-lg font-bold text-slate-500">{(currentAgency.name || "A").charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-base font-bold text-slate-900">{currentAgency.name}</p>
                  <p className="text-xs font-medium text-slate-500">{currentAgency._isOwner ? "Propriétaire" : "Agence Immobilière"}</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-2 mt-2">
                {currentAgency.contactPhone && (
                  <a href={`tel:${currentAgency.contactPhone}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-[16px] hover:bg-slate-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{currentAgency.contactPhone}</span>
                  </a>
                )}
                {currentAgency.contactEmail && (
                  <a href={`mailto:${currentAgency.contactEmail}`} className="flex items-center gap-3 p-3 bg-slate-50 rounded-[16px] hover:bg-slate-100 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm shrink-0">
                      <Mail className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-slate-700 break-all">{currentAgency.contactEmail}</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {isPayModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsPayModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, y: "100%" }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6 sm:hidden"></div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {status === "ajour" ? "Payer une avance" : "Régler mon loyer"}
              </h3>
              
              <div className="mb-6 mt-4 p-4 bg-slate-50 rounded-[20px] border border-slate-100 flex flex-col gap-3">
                {status === "retard" && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-slate-500">Dette actuelle</span>
                    <span className="font-bold text-slate-900">{displayAmount.toLocaleString()} FCFA</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">Mois d'avance</span>
                  <div className="flex items-center bg-white border border-slate-200 rounded-full h-8">
                    <button 
                      type="button"
                      onClick={() => setAdvanceMonths(Math.max(0, advanceMonths - 1))}
                      className="w-8 h-full flex items-center justify-center text-slate-500 hover:text-slate-900"
                    >-</button>
                    <span className="w-8 text-center text-sm font-bold">{advanceMonths}</span>
                    <button 
                      type="button"
                      onClick={() => setAdvanceMonths(advanceMonths + 1)}
                      className="w-8 h-full flex items-center justify-center text-slate-500 hover:text-slate-900"
                    >+</button>
                  </div>
                </div>
                
                <div className="pt-3 mt-1 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-sm font-bold text-slate-900 uppercase">Total à payer</span>
                  <span className="text-xl font-extrabold text-primary">
                    {(displayAmount + (advanceMonths * (currentTenant?.rentAmount || 0))).toLocaleString()} FCFA
                  </span>
                </div>
              </div>

              {!payMethod ? (
                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => setPayMethod("momo")}
                    className="flex items-center p-4 border-2 border-slate-100 rounded-[20px] hover:border-primary hover:bg-primary/5 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mr-4 shrink-0">
                      <Smartphone className="w-6 h-6 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Mobile Money</p>
                      <p className="text-xs font-medium text-slate-500">Orange, MTN, Moov</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setPayMethod("card")}
                    className="flex items-center p-4 border-2 border-slate-100 rounded-[20px] hover:border-primary hover:bg-primary/5 transition-all text-left"
                  >
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 shrink-0">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Carte Bancaire</p>
                      <p className="text-xs font-medium text-slate-500">Visa, Mastercard</p>
                    </div>
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePayment} className="flex flex-col flex-1 overflow-y-auto pb-4">
                  {payMethod === "momo" && (
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Numéro de téléphone</label>
                      <input type="tel" required placeholder="Ex: 6 90 00 00 00" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[16px] focus:ring-2 focus:ring-primary outline-none transition-all font-medium" />
                    </div>
                  )}
                  {payMethod === "card" && (
                    <div className="mb-6 space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">Numéro de carte</label>
                        <input type="text" required placeholder="0000 0000 0000 0000" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[16px] focus:ring-2 focus:ring-primary outline-none transition-all font-medium tracking-widest" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">Expiration</label>
                          <input type="text" required placeholder="MM/AA" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[16px] focus:ring-2 focus:ring-primary outline-none transition-all font-medium" />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-2">CVC</label>
                          <input type="text" required placeholder="123" className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-[16px] focus:ring-2 focus:ring-primary outline-none transition-all font-medium" />
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mt-auto pt-4 flex gap-3">
                    <button type="button" onClick={() => setPayMethod(null)} className="px-4 py-3.5 rounded-[16px] bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors w-1/3">
                      Retour
                    </button>
                    <button type="submit" disabled={isProcessing} className="flex-1 bg-white border border-slate-400 text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 rounded-[16px] font-bold py-3.5 shadow-xl shadow-slate-900/20 disabled:opacity-70 flex justify-center items-center">
                      {isProcessing ? "Traitement..." : "Confirmer le paiement"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="fixed top-0 left-0 -z-50 opacity-[0.01] pointer-events-none">
        {currentTenant && isDownloading && (
          <div key={`template-wrapper-contract-${currentTenant.id}`}>
             <ContractTemplate 
               tenant={currentTenant} 
               unit={currentUnit || null} 
               agency={currentAgency}
               property={currentProperty || null}
             />
          </div>
        )}
        
        {currentTenant && receiptQueue.map(payment => (
          <div key={`template-wrapper-receipt-${payment.id}`}>
             <ReceiptTemplate 
               tenant={currentTenant} 
               payment={payment} 
               unit={currentUnit || null} 
               agency={currentAgency}
             />
          </div>
        ))}
      </div>

      <PDFPreviewModal 
        isOpen={!!pdfPreviewData}
        onClose={() => setPdfPreviewData(null)}
        pdfUrl={pdfPreviewData?.url || null}
        fileName={pdfPreviewData?.filename}
        title="Aperçu du Contrat de Bail"
      />
    </div>
  );
}
