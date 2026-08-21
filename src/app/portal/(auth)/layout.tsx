"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Receipt, Wrench, LogOut } from "lucide-react";
import { getTenantByAuthId } from "@/lib/supabase-api";
import { createClient } from "@/utils/supabase/client";
import { Tenant } from "@/lib/mock-data";
import { APP_NAME } from "@/lib/config";

export default function PortalAuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [logoutUrl, setLogoutUrl] = useState<string>("/portal");

  useEffect(() => {
    // 1. Instant resolve from cache (solves the redirect to generic login issue)
    const savedUrl = localStorage.getItem('portal_logout_url');
    if (savedUrl) {
      setLogoutUrl(savedUrl);
    }

    async function loadUser() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const matchedTenant = await getTenantByAuthId(user.id);
          if (matchedTenant) {
            setCurrentTenant(matchedTenant);
            
            // Determine logout URL with slug
            if (matchedTenant.agencyId) {
              const { data } = await supabase.from('agencies').select('slug').eq('id', matchedTenant.agencyId).single();
              if (data?.slug) setLogoutUrl(`/portal?agency=${data.slug}`);
            } else if (matchedTenant.unitId) {
              const { data: unit } = await supabase.from('units').select('property_id').eq('id', matchedTenant.unitId).single();
              if (unit) {
                const { data: prop } = await supabase.from('properties').select('owner_id').eq('id', unit.property_id).single();
                if (prop) {
                  const { data: owner } = await supabase.from('owners').select('slug').eq('id', prop.owner_id).single();
                  if (owner?.slug) setLogoutUrl(`/portal?owner=${owner.slug}`);
                }
              }
            }
          }
        }
      } catch (e) {
        console.error("Error loading tenant", e);
      }
    }
    loadUser();
  }, []);

  const navItems = [
    { name: "Accueil", href: "/portal/dashboard", icon: Home },
    { name: "Paiements", href: "/portal/payments", icon: Receipt },
    { name: "Dépannage", href: "/portal/maintenance", icon: Wrench },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 w-full relative">
      
      {/* Top Header */}
      <header className="bg-white px-5 py-4 flex items-center justify-between shadow-sm sticky top-0 z-20">
        <div className="flex flex-col">
          <span className="text-xs text-slate-500 font-medium">Bonjour,</span>
          <span className="text-lg font-bold text-slate-900 leading-tight">
            {currentTenant ? currentTenant.fullName : "Chargement..."}
          </span>
        </div>
        <button onClick={async () => {
          const supabase = createClient();
          await supabase.auth.signOut();
          window.location.href = logoutUrl;
        }} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-28 flex flex-col">
        {children}
        
        {/* Footer with Animation */}
        <div className="mt-auto pt-8 pb-6 text-center flex flex-col items-center overflow-hidden">
          {/* EKG Animation */}
          <div className="relative w-full max-w-[200px] h-[20px] mb-2">
            <svg 
              className="w-full h-full" 
              viewBox="0 0 100 30" 
              preserveAspectRatio="none"
              style={{ animation: 'shimmer-color 24s steps(4) infinite' }}
            >
              <defs>
                <linearGradient id="ekg-gradient-footer" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="95%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>
                <mask id="ekg-mask-footer">
                  <rect x="0" y="0" width="100" height="30" fill="url(#ekg-gradient-footer)">
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
                stroke="#a855f7" 
                strokeWidth="1.5" 
                vectorEffect="non-scaling-stroke"
                mask="url(#ekg-mask-footer)"
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
          
          <p className="text-xs font-semibold text-slate-400">
            Propulsé par <span className="text-primary font-bold">{APP_NAME}</span>
          </p>
        </div>
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <div className="w-full max-w-md bg-white border-t border-slate-200 px-6 py-3 flex justify-between items-center pointer-events-auto pb-safe">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link 
                key={item.href} 
                href={item.href}
                className="flex flex-col items-center gap-1"
              >
                <div className={`p-1.5 rounded-full transition-colors ${isActive ? "bg-primary/10 text-primary" : "text-slate-400"}`}>
                  <Icon className={`w-6 h-6 ${isActive ? "fill-primary/20" : ""}`} />
                </div>
                <span className={`text-[10px] font-semibold ${isActive ? "text-primary" : "text-slate-400"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      
    </div>
  );
}
