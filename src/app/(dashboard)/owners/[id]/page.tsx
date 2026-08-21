"use client";

import { PageHeader } from "@/components/ui/PageHeader";
import { ArrowLeft, User, Phone, Mail, MapPin, Building2, Wallet, Briefcase, ChevronRight, Info } from "lucide-react";
import { motion } from "framer-motion";
import { Owner, Property } from "@/lib/mock-data";
import { getOwners, getProperties, getUnits, getTenants, getPayments } from "@/lib/supabase-api";
import Link from "next/link";
import { useState, useEffect } from "react";
import { PageHeaderSkeleton, StatCardSkeleton } from "@/components/ui/Skeletons";
import { Skeleton } from "@/components/ui/skeleton";

export default function OwnerDetailPage({ params }: { params: { id: string } }) {
  const [owner, setOwner] = useState<Owner | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState({ totalRentCollected: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [ownersData, propsData, unitsData, tenantsData, paymentsData] = await Promise.all([
          getOwners(),
          getProperties(),
          getUnits(),
          getTenants(),
          getPayments()
        ]);
        
        const o = ownersData.find(own => own.id === params.id);
        if (o) {
          setOwner(o);
          
          const ownerProps = propsData.filter(p => p.ownerId === o.id);
          setProperties(ownerProps);
          
          let totalRentCollected = 0;
          ownerProps.forEach(p => {
            const propUnits = unitsData.filter(u => u.propertyId === p.id);
            propUnits.forEach(u => {
              const propTenants = tenantsData.filter(t => t.unitId === u.id);
              propTenants.forEach(t => {
                const tenantPayments = paymentsData.filter(pay => pay.tenantId === t.id);
                tenantPayments.forEach(pay => {
                  totalRentCollected += (pay.amountPaid || 0);
                });
              });
            });
          });
          
          setStats({ totalRentCollected });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-20">
        <PageHeaderSkeleton />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
        <div className="bg-white rounded-[32px] p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] mt-8">
          <Skeleton className="h-8 w-64 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!owner) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Propriétaire introuvable</h2>
        <Link href="/owners" className="text-primary hover:underline">Retour à la liste</Link>
      </div>
    );
  }

  // Financial logic based on Management Type
  const totalRents = stats.totalRentCollected;
  const isDelegated = owner.managementType === "Déléguée";
  const commissionAmount = isDelegated ? (totalRents * (owner.commissionRate || 0)) / 100 : 0;
  const netOwnerPayout = totalRents - commissionAmount;

  return (
    <div className="flex flex-col gap-8 pb-10">
      <div>
        <Link href="/owners" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour aux propriétaires
        </Link>
        <PageHeader 
          title={owner.fullName} 
          description="Profil du propriétaire et performance de son portefeuille"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne de gauche : Profil & Contacts */}
        <div className="flex flex-col gap-6 lg:col-span-1">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-[32px] p-6 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col items-center text-center"
          >
            <div className="h-24 w-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-4xl mb-4 shadow-inner">
              {owner.fullName.charAt(0)}
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">{owner.fullName}</h2>
            <div className="mb-6">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                isDelegated ? "bg-[#dbeafe] text-[#3b82f6]" : "bg-[#f3e8ff] text-[#a855f7]"
              }`}>
                <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                Gestion {owner.managementType} {isDelegated && `(${owner.commissionRate}%)`}
              </span>
            </div>

            <div className="w-full flex flex-col gap-4 text-left border-t border-slate-100 pt-6">
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 text-slate-400 mr-3" />
                <span className="font-medium text-slate-700">{owner.phone}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 text-slate-400 mr-3" />
                <span className="font-medium text-slate-700">{owner.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 text-slate-400 mr-3" />
                <span className="font-medium text-slate-700">{owner.address || "Non renseignée"}</span>
              </div>
              <div className="flex items-center text-sm">
                <User className="h-4 w-4 text-slate-400 mr-3" />
                <span className="font-medium text-slate-500">Membre depuis: {owner.joinDate || "N/A"}</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Colonne de droite : Finances & Propriétés */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          
          {/* Bloc Financier & Commissions */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-[32px] p-6 lg:p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Synthèse Financière (Mensuelle)</h3>
              <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                <Wallet className="h-5 w-5" />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-[20px] p-5 border border-slate-100">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Loyers Encaissés</div>
                <div className="text-2xl font-bold text-slate-900">{totalRents.toLocaleString()} <span className="text-sm font-medium text-slate-500">FCFA</span></div>
              </div>
              <div className="bg-blue-50 rounded-[20px] p-5 border border-blue-100">
                <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
                  Commission Agence {isDelegated && `(${owner.commissionRate}%)`}
                </div>
                <div className="text-2xl font-bold text-blue-700">{commissionAmount.toLocaleString()} <span className="text-sm font-medium text-blue-500">FCFA</span></div>
              </div>
              <div className="bg-green-50 rounded-[20px] p-5 border border-green-100">
                <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2">Revenu Net Propriétaire</div>
                <div className="text-2xl font-bold text-green-700">{netOwnerPayout.toLocaleString()} <span className="text-sm font-medium text-green-500">FCFA</span></div>
              </div>
            </div>
            {!isDelegated && (
              <div className="mt-4 text-xs font-medium text-slate-500 flex items-center gap-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <Info className="h-4 w-4 flex-shrink-0" />
                Ce propriétaire est en gestion autonome. Aucune commission d'agence n'est prélevée sur ses encaissements.
              </div>
            )}
          </motion.div>

          {/* Liste des Propriétés du Propriétaire */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-[32px] p-6 lg:p-8 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] border border-slate-100"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Portefeuille ({properties.length} {properties.length > 1 ? 'biens' : 'bien'})</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {properties.length > 0 ? properties.map(property => (
                <Link href={`/properties/${property.id}`} key={property.id}>
                  <div className="group border border-slate-100 rounded-[20px] p-4 flex flex-col hover:border-primary/30 hover:shadow-md transition-all h-full bg-slate-50 hover:bg-white cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div className="overflow-hidden">
                        <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-primary transition-colors">{property.name}</h4>
                        <p className="text-xs text-slate-500 truncate">{property.type}</p>
                      </div>
                    </div>
                    <div className="mt-auto flex items-center justify-between text-xs font-medium text-slate-600">
                      <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-slate-100">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span className="truncate max-w-[100px]">{property.city}</span>
                      </div>
                      <div className="flex items-center text-primary group-hover:translate-x-1 transition-transform">
                        Voir <ChevronRight className="h-3 w-3 ml-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="col-span-full py-8 text-center text-slate-500 text-sm">
                  Ce propriétaire n'a aucune propriété assignée.
                </div>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
