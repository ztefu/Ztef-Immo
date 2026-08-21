"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { getNewTicketsCount } from "@/lib/supabase-api";

export function useNewTicketsCount() {
  const [count, setCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchCount() {
      try {
        const resultCount = await getNewTicketsCount();
        setCount(resultCount);
      } catch (e) {
        console.error("Error fetching new tickets count", e);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCount();
    
    // Optional: Set up real-time subscription for new tickets
    const supabase = createClient();
    const channelId = `tickets-count-${Math.random()}`;
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tickets' }, payload => {
        fetchCount(); // Refresh count on any change to tickets
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { count, isLoadingCount: isLoading };
}
