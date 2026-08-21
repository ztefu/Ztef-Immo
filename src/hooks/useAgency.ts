"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { getCurrentAgency } from "@/lib/supabase-api";

export function useAgency() {
  const [agencyId, setAgencyId] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserName(user.user_metadata?.full_name || user.user_metadata?.first_name || "Gérant");
          
          const agency = await getCurrentAgency(user.id);
          if (agency) {
            // For autonomous owners, the name returned is their name, we can set it empty to not duplicate it
            if ((agency as any)._isOwner) {
              setAgencyName("");
              setIsOwner(true);
            } else {
              setAgencyName(agency.name);
            }
            setAgencyId(agency.id);
          } else {
            setAgencyName("");
          }
        }
      } catch (error) {
        console.error("Failed to load agency details", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  return { agencyId, agencyName, userName, isLoading, isOwner };
}
