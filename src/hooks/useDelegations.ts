"use client";

import { useState, useEffect, useCallback } from "react";
import { getDelegations, getPendingDelegationsCount, PropertyDelegation } from "@/lib/supabase-api";

export function useDelegations() {
  const [delegations, setDelegations] = useState<PropertyDelegation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDelegations();
      setDelegations(data);
    } catch (error) {
      console.error("Failed to load delegations", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { delegations, isLoading, refreshDelegations: refresh };
}

export function usePendingDelegationsCount() {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const c = await getPendingDelegationsCount();
        setCount(c);
      } catch {
        setCount(0);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return { count, isLoading };
}
