"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { motion } from "framer-motion";
import { BarChart3, PieChart, TrendingUp, Download, Calendar, DollarSign, Percent, ChevronDown } from "lucide-react";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell
} from "recharts";
import { getPayments, getUnits, getProperties, getTickets, getTenants } from "@/lib/supabase-api";
import { usePayments, useUnits, useProperties, useTickets, useTenants } from "@/hooks/useData";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import toast from "react-hot-toast";
import { PageHeaderSkeleton, StatCardSkeleton, TableSkeleton } from "@/components/ui/Skeletons";
import { PDFPreviewModal } from "@/components/ui/PDFPreviewModal";
import { APP_NAME } from "@/lib/config";

const generatePeriods = () => {
  const periods = ["Global"];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11
  
  periods.push(`Année ${currentYear}`);
  
  const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  
  for (let i = 0; i < 6; i++) {
    const d = new Date(currentYear, currentMonth - i, 1);
    periods.push(`${months[d.getMonth()]} ${d.getFullYear()}`);
  }
  return periods;
};

const AVAILABLE_PERIODS = generatePeriods();

export default function ReportsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<string>(AVAILABLE_PERIODS[2]);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);

  const { payments, isLoading: isPaymentsLoading } = usePayments();
  const { units, isLoading: isUnitsLoading } = useUnits();
  const { properties, isLoading: isPropsLoading } = useProperties();
  const { tickets, isLoading: isTicketsLoading } = useTickets();
  const { tenants, isLoading: isTenantsLoading } = useTenants();
  
  const isLoading = isPaymentsLoading || isUnitsLoading || isPropsLoading || isTicketsLoading || isTenantsLoading;

  const [isExporting, setIsExporting] = useState(false);
  const [pdfPreviewData, setPdfPreviewData] = useState<{ url: string, filename: string } | null>(null);

  // --- Dynamic Data Processing ---
  const periodPayments = selectedPeriod === "Global"
    ? payments
    : selectedPeriod.startsWith("Année")
    ? payments.filter(p => p.month.includes(selectedPeriod.split(" ")[1]))
    : payments.filter(p => p.month === selectedPeriod);
  
  // 1. Maintenance Costs (Dépenses)
  const periodTickets = selectedPeriod === "Global"
    ? tickets
    : tickets.filter(t => {
        const date = new Date(t.createdAt);
        const year = date.getFullYear();
        if (selectedPeriod.startsWith("Année")) {
          return year.toString() === selectedPeriod.split(" ")[1];
        } else {
          const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
          const monthStr = `${months[date.getMonth()]} ${year}`;
          return monthStr === selectedPeriod;
        }
      });
  const totalMaintenanceCost = periodTickets.reduce((sum, t) => sum + (t.cost || 0), 0);
  
  // 2. Revenues (Recettes)
  const totalCollected = periodPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const netProfit = totalCollected - totalMaintenanceCost;

  // 3. Revenue by Property
  // Join Payment -> Tenant -> Unit -> Property
  const propertyRevenues: Record<string, number> = {};
  properties.forEach(prop => { propertyRevenues[prop.name] = 0; });
  
  periodPayments.forEach(payment => {
    const tenant = tenants.find(t => t.id === payment.tenantId);
    if (tenant && tenant.unitId) {
      const unit = units.find(u => u.id === tenant.unitId);
      if (unit) {
        const property = properties.find(p => p.id === unit.propertyId);
        if (property) {
          propertyRevenues[property.name] += payment.amountPaid;
        }
      }
    }
  });

  const propertyChartData = Object.entries(propertyRevenues).map(([name, revenue]) => ({
    name,
    revenu: revenue
  }));

  // 4. Payment Methods
  const paymentMethodsCounts = periodPayments.reduce((acc, curr) => {
    const method = curr.paymentMethod || "Inconnu";
    acc[method] = (acc[method] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const COLORS = ['#0f172a', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6'];
  const pieData = Object.entries(paymentMethodsCounts).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length]
  }));

  const generateReportPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById("report-content");
      if (!element) throw new Error("Report content not found");

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f8fafc" // match background
      });

      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2]
      });

      pdf.addImage(imgData, "JPEG", 0, 0, canvas.width / 2, canvas.height / 2);
      
      const pdfBlob = pdf.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      const filename = `Rapport_${APP_NAME.replace(/[^a-zA-Z0-9]/g, "")}_${selectedPeriod.replace(/\s+/g, "_")}.pdf`;
      
      setPdfPreviewData({ url: pdfUrl, filename });
      toast.success("Aperçu généré avec succès");
    } catch (error) {
      console.error("Erreur lors de l'export PDF:", error);
      toast.error("Erreur lors de l'export du rapport");
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 relative w-full">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           <div className="h-80 bg-slate-200/60 rounded-[24px] animate-pulse"></div>
           <div className="h-80 bg-slate-200/60 rounded-[24px] animate-pulse"></div>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-8">
      <PageHeader 
        title="Rapports & Statistiques" 
        description="Analysez la performance de votre parc immobilier."
        actions={
          <div className="flex items-center gap-3">
            <div className="relative z-50">
              <div 
                onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
                className="flex items-center bg-white rounded-full px-4 h-11 border-0 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-slate-50 transition-colors"
              >
                <Calendar className="h-4 w-4 text-slate-500 mr-2" />
                <span className="text-sm font-medium text-slate-700 mr-2 whitespace-nowrap">{selectedPeriod}</span>
                <ChevronDown className="h-4 w-4 text-slate-500" />
              </div>
              
              {isPeriodDropdownOpen && (
                <div className="absolute top-12 right-0 w-full min-w-[150px] bg-white rounded-xl shadow-lg border border-slate-100 py-2">
                  {AVAILABLE_PERIODS.map((period) => (
                    <button
                      key={period}
                      className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                      onClick={() => {
                        setSelectedPeriod(period);
                        setIsPeriodDropdownOpen(false);
                      }}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button 
              onClick={generateReportPDF}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 bg-white border border-slate-400 text-slate-900 hover:bg-slate-900 hover:text-white hover:border-slate-900 px-4 h-11 rounded-full text-sm font-bold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-70"
            >
              {isExporting ? (
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <Download size={18} />
              )}
              <span className="hidden sm:inline">{isExporting ? "Génération..." : "Exporter en PDF"}</span>
            </button>
          </div>
        }
      />

      <div id="report-content" className="flex flex-col gap-8 bg-slate-50 p-2 rounded-xl">
        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col gap-2"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-500">Recettes Locatives (Brut)</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            {totalCollected.toLocaleString()} <span className="text-lg text-slate-400 font-semibold">FCFA</span>
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col gap-2"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-red-600 rotate-180" />
            </div>
            <h3 className="text-sm font-bold text-slate-500">Dépenses (Maintenance)</h3>
          </div>
          <p className="text-3xl font-extrabold text-slate-900">
            {totalMaintenanceCost.toLocaleString()} <span className="text-lg text-slate-400 font-semibold">FCFA</span>
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-slate-900 rounded-[24px] p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.2)] border border-slate-800 flex flex-col gap-2 text-white"
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-slate-300">Bénéfice Net</h3>
          </div>
          <p className="text-3xl font-extrabold">
            {netProfit.toLocaleString()} <span className="text-lg text-slate-400 font-semibold">FCFA</span>
          </p>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Bar Chart */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-[32px] p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 lg:col-span-2 flex flex-col"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Performance par Propriété</h2>
              <p className="text-sm font-medium text-slate-500">Comparaison des revenus générés par chaque immeuble.</p>
            </div>
          </div>
          
          <div className="h-[300px] w-full mt-auto">
            {propertyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={propertyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={30}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                    tickFormatter={(val) => new Intl.NumberFormat('fr-CM', { notation: "compact", compactDisplay: "short" }).format(val)}
                    width={50}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                    formatter={(value) => [`${Number(value).toLocaleString()} FCFA`, "Revenu"]}
                  />
                  <Bar dataKey="revenu" fill="#0f172a" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400 font-medium">Aucun revenu enregistré</div>
            )}
          </div>
        </motion.div>

        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-[32px] p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col"
        >
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Méthodes de paiement</h2>
            <p className="text-sm font-medium text-slate-500">Préférences de vos locataires.</p>
          </div>
          
          <div className="flex-1 flex flex-col items-center justify-center mt-4">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="w-full space-y-3 mt-4">
              {pieData.map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                    <span className="text-sm font-bold text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 bg-slate-50 px-3 py-1 rounded-full">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
      </div>
      
      <PDFPreviewModal 
        isOpen={!!pdfPreviewData}
        onClose={() => setPdfPreviewData(null)}
        pdfUrl={pdfPreviewData?.url || null}
        fileName={pdfPreviewData?.filename}
        title="Aperçu du Rapport"
      />
    </div>
  );
}
