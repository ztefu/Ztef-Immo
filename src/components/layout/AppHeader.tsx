"use client";

import { Search, Bell, Settings, Mic, User, LogOut, ChevronDown, Menu } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAgency } from "@/hooks/useAgency";
import { useNewTicketsCount } from "@/hooks/useNewTicketsCount";

export function AppHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { agencyName, userName, isLoading, isOwner } = useAgency();
  const { count: newTicketsCount, isLoadingCount } = useNewTicketsCount();
  const pathname = usePathname();
  const isSettingsActive = pathname.startsWith("/settings");

  const handleLogout = async () => {
    try {
      const { createClient } = await import("@/utils/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
      window.location.href = "/login";
    } catch (error) {
      toast.error("Erreur lors de la déconnexion");
    }
  };

  return (
    <div className="sticky top-0 z-40 flex shrink-0 items-center gap-x-2 sm:gap-x-6 bg-slate-50/90 backdrop-blur-md px-4 sm:px-6 lg:px-8 pt-4 pb-2">
      <button 
        type="button" 
        className="-m-2.5 p-2.5 text-slate-700 lg:hidden hover:bg-slate-100 rounded-full transition-colors mr-2"
        onClick={onMenuClick}
      >
        <span className="sr-only">Ouvrir le menu</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 items-center justify-between bg-white rounded-[24px] p-2 sm:p-3 sm:px-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 transition-all duration-300">
        <div className="flex flex-1 items-center gap-x-4">
          <div className="flex flex-col pl-2">
            {isLoading ? (
              <div className="animate-pulse flex flex-col gap-1.5 py-1">
                <div className="h-4 bg-slate-200 rounded w-24"></div>
                <div className="h-3 bg-slate-200 rounded w-48 hidden sm:block"></div>
              </div>
            ) : (
              <>
                <span className="text-[15px] sm:text-sm font-bold text-slate-900 truncate max-w-[150px] sm:max-w-none whitespace-nowrap">
                  👋 Salut, {userName.split(' ')[0]}
                </span>
                <span className="hidden sm:inline sm:text-xs font-medium text-slate-500 sm:ml-1">
                  {isOwner ? "Gérez vos biens immobiliers en toute simplicité." : "Gérez votre parc immobilier en toute simplicité."}
                </span>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-x-2 sm:gap-x-4">
          <button type="button" className="relative flex items-center justify-center h-10 w-10 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
            <span className="sr-only">Voir les notifications</span>
            <Bell className="h-5 w-5" aria-hidden="true" />
            {isLoadingCount ? (
              <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] rounded-full bg-slate-200 animate-pulse border-2 border-white"></span>
            ) : newTicketsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 min-w-[16px] px-1 rounded-full bg-red-500 border-2 border-white text-[9px] font-bold text-white flex items-center justify-center">
                {newTicketsCount > 99 ? '99+' : newTicketsCount}
              </span>
            )}
          </button>
          
          <Link 
            href="/settings?tab=agence" 
            className={cn(
              "relative flex items-center justify-center h-10 w-10 rounded-full transition-colors",
              isSettingsActive 
                ? "bg-primary border border-primary text-white shadow-md shadow-primary/20 hover:bg-white hover:text-primary hover:border-primary/40" 
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
            )}
          >
            <Settings className="h-5 w-5" aria-hidden="true" />
          </Link>

          {/* Profile Dropdown */}
          <div className="relative ml-1 sm:ml-2 pl-2 border-l border-slate-200">
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-x-2 sm:gap-x-3 p-1 rounded-full hover:bg-slate-50 transition-colors"
            >
              {isLoading ? (
                <div className="animate-pulse flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-200 border-2 border-white shadow-sm shrink-0"></div>
                  <div className="hidden lg:block h-4 bg-slate-200 rounded w-20"></div>
                </div>
              ) : (
                <>
                  <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-900 overflow-hidden border-2 border-white shadow-sm shrink-0">
                    <img src={`https://ui-avatars.com/api/?name=${userName.replace(/\s+/g, '+')}&background=e2e8f0&color=0f172a`} alt="User" />
                  </div>
                  <span className="hidden lg:flex lg:items-center">
                    <span className="text-sm font-semibold leading-6 text-slate-900 mr-1" aria-hidden="true">
                      {userName.split(' ')[0]}
                    </span>
                    <ChevronDown className="h-4 w-4 text-slate-400" aria-hidden="true" />
                  </span>
                </>
              )}
            </button>
            
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsProfileOpen(false)}></div>
                <div className="absolute right-0 z-20 mt-2.5 w-48 origin-top-right rounded-xl bg-white py-2 shadow-lg ring-1 ring-slate-900/5 focus:outline-none">
                  <div className="px-4 py-3 border-b border-slate-100 mb-1 lg:hidden">
                    <p className="text-sm font-semibold text-slate-900">{userName.split(' ')[0]}</p>
                    <p className="text-xs text-slate-500 truncate">{agencyName}</p>
                  </div>
                  <Link 
                    href="/settings?tab=compte"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-primary transition-colors"
                  >
                    <User className="mr-3 h-4 w-4 text-slate-400" />
                    Profil
                  </Link>
                  <button 
                    onClick={() => { setIsProfileOpen(false); handleLogout(); }}
                    className="flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-destructive transition-colors mt-1"
                  >
                    <LogOut className="mr-3 h-4 w-4 text-slate-400" />
                    Déconnexion
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

