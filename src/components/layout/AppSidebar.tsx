"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Home,
  Users,
  UserSquare2,
  FileText,
  Wallet,
  CreditCard,
  AlertTriangle,
  Receipt,
  Wrench,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
} from "lucide-react";
import { useCurrentAgency } from "@/hooks/useCurrentAgency";
import { useNewTicketsCount } from "@/hooks/useNewTicketsCount";
import { APP_NAME } from "@/lib/config";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Propriétés", href: "/properties", icon: Building2 },
  { name: "Logements", href: "/units", icon: Home },
  { name: "Locataires", href: "/tenants", icon: Users },
  { name: "Propriétaires", href: "/owners", icon: UserSquare2 },
];

const locativeNav = [
  { name: "Contrats de Bail", href: "/leases", icon: FileText },
  { name: "Loyers & Paiements", href: "/rent", icon: Wallet },
];

const adminNav = [
  { name: "Maintenance", href: "/maintenance", icon: Wrench },
  { name: "Rapports", href: "/reports", icon: BarChart3 },
];

export function AppSidebar({
  isExpanded,
  toggleSidebar,
  isMobileOpen,
  onMobileClose
}: {
  isExpanded: boolean;
  toggleSidebar: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  const pathname = usePathname();
  const { count: newTicketsCount, isLoadingCount } = useNewTicketsCount();
  const { currentAgency, isLoadingAgency } = useCurrentAgency();

  const agencyName = currentAgency?.name || APP_NAME;
  const isOwner = (currentAgency as any)?._isOwner === true;

  // Autonomous owners don't see the "Propriétaires" page
  // We also hide it while loading to prevent it from flashing for owners.
  const filteredNavigation = (isOwner || isLoadingAgency)
    ? navigation.filter(item => item.href !== "/owners")
    : navigation;

  const allNavItems = [
    ...filteredNavigation,
    ...locativeNav,
    ...adminNav,
  ];

  const renderNavItems = (items: typeof allNavItems) => {
    return items.map((item) => {
      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
      return (
        <Link
          key={item.name}
          href={item.href}
          onClick={() => {
            if (isMobileOpen && onMobileClose) {
              onMobileClose();
            }
          }}
          className={cn(
            "relative group flex items-center py-3 text-sm font-semibold rounded-2xl transition-all duration-200",
            isExpanded ? "px-4" : "justify-center px-2",
            isActive
              ? "bg-primary border border-primary text-white shadow-md shadow-primary/20 hover:bg-white hover:text-primary hover:border-primary/40"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          )}
          title={!isExpanded ? item.name : undefined}
        >
          <item.icon
            className={cn(
              "h-5 w-5 flex-shrink-0 transition-colors",
              "mr-4 lg:mr-0",
              isExpanded && "lg:mr-4",
              isActive ? "text-white group-hover:text-primary" : "text-slate-400 group-hover:text-slate-600"
            )}
            aria-hidden="true"
          />
          <span className={cn("block flex-1", !isExpanded && "lg:hidden")}>{item.name}</span>
          
          {item.name === "Maintenance" && isLoadingCount ? (
            <span className={cn(
              "bg-slate-200 animate-pulse rounded-full flex items-center justify-center transition-all",
              isExpanded 
                ? "h-5 min-w-[20px] ml-auto" 
                : "absolute top-1 right-1 h-4 min-w-[16px] border-2 border-white shadow-sm"
            )}></span>
          ) : item.name === "Maintenance" && newTicketsCount > 0 && (
            <span className={cn(
              "bg-red-500 text-white font-bold rounded-full flex items-center justify-center transition-all",
              isExpanded 
                ? "h-5 min-w-[20px] px-1.5 text-[10px] ml-auto" 
                : "absolute top-1 right-1 h-4 min-w-[16px] px-1 text-[9px] border-2 border-white shadow-sm"
            )}>
              {newTicketsCount > 99 ? '99+' : newTicketsCount}
            </span>
          )}
        </Link>
      );
    });
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300",
        isMobileOpen ? "translate-x-0 w-[260px]" : "-translate-x-full lg:translate-x-0",
        "lg:inset-y-0 lg:z-50 lg:flex lg:flex-col",
        isExpanded ? "lg:w-[260px]" : "lg:w-[88px]"
      )}>
      {/* Container with relative for floating button */}
      <div className="relative flex grow flex-col overflow-visible bg-white shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] z-10">
        
        {/* Floating Collapse Button */}
        <button 
          onClick={toggleSidebar} 
          className="absolute -right-3 top-9 hidden lg:flex h-6 w-6 items-center justify-center rounded-full bg-white border border-primary/40 text-primary shadow-md hover:bg-primary hover:text-white hover:border-primary transition-transform hover:scale-110 z-20"
        >
          <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", !isExpanded && "rotate-180")} />
        </button>

        <div className={cn(
          "flex grow flex-col gap-y-7 overflow-y-auto pb-4",
          isExpanded ? "px-5" : "px-3 items-center"
        )}>
          {/* Logo Area */}
          <div className={cn("flex h-24 shrink-0 items-center", isExpanded ? "justify-start pl-2" : "justify-center")}>
            <Link href="/dashboard" className="flex items-center gap-3" title={!isExpanded ? APP_NAME : undefined}>
              <div className="flex-shrink-0 flex items-center justify-center -ml-2">
                <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-contain drop-shadow-md" />
              </div>
              {isLoadingAgency ? (
                <div className={cn("h-6 bg-slate-200/60 animate-pulse rounded-md", !isExpanded && "hidden", isExpanded ? "w-32" : "w-20")}></div>
              ) : (
                <span className={cn("font-extrabold text-slate-800 tracking-tight block transition-all", 
                  !isExpanded && "lg:hidden",
                  (() => {
                    const txt = isOwner ? APP_NAME : agencyName;
                    if (txt.length > 18) return "text-[14px]";
                    if (txt.length > 12) return "text-[17px]";
                    return "text-[22px]";
                  })()
                )}>
                  {isOwner ? APP_NAME : agencyName}
                </span>
              )}
            </Link>
          </div>

          <div className="relative w-full h-[30px] shrink-0 mb-4 -mt-3">
            <svg 
              className="w-full h-full" 
              viewBox="0 0 100 30" 
              preserveAspectRatio="none"
              style={{ animation: 'shimmer-color 24s steps(4) infinite' }}
            >
              <defs>
                <linearGradient id="ekg-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="95%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>
                <mask id="ekg-mask">
                  <rect x="0" y="0" width="100" height="30" fill="url(#ekg-gradient)">
                    <animate attributeName="x" from="-100" to="100" dur="6s" repeatCount="indefinite" />
                  </rect>
                </mask>
              </defs>
              
              {/* Background faint line (optional, for the track) */}
              <path 
                d="M 0 15 L 35 15 L 40 2 L 45 23 L 50 9 L 55 19 L 60 13 L 65 15 L 100 15" 
                fill="none" 
                stroke="#f1f5f9" 
                strokeWidth="1" 
                vectorEffect="non-scaling-stroke"
              />
              
              {/* The glowing moving line */}
              <path 
                d="M 0 15 L 35 15 L 40 2 L 45 23 L 50 9 L 55 19 L 60 13 L 65 15 L 100 15" 
                fill="none" 
                stroke="#a855f7" 
                strokeWidth="1.5" 
                vectorEffect="non-scaling-stroke"
                mask="url(#ekg-mask)"
                className="drop-shadow-[0_0_4px_rgba(168,85,247,0.8)]"
              />
              
              <style>{`
                @keyframes shimmer-color {
                  0%   { filter: hue-rotate(0deg); }
                  25%  { filter: hue-rotate(90deg); }
                  50%  { filter: hue-rotate(180deg); }
                  75%  { filter: hue-rotate(270deg); }
                  100% { filter: hue-rotate(360deg); }
                }
              `}</style>
            </svg>
          </div>
          
          {/* Nav Links */}
          <nav className="flex flex-1 flex-col w-full">
            <ul role="list" className="flex flex-1 flex-col gap-y-2 w-full">
              {isLoadingAgency ? (
                <div className="animate-pulse flex flex-col gap-2 w-full mt-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className={cn("h-11 bg-slate-100 rounded-2xl transition-all", isExpanded ? "w-full" : "w-11 mx-auto")}></div>
                  ))}
                </div>
              ) : renderNavItems(allNavItems)}
            </ul>
          </nav>
          
          {/* Footer Text */}
          {!isLoadingAgency && !isOwner && (
            <div className={cn("mt-auto pt-4 pb-2 text-center shrink-0 transition-opacity duration-300 flex flex-col items-center", 
              !isExpanded && "lg:opacity-0 lg:pointer-events-none"
            )}>
              <div className="relative w-full h-[20px] shrink-0 mb-3">
                <svg 
                  className="w-full h-full" 
                  viewBox="0 0 100 30" 
                  preserveAspectRatio="none"
                  style={{ animation: 'shimmer-color 24s steps(4) infinite' }}
                >
                  <defs>
                    <linearGradient id="ekg-gradient-reverse" x1="100%" y1="0%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="transparent" />
                      <stop offset="95%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                    </linearGradient>
                    <mask id="ekg-mask-reverse">
                      <rect x="0" y="0" width="100" height="30" fill="url(#ekg-gradient-reverse)">
                        <animate attributeName="x" from="100" to="-100" dur="6s" repeatCount="indefinite" />
                      </rect>
                    </mask>
                  </defs>
                  
                  {/* Background faint line */}
                  <path 
                    d="M 0 15 L 35 15 L 40 2 L 45 23 L 50 9 L 55 19 L 60 13 L 65 15 L 100 15" 
                    fill="none" 
                    stroke="#f1f5f9" 
                    strokeWidth="1" 
                    vectorEffect="non-scaling-stroke"
                  />
                  
                  {/* The glowing moving line */}
                  <path 
                    d="M 0 15 L 35 15 L 40 2 L 45 23 L 50 9 L 55 19 L 60 13 L 65 15 L 100 15" 
                    fill="none" 
                    stroke="#a855f7" 
                    strokeWidth="1.5" 
                    vectorEffect="non-scaling-stroke"
                    mask="url(#ekg-mask-reverse)"
                    className="drop-shadow-[0_0_4px_rgba(168,85,247,0.8)]"
                  />
                </svg>
              </div>
              <span className={cn("text-[10px] font-bold text-slate-400 tracking-wider", !isExpanded && "lg:hidden")}>
                Propulsé par <span className="text-primary font-bold">{APP_NAME}</span>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
