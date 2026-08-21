"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { getTenantByAuthId } from "@/lib/supabase-api";
import { Tenant } from "@/lib/mock-data";

export function useCurrentTenant() {
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchTenant() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const tenant = await getTenantByAuthId(user.id);
          if (tenant && isMounted) {
            setCurrentTenant(tenant);
          }
        }
      } catch (e) {
        console.error("Error loading tenant", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchTenant();
    return () => {
      isMounted = false;
    };
  }, []);

  return { currentTenant, isLoadingTenant: isLoading };
}
