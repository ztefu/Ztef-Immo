"use client";

import { motion } from "framer-motion";
import { ArrowRight, KeyRound, Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { loginTenant } from "./actions";
import { getAgencyById, getOwnerBySlug } from "@/lib/supabase-api";
import { Agency, Owner } from "@/lib/mock-data";
import Image from "next/image";
import { APP_NAME } from "@/lib/config";

function PortalLoginContent() {
  const searchParams = useSearchParams();
  const agencyParam = searchParams.get("agency") || "";
  const ownerParam = searchParams.get("owner") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [owner, setOwner] = useState<Owner | null>(null);
  const [isLoadingManager, setIsLoadingManager] = useState(true);

  // Determine the scope: either agency or owner
  const scopeType = ownerParam ? "owner" : "agency";
  const scopeSlug = ownerParam || agencyParam;
  const managerName = agency?.name || owner?.fullName || null;

  useEffect(() => {
    // Enregistre l'URL en cache pour la déconnexion
    if (agencyParam) localStorage.setItem('portal_logout_url', `/portal?agency=${agencyParam}`);
    if (ownerParam) localStorage.setItem('portal_logout_url', `/portal?owner=${ownerParam}`);

    async function loadManager() {
      if (agencyParam) {
        try {
          const fetchedAgency = await getAgencyById(agencyParam);
          if (fetchedAgency) setAgency(fetchedAgency);
        } catch (e) {
          console.error("Failed to load agency:", e);
        }
      } else if (ownerParam) {
        try {
          const fetchedOwner = await getOwnerBySlug(ownerParam);
          if (fetchedOwner) setOwner(fetchedOwner);
        } catch (e) {
          console.error("Failed to load owner:", e);
        }
      }
      setIsLoadingManager(false);
    }
    loadManager();
  }, [agencyParam, ownerParam]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden min-h-screen">
      {/* Background Image with blur */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/bg-portal.jpg" 
          alt="Portal background" 
          fill 
          className="object-cover blur-[8px] scale-110 brightness-[0.8]" 
          priority 
        />
        <div className="absolute inset-0 bg-slate-900/10" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-sm flex flex-col items-center bg-white/75 backdrop-blur-xl p-8 sm:p-10 rounded-[32px] shadow-2xl border border-white/40"
      >
        {/* App Logo */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 2, repeat: 15, ease: "easeInOut" }}
          className="flex items-center gap-3 mb-8"
        >
          {isLoadingManager ? (
            <div className="w-12 h-12 bg-slate-200/50 animate-pulse rounded-2xl shadow-sm" />
          ) : agency?.logoUrl ? (
            <img src={agency.logoUrl} alt="Logo de l'agence" className="w-12 h-12 rounded-2xl object-contain shadow-md bg-white" />
          ) : (
            <div className="flex items-center justify-center">
              <motion.div 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: 15, ease: "easeInOut" }}
              >
                <Image src="/logo.png" alt="Logo" width={72} height={72} className="object-contain drop-shadow-xl" />
              </motion.div>
            </div>
          )}
        </motion.div>
        
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Espace Locataire</h1>
        {isLoadingManager ? (
          <div className="flex flex-col items-center gap-2 mb-10 w-full px-4">
            <div className="h-4 bg-slate-200/50 animate-pulse rounded w-full"></div>
            <div className="h-4 bg-slate-200/50 animate-pulse rounded w-3/4"></div>
          </div>
        ) : managerName ? (
          <p className="text-slate-600 text-center text-sm mb-10 font-medium">
            Bienvenue sur le portail {scopeType === 'agency' ? "de l'agence" : "de"} <strong>{managerName}</strong>. Connectez-vous pour consulter votre dossier.
          </p>
        ) : (
          <p className="text-slate-600 text-center text-sm mb-10 font-medium">
            Connectez-vous pour consulter votre dossier et payer votre loyer.
          </p>
        )}

        {errorMsg && (
          <div className="w-full bg-red-50/90 text-red-600 text-sm font-bold p-3 rounded-xl text-center mb-6 border border-red-100">
            {errorMsg}
          </div>
        )}

        <form onSubmit={async (e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          
          setIsLoading(true);
          setErrorMsg("");
          await new Promise(resolve => setTimeout(resolve, 10)); // Force React to flush state
          
          const result = await loginTenant(formData);
          
          if (result?.error) {
            setErrorMsg(result.error);
            setIsLoading(false);
          }
        }} className="w-full space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Numéro de téléphone</label>
            <input 
              type="tel"
              name="phone"
              required
              placeholder="Ex: 6 90 00 00 00"
              className="w-full px-5 py-3.5 bg-white/90 border border-slate-200/50 rounded-[20px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium"
            />
          </div>
          
          {/* Hidden inputs for scope */}
          <input type="hidden" name="scopeType" value={scopeType} />
          <input type="hidden" name="scopeId" value={scopeType === 'agency' ? (agency?.id || agencyParam) : (owner?.id || ownerParam)} />
          <input type="hidden" name="scopeSlug" value={scopeSlug} />
          
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">Code d'accès</label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type={showPassword ? "text" : "password"}
                name="code"
                required
                placeholder="Entrez votre code secret"
                className="w-full pl-12 pr-12 py-3.5 bg-white/90 border border-slate-200/50 rounded-[20px] focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-sm font-medium tracking-widest"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 focus:outline-none"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-6 flex items-center justify-center gap-2 bg-white border border-primary/40 text-primary px-5 py-4 rounded-[20px] hover:bg-primary hover:text-white hover:border-primary transition-colors text-sm font-semibold shadow-xl shadow-primary/20 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? "Connexion en cours..." : "Accéder à mon espace"}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <p className="mt-8 text-xs text-slate-600/80 font-semibold text-center">
          Propulsé par {APP_NAME}
        </p>
      </motion.div>
    </div>
  );
}

export default function PortalLogin() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="animate-pulse text-slate-400">Chargement...</div>
      </div>
    }>
      <PortalLoginContent />
    </Suspense>
  );
}
