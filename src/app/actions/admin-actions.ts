"use server";

import { createAdminClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function toggleAgencyStatus(agencyId: string, currentStatus: string) {
  const adminClient = createAdminClient();
  const newStatus = currentStatus === "Actif" ? "Suspendu" : "Actif";
  
  const { error } = await adminClient
    .from("agencies")
    .update({ status: newStatus })
    .eq("id", agencyId);
    
  if (error) {
    console.error(error);
    throw new Error("Une erreur interne est survenue.");
  }
  
  revalidatePath("/admin/agencies");
  revalidatePath("/admin");
  return newStatus;
}

export async function toggleOwnerStatus(ownerId: string, currentStatus: string) {
  const adminClient = createAdminClient();
  const newStatus = currentStatus === "Actif" ? "Suspendu" : "Actif";
  
  const { error } = await adminClient
    .from("owners")
    .update({ status: newStatus })
    .eq("id", ownerId);
    
  if (error) {
    console.error(error);
    throw new Error("Une erreur interne est survenue.");
  }
  
  revalidatePath("/admin/owners");
  revalidatePath("/admin");
  return newStatus;
}
