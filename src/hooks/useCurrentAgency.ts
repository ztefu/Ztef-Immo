"use client";

import { useState, useEffect } from "react";
import { Agency } from "@/lib/mock-data";
import { getCurrentAgency } from "@/lib/supabase-api";

import { createClient } from "@/utils/supabase/client";

export function useCurrentAgency() {
  const [currentAgency, setCurrentAgency] = useState<Agency | null>(null);
  const [isLoadingAgency, setIsLoadingAgency] = useState(true);

  useEffect(() => {
    async function loadAgency() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        const agency = await getCurrentAgency(user?.id);
        console.log('useCurrentAgency fetch:', { userId: user?.id, agency });
        setCurrentAgency(agency);
      } catch (error) {
        console.error("Failed to load current agency", error);
      } finally {
        setIsLoadingAgency(false);
      }
    }
    loadAgency();
  }, []);

  return { currentAgency, isLoadingAgency, setCurrentAgency };
}
