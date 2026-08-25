"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  UserSquare2,
  ChevronLeft,
} from "lucide-react";
import { APP_NAME } from "@/lib/config";

const adminNavigation = [
  { name: "Vue d'ensemble", href: "/admin", icon: LayoutDashboard },
  { name: "Agences", href: "/admin/agencies", icon: Building2 },
  { name: "Propriétaires", href: "/admin/owners", icon: UserSquare2 },
];

export function AdminSidebar({
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

  const renderNavItems = () => {
    return adminNavigation.map((item) => {
      // Pour éviter que /admin active tout, on vérifie l'égalité exacte ou le sous-chemin
      const isActive = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
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
            "relative group flex items-center py-2 sm:py-3 text-sm font-semibold rounded-2xl transition-all duration-200",
            isExpanded ? "px-4" : "justify-center px-2",
            isActive
              ? "bg-slate-900 border border-slate-900 text-white shadow-md shadow-slate-900/20 hover:bg-white hover:text-slate-900 hover:border-slate-900/40"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          )}
          title={!isExpanded ? item.name : undefined}
        >
          <item.icon
            className={cn(
              "h-5 w-5 flex-shrink-0 transition-colors",
              "mr-4 lg:mr-0",
              isExpanded && "lg:mr-4",
              isActive ? "text-white group-hover:text-slate-900" : "text-slate-400 group-hover:text-slate-600"
            )}
            aria-hidden="true"
          />
          <span className={cn("block flex-1", !isExpanded && "lg:hidden")}>{item.name}</span>
        </Link>
      );
    });
  };

  return (
    <>
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      <div className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-300",
        isMobileOpen ? "translate-x-0 w-[260px]" : "-translate-x-full lg:translate-x-0",
        "lg:inset-y-0 lg:z-50 lg:flex lg:flex-col",
        isExpanded ? "lg:w-[260px]" : "lg:w-[88px]"
      )}>
        <div className="relative flex grow flex-col overflow-visible bg-white shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] z-10 border-r border-slate-200">
          
          <button 
            onClick={toggleSidebar} 
            className="absolute -right-3 top-9 hidden lg:flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white border border-slate-900 shadow-md hover:bg-white hover:text-slate-900 hover:border-slate-900/40 transition-transform hover:scale-110 z-20"
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform duration-300", !isExpanded && "rotate-180")} />
          </button>

          <div className={cn(
            "flex grow flex-col gap-y-4 sm:gap-y-7 overflow-y-auto pb-4",
            isExpanded ? "px-5" : "px-3 items-center"
          )}>
            <div className={cn("flex h-16 sm:h-24 shrink-0 items-center", isExpanded ? "justify-start pl-2" : "justify-center")}>
              <Link href="/admin" className="flex items-center gap-3" title={!isExpanded ? "Super Admin" : undefined}>
                <div className="flex-shrink-0 flex items-center justify-center -ml-2">
                  <motion.div 
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 2, repeat: 15, ease: "easeInOut" }}
                  >
                    <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-contain drop-shadow-md grayscale" />
                  </motion.div>
                </div>
                <span className={cn("font-extrabold text-slate-800 tracking-tight block transition-all", 
                  !isExpanded && "lg:hidden", "text-[18px]"
                )}>
                  Super Admin
                </span>
              </Link>
            </div>

            <div className="relative w-full h-[20px] sm:h-[30px] shrink-0 mb-2 sm:mb-4 -mt-2 sm:-mt-3">
              <svg 
                className="w-full h-full" 
                viewBox="0 0 100 30" 
                preserveAspectRatio="none"
                style={{ animation: 'shimmer-color-admin 24s steps(4) infinite' }}
              >
                <defs>
                  <linearGradient id="ekg-gradient-admin" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="95%" stopColor="#0f172a" />
                    <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                  </linearGradient>
                  <mask id="ekg-mask-admin">
                    <rect x="0" y="0" width="100" height="30" fill="url(#ekg-gradient-admin)">
                      <animate attributeName="x" from="-100" to="100" dur="6s" repeatCount="indefinite" />
                    </rect>
                  </mask>
                </defs>
                
                <path 
                  d="M 0 15 L 35 15 L 40 2 L 45 23 L 50 9 L 55 19 L 60 13 L 65 15 L 100 15" 
                  fill="none" 
                  stroke="#f1f5f9" 
                  strokeWidth="1" 
                  vectorEffect="non-scaling-stroke"
                />
                
                <path 
                  d="M 0 15 L 35 15 L 40 2 L 45 23 L 50 9 L 55 19 L 60 13 L 65 15 L 100 15" 
                  fill="none" 
                  stroke="#0f172a" 
                  strokeWidth="1.5" 
                  vectorEffect="non-scaling-stroke"
                  mask="url(#ekg-mask-admin)"
                  className="drop-shadow-[0_0_4px_rgba(15,23,42,0.5)]"
                />
              </svg>
            </div>
            
            <nav className="flex flex-1 flex-col w-full">
              <ul role="list" className="flex flex-1 flex-col gap-y-1 sm:gap-y-2 w-full">
                {renderNavItems()}
              </ul>
            </nav>
            
            <div className={cn("mt-auto pt-4 pb-24 lg:pb-2 text-center shrink-0 transition-opacity duration-300 flex flex-col items-center", 
              !isExpanded && "lg:opacity-0 lg:pointer-events-none"
            )}>
              <div className="relative w-full h-[20px] shrink-0 mb-3">
                <svg 
                  className="w-full h-full" 
                  viewBox="0 0 100 30" 
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="ekg-gradient-admin-reverse" x1="100%" y1="0%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="transparent" />
                      <stop offset="95%" stopColor="#0f172a" />
                      <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
                    </linearGradient>
                    <mask id="ekg-mask-admin-reverse">
                      <rect x="0" y="0" width="100" height="30" fill="url(#ekg-gradient-admin-reverse)">
                        <animate attributeName="x" from="100" to="-100" dur="6s" repeatCount="indefinite" />
                      </rect>
                    </mask>
                  </defs>
                  
                  <path 
                    d="M 0 15 L 35 15 L 40 2 L 45 23 L 50 9 L 55 19 L 60 13 L 65 15 L 100 15" 
                    fill="none" 
                    stroke="#f1f5f9" 
                    strokeWidth="1" 
                    vectorEffect="non-scaling-stroke"
                  />
                  
                  <path 
                    d="M 0 15 L 35 15 L 40 2 L 45 23 L 50 9 L 55 19 L 60 13 L 65 15 L 100 15" 
                    fill="none" 
                    stroke="#0f172a" 
                    strokeWidth="1.5" 
                    vectorEffect="non-scaling-stroke"
                    mask="url(#ekg-mask-admin-reverse)"
                    className="drop-shadow-[0_0_4px_rgba(15,23,42,0.5)]"
                  />
                </svg>
              </div>
              <span className={cn("text-[10px] font-bold text-slate-400 tracking-wider", !isExpanded && "lg:hidden")}>
                Propulsé par <span className="text-slate-900 font-bold">{APP_NAME}</span>
              </span>
            </div>
            
          </div>
        </div>
      </div>
    </>
  );
}
