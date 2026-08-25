"use client";

import { useState, useEffect } from "react";
import { 

  Building, 
  Wallet, 
  TrendingUp, 
  Users, 
  Plus,
  Eye,
  MapPin,
  BedDouble,
  Bath,
  Maximize2,
  Search,
  Calendar,
  Filter,
  ArrowUpRight,
  ChevronDown,
  Info,
  Layers,
  Building2,
  Home,
  Trees,
  AlertTriangle,
  MessageCircle
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DashboardSkeleton } from "@/components/ui/Skeletons";
import { Unit, Property, Payment, Tenant, Ticket } from "@/lib/mock-data";
import { useUnits, useProperties, usePayments, useTenants, useTickets } from "@/hooks/useData";
import { createClient } from "@/utils/supabase/client";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector
} from 'recharts';

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={10}
        stroke="#ffffff"
        strokeWidth={3}
        style={{ filter: `drop-shadow(0px 4px 10px ${fill}80)` }}
      />
    </g>
  );
};

const PropertyIcon = ({ type, className }: { type: string, className?: string }) => {
  const t = (type || "").toLowerCase();
  if (t.includes('appartement')) return <Building className={className} strokeWidth={1} />;
  if (t.includes('immeuble')) return <Building2 className={className} strokeWidth={1} />;
  if (t.includes('villa') || t.includes('maison')) return <Home className={className} strokeWidth={1} />;
  if (t.includes('terrain')) return <Trees className={className} strokeWidth={1} />;
  return <Building className={className} strokeWidth={1} />;
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isOccupied = data.name === 'Occupés';
    
    return (
      <div 
        className="bg-white rounded-xl p-3 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.1)] border border-slate-50 relative z-50 pointer-events-none"
        style={isOccupied ? { transform: 'translate(-140px, -60px)' } : { transform: 'translate(10px, 10px)' }}
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }}></div>
          <span className="font-bold text-slate-900">{data.name}</span>
        </div>
        <div className="text-slate-500 text-sm font-medium">
          Valeur: <span className="text-slate-900 font-bold ml-1">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
};

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
export default function DashboardPage() {
  const [propertySearch, setPropertySearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<string>(AVAILABLE_PERIODS[2]);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  
  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  const { units, isLoading: isUnitsLoading } = useUnits();
  const { properties, isLoading: isPropsLoading } = useProperties();
  const { payments, isLoading: isPaymentsLoading } = usePayments();
  const { tenants, isLoading: isTenantsLoading } = useTenants();
  const { tickets, refreshTickets, isLoading: isTicketsLoading } = useTickets();

  const isLoading = isUnitsLoading || isPropsLoading || isPaymentsLoading || isTenantsLoading || isTicketsLoading;

  // Set up real-time subscription for tickets
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel('realtime-dashboard-tickets')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tickets' },
        (payload) => {
          refreshTickets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getTenantPaymentsLocal = (tenantId: string) => {
    return payments.filter(p => p.tenantId === tenantId).sort((a, b) => {
      const parseDate = (d: string) => {
        const parts = d.split(' ');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const months: Record<string, number> = { "Janvier": 0, "Février": 1, "Mars": 2, "Avril": 3, "Mai": 4, "Juin": 5, "Juillet": 6, "Août": 7, "Septembre": 8, "Octobre": 9, "Novembre": 10, "Décembre": 11 };
          const month = months[parts[1]] || 0;
          const year = parseInt(parts[2], 10);
          return new Date(year, month, day).getTime();
        }
        return 0;
      };
      return parseDate(b.date) - parseDate(a.date);
    });
  };

  // 1. Dynamic calculations from real units
  const liveTotalUnits = units.length;
  const liveOccupiedUnits = units.filter(u => u.status === "Occupé").length;
  const liveVacantUnits = units.filter(u => u.status === "Vacant").length;
  const liveMaintenanceUnits = units.filter(u => u.status === "Maintenance").length;

  // 2. Real money calculations from payments
  const periodPayments = selectedPeriod === "Global"
    ? payments
    : selectedPeriod.startsWith("Année")
    ? payments.filter(p => p.month.includes(selectedPeriod.split(" ")[1]))
    : payments.filter(p => p.month === selectedPeriod);

  const liveEncaisses = periodPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const liveAttente = periodPayments.reduce((sum, p) => sum + ((p.amountDue || 0) - (p.amountPaid || 0)), 0);

  // Dynamic calculations for previous period
  const getPreviousPeriod = (current: string) => {
    if (current === "Global") return null;
    if (current.startsWith("Année")) {
      const year = parseInt(current.split(" ")[1]);
      return `Année ${year - 1}`;
    }
    const months = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const parts = current.split(" ");
    if (parts.length === 2) {
      const m = parts[0];
      let y = parseInt(parts[1]);
      let idx = months.indexOf(m);
      if (idx === -1) return null;
      if (idx === 0) {
        idx = 11;
        y -= 1;
      } else {
        idx -= 1;
      }
      return `${months[idx]} ${y}`;
    }
    return null;
  };

  const previousPeriod = getPreviousPeriod(selectedPeriod);
  
  const prevPeriodPayments = previousPeriod === "Global" || !previousPeriod
    ? []
    : previousPeriod.startsWith("Année")
    ? payments.filter(p => p.month.includes(previousPeriod.split(" ")[1]))
    : payments.filter(p => p.month === previousPeriod);

  const prevEncaisses = prevPeriodPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const prevAttente = prevPeriodPayments.reduce((sum, p) => sum + ((p.amountDue || 0) - (p.amountPaid || 0)), 0);

  const calcGrowth = (current: number, prev: number) => {
    if (prev === 0) return current > 0 ? 100 : 0;
    return ((current - prev) / prev) * 100;
  };

  const encaissesGrowth = calcGrowth(liveEncaisses, prevEncaisses);
  const attenteGrowth = calcGrowth(liveAttente, prevAttente);

  const growthLabel = selectedPeriod === "Global" 
    ? "" 
    : selectedPeriod.startsWith("Année") 
    ? "vs année prec." 
    : "vs mois prec.";

  const formatGrowth = (val: number) => {
    if (val === 0) return "0%";
    return `${val > 0 ? '+' : ''}${val.toFixed(1)}%`;
  };

  const allLateTenantsCount = tenants.filter(t => t.status === "En retard").length;

  const dynamicStats = {
    encaisses: `${(liveEncaisses || 0).toLocaleString()} FCFA`,
    attente: `${(liveAttente || 0).toLocaleString()} FCFA`,
    impayes: allLateTenantsCount,
    tauxOccupation: liveTotalUnits > 0 ? Math.round((liveOccupiedUnits / liveTotalUnits) * 100) : 0,
  };

  const dynamicStatusData = [
    { name: 'Occupés', value: liveOccupiedUnits, color: '#22c55e' },
    { name: 'Vacants', value: liveVacantUnits, color: '#eab308' },
    { name: 'En maintenance', value: liveMaintenanceUnits, color: '#3b82f6' },
  ];

  // Real dynamic Bar Chart logic
  const shortMonths = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
  const fullMonths = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
  
  const currentYearForChart = new Date().getFullYear();
  const dynamicRevenueData = shortMonths.map((shortMonth, index) => {
    const fullName = `${fullMonths[index]} ${currentYearForChart}`;
    const monthPayments = payments.filter(p => p.month === fullName);
    const encaisses = monthPayments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
    const attendu = monthPayments.reduce((sum, p) => sum + (p.amountDue || 0), 0);
    return { name: shortMonth, encaisses, attendu };
  });

  // Widgets Data
  const recentTickets = tickets.filter(t => t.status !== "Résolu").slice(0, 4);
  const lateTenants = tenants.filter(t => t.status === "En retard").slice(0, 4);


  // Dynamically map properties to UI expected format
  const realProperties = properties.map(prop => {
    const propUnits = units.filter(u => u.propertyId === prop.id);
    const occupiedPropUnits = propUnits.filter(u => u.status === "Occupé").length;
    const totalRent = propUnits.reduce((sum, u) => sum + (u.rent || 0), 0);
    
    return {
      id: prop.id,
      name: prop.name,
      type: prop.type,
      location: `${prop.neighborhood}, ${prop.city}`,
      price: `${totalRent.toLocaleString()} FCFA`,
      units: propUnits.length,
      occupied: occupiedPropUnits,
      area: (prop.area || 0).toString(),
      image: prop.imageUrl || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=400&h=300",
    };
  });

  const filteredProperties = realProperties.filter(p => 
    p.name.toLowerCase().includes(propertySearch.toLowerCase()) || 
    p.location.toLowerCase().includes(propertySearch.toLowerCase())
  );

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="flex flex-col gap-8 relative">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2"
      >
        <div className="flex justify-center sm:justify-start w-full sm:w-auto">
          <h1 className="text-[28px] font-bold text-slate-900 tracking-tight">Vue d'ensemble</h1>
        </div>
        <div className="flex flex-wrap sm:flex-nowrap justify-center sm:justify-end items-center gap-3 w-full sm:w-auto">
          <div className="relative">
            <div 
              onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
              className="flex items-center bg-white rounded-full px-4 h-11 border-0 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-slate-50 transition-colors"
            >
              <Calendar className="h-4 w-4 text-slate-500 mr-2" />
              <span className="text-sm font-medium text-slate-700 mr-2 whitespace-nowrap">{selectedPeriod}</span>
              <ChevronDown className="h-4 w-4 text-slate-500" />
            </div>
            
            {isPeriodDropdownOpen && (
              <div className="absolute top-12 left-0 w-full min-w-[140px] bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
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
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
      >
        {/* Stat 1: Loyers Encaissés */}
        <div className="relative rounded-[24px] bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between overflow-hidden group min-h-[160px] hover:-translate-y-1.5 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#dbeafe] rounded-bl-[40px] pointer-events-none" />
          <div className="absolute top-2 right-2 w-16 h-16 bg-slate-50 rounded-full pointer-events-none" />
          <div className="absolute top-4 right-4 bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm z-10 border border-slate-50">
            <Wallet className="h-5 w-5 text-[#3b82f6]" />
          </div>

          <div className="flex justify-between items-start z-10">
            <div className="pr-16">
              <p className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-none truncate">{dynamicStats.encaisses}</p>
              <p className="text-xs font-medium text-slate-500 mt-2">Loyers encaissés (FCFA)</p>
            </div>
          </div>
          <div className="mt-8 flex items-end justify-between z-10">
            {selectedPeriod !== "Global" && (
              <div className="flex items-center text-xs">
                <span className={cn(
                  "flex items-center px-1.5 py-0.5 rounded font-bold",
                  encaissesGrowth >= 0 ? "text-[#3b82f6] bg-[#eff6ff]" : "text-red-500 bg-red-50"
                )}>
                  {encaissesGrowth >= 0 ? <ArrowUpRight className="mr-0.5 h-3 w-3" /> : <ArrowUpRight className="mr-0.5 h-3 w-3 rotate-90" />}
                  {formatGrowth(encaissesGrowth)}
                 </span>
                 <span className="text-slate-400 ml-1.5 font-medium">{growthLabel}</span>
              </div>
            )}
            <svg width="60" height="30" viewBox="0 0 100 50" className="absolute bottom-4 right-4 opacity-80">
              <path d="M10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#3b82f6" strokeWidth="15" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Stat 2: Loyers En Attente */}
        <div className="relative rounded-[24px] bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between overflow-hidden group min-h-[160px] hover:-translate-y-1.5 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#fef08a] rounded-bl-[40px] pointer-events-none" />
          <div className="absolute top-2 right-2 w-16 h-16 bg-slate-50 rounded-full pointer-events-none" />
          <div className="absolute top-4 right-4 bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm z-10 border border-slate-50">
            <TrendingUp className="h-5 w-5 text-[#eab308]" />
          </div>

          <div className="flex justify-between items-start z-10">
            <div className="pr-16">
              <p className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-none truncate">{dynamicStats.attente}</p>
              <p className="text-xs font-medium text-slate-500 mt-2">En attente (FCFA)</p>
            </div>
          </div>
          <div className="mt-8 flex items-end justify-between z-10">
            {selectedPeriod !== "Global" && (
              <div className="flex items-center text-xs">
                <span className={cn(
                  "flex items-center px-1.5 py-0.5 rounded font-bold",
                  attenteGrowth <= 0 ? "text-[#22c55e] bg-[#f0fdf4]" : "text-[#eab308] bg-[#fefce8]"
                )}>
                  {attenteGrowth <= 0 ? <ArrowUpRight className="mr-0.5 h-3 w-3 rotate-90" /> : <ArrowUpRight className="mr-0.5 h-3 w-3" />}
                  {formatGrowth(attenteGrowth)}
                </span>
                <span className="text-slate-400 ml-1.5 font-medium">{growthLabel}</span>
              </div>
            )}
            <div className="flex items-end gap-0.5 absolute bottom-4 right-4">
               <div className="w-4 h-6 bg-yellow-400 rounded-tl-sm"></div>
               <div className="w-4 h-12 bg-yellow-500 rounded-t-sm"></div>
               <div className="w-4 h-4 bg-yellow-200 rounded-tr-sm"></div>
            </div>
          </div>
        </div>

        {/* Stat 3: Impayés */}
        <div className="relative rounded-[24px] bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between overflow-hidden group min-h-[160px] hover:-translate-y-1.5 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-100 rounded-bl-[40px] pointer-events-none" />
          <div className="absolute top-2 right-2 w-16 h-16 bg-slate-50 rounded-full pointer-events-none" />
          <div className="absolute top-4 right-4 bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm z-10 border border-slate-50">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>

          <div className="flex justify-between items-start z-10">
            <div className="pr-16">
              <p className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-none truncate">{dynamicStats.impayes}</p>
              <p className="text-xs font-medium text-slate-500 mt-2">Impayés (&gt; 1 mois)</p>
            </div>
          </div>
          <div className="mt-8 flex items-end justify-between z-10">
            <div className="flex items-center text-xs">
              <span className="flex items-center text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-bold">
                Retards actifs
              </span>
            </div>
            <div className="flex items-end gap-1 absolute bottom-4 right-4">
              <div className="w-2 h-4 bg-red-100 rounded-t-sm"></div>
              <div className="w-2 h-6 bg-red-200 rounded-t-sm"></div>
              <div className="w-2 h-5 bg-red-300 rounded-t-sm"></div>
              <div className="w-2 h-8 bg-red-400 rounded-t-sm"></div>
              <div className="w-2 h-10 bg-red-600 rounded-t-sm"></div>
            </div>
          </div>
        </div>

        {/* Stat 4: Taux d'Occupation */}
        <div className="relative rounded-[24px] bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between overflow-hidden group min-h-[160px] hover:-translate-y-1.5 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#dcfce7] rounded-bl-[40px] pointer-events-none" />
          <div className="absolute top-2 right-2 w-16 h-16 bg-slate-50 rounded-full pointer-events-none" />
          <div className="absolute top-4 right-4 bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-sm z-10 border border-slate-50">
            <Building className="h-5 w-5 text-[#22c55e]" />
          </div>

          <div className="flex justify-between items-start z-10">
            <div className="pr-16">
              <p className="text-2xl sm:text-[32px] font-bold text-slate-900 leading-none truncate">{dynamicStats.tauxOccupation}%</p>
              <p className="text-xs font-medium text-slate-500 mt-2">Taux d'occupation</p>
            </div>
          </div>
          <div className="mt-8 flex items-end justify-between z-10">
            <div className="flex items-center text-xs">
              <span className="flex items-center text-slate-500 bg-slate-100 px-2 py-0.5 rounded font-bold">
                À ce jour
              </span>
            </div>
            <svg width="60" height="30" viewBox="0 0 100 50" className="absolute bottom-4 right-4 opacity-80">
              <path d="M10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#22c55e" strokeWidth="15" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </motion.div>

      {/* Bloc Encaissement du Mois */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.15 }}
        className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:-translate-y-1 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] transition-all mb-5 mt-5"
      >
        <div className="flex flex-col md:flex-row justify-between md:items-end gap-6">
          <div className="flex-1">
            <h2 className="text-[17px] font-bold text-slate-900 mb-2">Encaissement de {selectedPeriod}</h2>
            <div className="flex items-center gap-4 mb-4">
              <div>
                <span className="text-sm text-slate-500">Encaissé</span>
                <p className="text-2xl font-bold text-emerald-600">{(liveEncaisses || 0).toLocaleString()} <span className="text-sm font-medium">FCFA</span></p>
              </div>
              <div className="h-10 w-px bg-slate-200"></div>
              <div>
                <span className="text-sm text-slate-500">Attendu</span>
                <p className="text-2xl font-bold text-slate-900">{((liveEncaisses || 0) + (liveAttente || 0)).toLocaleString()} <span className="text-sm font-medium">FCFA</span></p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 rounded-full h-3 mb-2 relative overflow-hidden">
              <div 
                className="bg-emerald-500 h-3 rounded-full transition-all duration-1000" 
                style={{ width: `${((liveEncaisses || 0) + (liveAttente || 0)) > 0 ? Math.round(((liveEncaisses || 0) / ((liveEncaisses || 0) + (liveAttente || 0))) * 100) : 0}%` }}
              ></div>
            </div>
            <p className="text-sm font-bold text-slate-700">
              {((liveEncaisses || 0) + (liveAttente || 0)) > 0 ? Math.round(((liveEncaisses || 0) / ((liveEncaisses || 0) + (liveAttente || 0))) * 100) : 0}% <span className="font-normal text-slate-500">des loyers recouvrés ce mois</span>
            </p>
          </div>
          
          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
             <button 
                disabled={(((liveEncaisses || 0) + (liveAttente || 0)) > 0 ? Math.round(((liveEncaisses || 0) / ((liveEncaisses || 0) + (liveAttente || 0))) * 100) : 0) === 100}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
             >
                Saisir un paiement
             </button>
             <button 
                disabled={(((liveEncaisses || 0) + (liveAttente || 0)) > 0 ? Math.round(((liveEncaisses || 0) / ((liveEncaisses || 0) + (liveAttente || 0))) * 100) : 0) === 100}
                className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-full font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50"
             >
                <MessageCircle className="h-4 w-4 text-[#25D366]" /> Relancer
             </button>
          </div>
        </div>
      </motion.div>

      {/* Charts Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        {/* Pie Chart */}
        <div className="rounded-[24px] bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] col-span-1 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-1.5">
              <h2 className="text-[17px] font-bold text-slate-900">Analyse du statut</h2>
              <Info className="h-4 w-4 text-slate-400 cursor-help" />
            </div>
            <div className="flex items-center text-xs font-medium text-slate-500 bg-slate-50 rounded-full px-3 py-1">
              {selectedPeriod}
            </div>
          </div>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dynamicStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={8}
                  cornerRadius={10}
                  dataKey="value"
                  stroke="none"
                  // @ts-expect-error - Recharts typing mismatch
                  activeIndex={activeIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={onPieEnter}
                  onMouseLeave={onPieLeave}
                  labelLine={{ stroke: '#94a3b8', strokeWidth: 1 }}
                  label={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }}
                >
                  {dynamicStatusData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  cursor={{ fill: 'transparent' }}
                  content={<CustomPieTooltip />}
                  allowEscapeViewBox={{ x: true, y: true }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-white rounded-full p-3 shadow-[0_2px_10px_-2px_rgba(0,0,0,0.1)] border-4 border-slate-50 relative z-10">
                <Layers className="h-8 w-8 text-blue-500" />
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-2 justify-center">
            {dynamicStatusData.map((item: any) => (
              <div key={item.name} className="flex items-center gap-2 text-xs">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-slate-500">{item.name}</span>
                <span className="font-bold text-slate-900 ml-1">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart */}
        <div className="rounded-[24px] bg-white p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] col-span-1 lg:col-span-2 hover:-translate-y-1.5 hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)] transition-all duration-300">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm sm:text-[17px] font-bold text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis">Génération de revenus</h2>
                <Info className="h-4 w-4 text-slate-400 cursor-help" />
              </div>
              <div className="hidden sm:flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#cbd5e1]"></div>
                  <span className="text-slate-600 font-medium">Attendu</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-[#0f172a]"></div>
                  <span className="text-slate-600 font-medium">Encaissés</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center text-xs font-medium text-slate-500 bg-slate-50 rounded-full px-3 py-1">
                {selectedPeriod}
              </div>
              <button className="flex items-center justify-center h-8 w-8 rounded-full border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="flex items-end gap-4 mb-6">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-slate-900">{dynamicStats.encaisses}</span>
              {selectedPeriod !== "Global" && (
                <span className={cn(
                  "text-sm font-medium flex items-center mt-1",
                  encaissesGrowth >= 0 ? "text-[#20c997]" : "text-red-500"
                )}>
                  <ArrowUpRight className={cn("h-3 w-3 mr-0.5", encaissesGrowth < 0 && "rotate-90")} /> 
                  {formatGrowth(encaissesGrowth)} {growthLabel}
                </span>
              )}
            </div>
          </div>
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dynamicRevenueData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  xAxisId="a"
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  dy={10}
                />
                <XAxis 
                  xAxisId="b"
                  dataKey="name" 
                  hide={true} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }}
                  tickFormatter={(val) => new Intl.NumberFormat('fr-CM', { notation: "compact", compactDisplay: "short" }).format(val)}
                  width={50}
                />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0 && payload[0].payload) {
                      return payload[0].payload.name;
                    }
                    return label;
                  }}
                />
                <Bar xAxisId="a" dataKey="attendu" name="Attendu" fill="#cbd5e1" radius={[6, 6, 0, 0]} barSize={32} />
                <Bar xAxisId="b" dataKey="encaisses" name="Encaissés" fill="#0f172a" radius={[6, 6, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* Widgets Row (Alerts & Maintenance) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.25 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-5"
      >
        {/* Tickets de Maintenance */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:-translate-y-1 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] transition-all">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                <Trees className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-lg whitespace-nowrap overflow-hidden text-ellipsis">Tickets de Maintenance</h3>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">{recentTickets.length} {recentTickets.length > 1 ? 'actifs' : 'actif'}</span>
          </div>
          <div className="flex flex-col gap-3">
            {recentTickets.length > 0 ? recentTickets.slice(0, 5).map(ticket => (
              <div key={ticket.id} className="p-3 bg-slate-50 border border-slate-100 rounded-[16px] flex justify-between items-center group cursor-pointer hover:border-blue-200 hover:bg-blue-50/50 transition-colors">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">{ticket.title}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{ticket.category} • {ticket.priority === 'Urgente' ? <span className="text-red-500 font-bold">Urgent</span> : ticket.priority}</p>
                </div>
                <div className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full ${
                  ticket.status === 'Nouveau' ? 'bg-purple-100 text-purple-600' :
                  ticket.status === 'En cours' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-slate-200 text-slate-600'
                }`}>
                  {ticket.status}
                </div>
              </div>
            )) : (
              <div className="text-sm text-slate-500 py-4 text-center">Aucun ticket de maintenance en cours.</div>
            )}
          </div>
        </div>

        {/* Retards de Paiement */}
        <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 hover:-translate-y-1 hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.08)] transition-all">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-lg whitespace-nowrap overflow-hidden text-ellipsis">Top Impayés / Retards</h3>
            </div>
            <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full">{lateTenants.length} {lateTenants.length > 1 ? 'alertes' : 'alerte'}</span>
          </div>
          <div className="flex flex-col gap-3">
            {lateTenants.length > 0 ? lateTenants.slice(0, 5).map(tenant => {
              const unit = units.find(u => u.id === tenant.unitId);
              // Get latest payment or compute amount due/paid
              const latestPayment = getTenantPaymentsLocal(tenant.id)[0];
              const amountDue = latestPayment ? latestPayment.amountDue : tenant.rentAmount;
              const amountPaid = latestPayment ? latestPayment.amountPaid : 0;
              const remaining = amountDue - amountPaid;
              
              return (
                <div key={tenant.id} className="p-3 bg-slate-50 border border-slate-100 rounded-[16px] flex justify-between items-center group cursor-pointer hover:border-red-200 hover:bg-red-50/50 transition-colors">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-red-700 transition-colors">{tenant.fullName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{unit?.reference || 'Logement inconnu'}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{remaining.toLocaleString()} FCFA <span className="text-xs text-slate-400 font-normal">restants</span></div>
                    <div className="text-[10px] text-slate-500 font-medium mt-0.5">Payé : {amountPaid.toLocaleString()} / {amountDue.toLocaleString()}</div>
                    <div className="text-[10px] text-red-500 font-bold uppercase mt-1">En retard</div>
                  </div>
                </div>
              );
            }) : (
              <div className="text-sm text-slate-500 py-4 text-center">Aucun retard de paiement signalé.</div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Explore Properties Row */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5, delay: 0.3 }}
        className="bg-white rounded-[32px] p-6 lg:p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100"
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-[19px] font-bold text-slate-900">Explorez vos propriétés</h2>
            <Info className="h-4 w-4 text-slate-400 cursor-help" />
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={propertySearch}
                onChange={(e) => setPropertySearch(e.target.value)}
                className="pl-10 pr-4 h-10 rounded-full border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 w-48 sm:w-64 bg-white"
              />
            </div>
            <button className="hidden sm:flex items-center gap-2 h-10 px-4 rounded-full border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Filter className="h-4 w-4" />
              Filtrer
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.length > 0 ? filteredProperties.map((property) => (
            <div key={property.id} className="rounded-[24px] bg-white border border-slate-100 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] overflow-hidden group p-2.5 transition-all hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)]">
              <div className="relative h-44 w-full overflow-hidden rounded-[20px] bg-slate-50 flex items-center justify-center border border-slate-100">
                <PropertyIcon type={property.type} className="h-24 w-24 text-slate-300 group-hover:text-primary/40 transition-colors duration-500 group-hover:scale-110" />

                <button className="absolute top-3 right-3 bg-white/30 backdrop-blur-md p-1.5 rounded-full text-white hover:bg-white/50 transition-colors border border-white/20">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className="font-bold text-slate-900 text-[15px] truncate pr-2">{property.name}</h3>
                  <span className="text-[#20c997] font-bold text-[14px] whitespace-nowrap">{property.price}</span>
                </div>
                <div className="flex items-center text-slate-400 text-xs mb-5 font-medium">
                  <MapPin className="h-3 w-3 mr-1" />
                  {property.location}
                </div>
                <div className="flex items-center gap-5 text-slate-500 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <BedDouble className="h-3.5 w-3.5 text-slate-400" />
                    <span>{property.units}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Bath className="h-3.5 w-3.5 text-slate-400" />
                    <span>{property.occupied}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Maximize2 className="h-3.5 w-3.5 text-slate-400" />
                    <span>{property.area} m²</span>
                  </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-12 text-center text-slate-500">
              Aucune propriété trouvée pour cette recherche.
            </div>
          )}
        </div>
      </motion.div>

      {/* Modal Nouvelle Propriété */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Nouvelle Propriété</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                &times;
              </button>
            </div>
            <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); setIsModalOpen(false); }}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom de la propriété</label>
                <input type="text" required className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ex: Résidence Les Cocotiers" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Adresse</label>
                <input type="text" required className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="Ex: Cocody, Abidjan" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre de logements</label>
                  <input type="number" required min="1" className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="10" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Prix moyen (FCFA)</label>
                  <input type="number" required min="0" className="w-full h-10 px-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="150000" />
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-full border border-slate-200 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  Annuler
                </button>
                <button type="submit" className="px-4 py-2 rounded-full bg-white border border-slate-400 text-slate-900 text-sm font-medium  hover:bg-slate-900 hover:text-white hover:border-slate-900">
                  Créer la propriété
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
