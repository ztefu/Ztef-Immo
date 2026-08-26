"use client";

import { useState, useEffect } from "react";
import { getTenants } from "@/lib/supabase-api";

export function useExpiringLeasesCount() {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchCount() {
      try {
        const tenants = await getTenants();
        let expiringCount = 0;
        
        const parseFrenchDateToTime = (dateStr: string): number => {
          if (!dateStr || dateStr === "Non défini") return NaN;
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) return d.getTime();
          const parts = dateStr.trim().split(/\s+/);
          if (parts.length >= 3) {
            const day = parseInt(parts[0], 10);
            const months: Record<string, number> = { 
              "janvier": 0, "février": 1, "mars": 2, "avril": 3, "mai": 4, "juin": 5, 
              "juillet": 6, "août": 7, "septembre": 8, "octobre": 9, "novembre": 10, "décembre": 11,
              "Janvier": 0, "Février": 1, "Mars": 2, "Avril": 3, "Mai": 4, "Juin": 5, 
              "Juillet": 6, "Août": 7, "Septembre": 8, "Octobre": 9, "Novembre": 10, "Décembre": 11
            };
            const month = months[parts[1]] !== undefined ? months[parts[1]] : 0;
            const year = parseInt(parts[2], 10);
            return new Date(year, month, day).getTime();
          }
          return NaN;
        };

        tenants.forEach(tenant => {
          if (tenant.leaseEndDate && tenant.leaseEndDate !== "Non défini" && tenant.leaseStatus !== "Ancien") {
            const endDTime = parseFrenchDateToTime(tenant.leaseEndDate);
            if (!isNaN(endDTime)) {
              const now = new Date().getTime();
              const diffTime = endDTime - now;
              const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
              if (diffDays <= 30) {
                expiringCount++;
              }
            }
          }
        });
        
        setCount(expiringCount);
      } catch (e) {
        console.error("Error fetching expiring leases count", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCount();
  }, []);

  return { count, isLoadingCount: isLoading };
}
