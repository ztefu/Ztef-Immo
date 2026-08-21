"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { getUserRole, UserRole } from "@/lib/user-role";

export function useUserRole() {
  const [role, setRole] = useState<UserRole>(null);
  const [isLoadingRole, setIsLoadingRole] = useState(true);

  useEffect(() => {
    async function loadRole() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const userRole = await getUserRole(user.id);
          setRole(userRole);
        }
      } catch (error) {
        console.error("Failed to load user role", error);
      } finally {
        setIsLoadingRole(false);
      }
    }
    loadRole();
  }, []);

  return { role, isLoadingRole };
}
