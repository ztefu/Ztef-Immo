"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Receipt, Download, Calendar, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { Payment, Unit } from "@/lib/mock-data";
import { getUnits, getPayments } from "@/lib/supabase-api";
import { useUnits, usePayments } from "@/hooks/useData";
import { useCurrentTenant } from "@/hooks/useCurrentTenant";
import { useCurrentAgency } from "@/hooks/useCurrentAgency";
import { PageHeaderSkeleton, TableSkeleton } from "@/components/ui/Skeletons";
import { ReceiptTemplate } from "@/components/ui/ReceiptTemplate";
import { PDFPreviewModal } from "@/components/ui/PDFPreviewModal";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export default function TenantPayments() {
  const { currentTenant, isLoadingTenant } = useCurrentTenant();
  const { currentAgency } = useCurrentAgency();
  const { units: unitsData, isLoading: isUnitsLoading } = useUnits();
  const { payments: paymentsData, isLoading: isPaymentsLoading } = usePayments();
  
  const [currentUnit, setCurrentUnit] = useState<Unit | null>(null);
  const [tenantPayments, setTenantPayments] = useState<Payment[]>([]);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  const [pdfPreviewData, setPdfPreviewData] = useState<{ url: string, filename: string } | null>(null);

  useEffect(() => {
    if (!currentTenant || isUnitsLoading || isPaymentsLoading) return;

    const unit = unitsData.find(u => u.id === currentTenant.unitId);
    setCurrentUnit(unit || null);
    
    const payments = paymentsData
      .filter(p => p.tenantId === currentTenant.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    setTenantPayments(payments);
    setCurrentPage(1); // Reset to page 1 when data reloads
  }, [currentTenant, unitsData, paymentsData, isUnitsLoading, isPaymentsLoading]);

  const isLoading = isLoadingTenant || isUnitsLoading || isPaymentsLoading;

  const totalPages = Math.ceil(tenantPayments.length / ITEMS_PER_PAGE);
  const paginatedPayments = tenantPayments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const generatePDF = async (payment: Payment) => {
    setIsDownloading(payment.id);
    
    try {
      if (payment.receiptUrl) {
        setPdfPreviewData({ 
          url: payment.receiptUrl, 
          filename: `Quittance_${payment.month.replace(/\s+/g, '_')}_${currentTenant?.fullName.replace(/\s+/g, '_')}.pdf` 
        });
        return;
      }
      
      toast.error("La quittance n'a pas encore été finalisée par l'agence. Veuillez les contacter.");
    } catch (error) {
      console.error("Failed to open receipt", error);
      toast.error("Erreur lors de l'ouverture de la quittance");
    } finally {
      setIsDownloading(null);
    }
  };

  if (isLoading || isLoadingTenant) {
    return (
      <div className="flex flex-col gap-8 relative w-full p-6 md:p-8 max-w-7xl mx-auto">
        <PageHeaderSkeleton />
        <TableSkeleton />
      </div>
    );
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
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Receipt className="w-4 h-4 text-blue-600" />
          </div>
          Historique
        </h2>
        <p className="text-sm font-medium text-slate-500">
          Retrouvez ici tous vos paiements et vos quittances de loyer.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {paginatedPayments.length > 0 ? paginatedPayments.map((payment, index) => (
          <motion.div 
            key={payment.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-5 rounded-[24px] shadow-sm border border-slate-100 flex flex-col gap-4"
          >
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{payment.month}</h3>
                  <p className="text-xs font-semibold text-slate-500">{payment.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-extrabold text-slate-900">{(payment.amountDue || 0).toLocaleString()} <span className="text-xs">FCFA</span></p>
                <div className={`flex items-center justify-end gap-1 mt-1 ${payment.status === "Payé" ? "text-green-600" : payment.status === "Partiellement payé" ? "text-orange-600" : "text-slate-600"}`}>
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{payment.status}</span>
                </div>
                {payment.status === "Partiellement payé" && (
                   <p className="text-xs font-bold text-orange-600 mt-1 bg-orange-50 px-2 py-0.5 rounded-full inline-block">
                     Payé: {(payment.amountPaid || 0).toLocaleString()} / Reste: {((payment.amountDue || 0) - (payment.amountPaid || 0)).toLocaleString()}
                   </p>
                )}
              </div>
            </div>

            <button 
              onClick={() => generatePDF(payment)}
              disabled={isDownloading === payment.id || payment.status === "En attente"}
              className={`flex items-center justify-center gap-2 text-sm font-bold bg-slate-50 py-3 rounded-[16px] transition-colors ${payment.status === "En attente" ? "text-slate-400 cursor-not-allowed opacity-50" : "text-slate-700 hover:bg-slate-100 disabled:opacity-50"}`}
            >
              {isDownloading === payment.id ? (
                <div className="animate-spin w-4 h-4 border-2 border-slate-700 border-t-transparent rounded-full" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloading === payment.id ? "Génération..." : "Télécharger la quittance"}
            </button>
          </motion.div>
        )) : (
          <div className="bg-white p-8 rounded-[24px] shadow-sm border border-slate-100 text-center flex flex-col items-center">
            <Receipt className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-sm font-medium text-slate-500">Aucun paiement trouvé.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-2 pb-4">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-bold text-slate-700 mx-2">
            Page {currentPage} sur {totalPages}
          </span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}


      {/* Hidden PDF template for currently downloaded receipt */}
      <div className="fixed top-0 left-0 -z-50 opacity-[0.01] pointer-events-none">
        {tenantPayments.map(payment => (
           isDownloading === payment.id && currentTenant && (
             <div key={`template-wrapper-${payment.id}`}>
               <ReceiptTemplate 
                 tenant={currentTenant} 
                 payment={payment} 
                 unit={currentUnit} 
                 agency={currentAgency}
               />
             </div>
           )
        ))}
      </div>

      <PDFPreviewModal 
        isOpen={!!pdfPreviewData}
        onClose={() => setPdfPreviewData(null)}
        pdfUrl={pdfPreviewData?.url || null}
        fileName={pdfPreviewData?.filename}
        title="Aperçu de la Quittance"
      />
    </div>
  );
}
