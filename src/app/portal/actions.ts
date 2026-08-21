"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function loginTenant(formData: FormData) {
  const phone = formData.get("phone") as string;
  const code = formData.get("code") as string;
  const scopeType = formData.get("scopeType") as string; // "agency" or "owner"
  const scopeId = formData.get("scopeId") as string;
  const scopeSlug = formData.get("scopeSlug") as string;
  
  if (!phone || !code) {
    return { error: "Numéro de téléphone et code d'accès requis." };
  }
  
  if (!scopeId && !scopeSlug) {
    return { error: "Lien de connexion invalide. Veuillez utiliser le lien fourni par votre gestionnaire." };
  }
  
  const cleanPhone = phone.replace(/\s+/g, '');
  const adminClient = createAdminClient();

  // Resolve the correct scope ID
  let resolvedScopeId = scopeId;

  if (scopeType === 'agency') {
    // If scopeId looks like a slug, resolve it to UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(scopeId);
    if (!isUUID) {
      const { data: agency } = await adminClient.from('agencies').select('id').eq('slug', scopeId).single();
      if (!agency) {
        // Try with the slug param directly
        const { data: agency2 } = await adminClient.from('agencies').select('id').eq('slug', scopeSlug).single();
        resolvedScopeId = agency2?.id || scopeId;
      } else {
        resolvedScopeId = agency.id;
      }
    }
    
    // Find tenant by phone in this agency
    const { data: tenants } = await adminClient
      .from('tenants')
      .select('phone')
      .eq('agency_id', resolvedScopeId);
      
    let targetPhone = cleanPhone;
    if (tenants) {
      const inputForCompare = cleanPhone.replace(/^\+237/, '');
      const matchedTenant = tenants.find(t => t.phone.replace(/\s+/g, '').replace(/^\+237/, '') === inputForCompare);
      if (matchedTenant) {
        targetPhone = matchedTenant.phone.replace(/\s+/g, '');
      }
    }

    const pseudoEmail = `${targetPhone}.${resolvedScopeId}@locataire.ztefu.com`;
    
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: pseudoEmail,
      password: code,
    });
    
    if (error) {
      console.error("Tenant login error:", error.message);
      return { error: "Numéro de téléphone ou code d'accès incorrect." };
    }

  } else if (scopeType === 'owner') {
    // For autonomous owner: resolve owner ID from slug if needed
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(scopeId);
    if (!isUUID) {
      const { data: owner } = await adminClient.from('owners').select('id').eq('slug', scopeId).single();
      if (!owner) {
        const { data: owner2 } = await adminClient.from('owners').select('id').eq('slug', scopeSlug).single();
        resolvedScopeId = owner2?.id || scopeId;
      } else {
        resolvedScopeId = owner.id;
      }
    }

    // Find tenant by phone in this owner's properties
    // Tenants of autonomous owners have agency_id = NULL
    // We need to find tenants linked to units in properties owned by this owner
    const { data: properties } = await adminClient
      .from('properties')
      .select('id')
      .eq('owner_id', resolvedScopeId);

    if (!properties || properties.length === 0) {
      return { error: "Aucun bien trouvé pour ce propriétaire." };
    }

    const propertyIds = properties.map(p => p.id);
    const { data: units } = await adminClient
      .from('units')
      .select('id')
      .in('property_id', propertyIds);

    if (!units || units.length === 0) {
      return { error: "Aucun logement trouvé." };
    }

    const unitIds = units.map(u => u.id);
    const { data: tenants } = await adminClient
      .from('tenants')
      .select('phone')
      .in('unit_id', unitIds);

    let targetPhone = cleanPhone;
    if (tenants) {
      const inputForCompare = cleanPhone.replace(/^\+237/, '');
      const matchedTenant = tenants.find(t => t.phone.replace(/\s+/g, '').replace(/^\+237/, '') === inputForCompare);
      if (matchedTenant) {
        targetPhone = matchedTenant.phone.replace(/\s+/g, '');
      }
    }

    const pseudoEmail = `${targetPhone}.${resolvedScopeId}@locataire.ztefu.com`;
    
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: pseudoEmail,
      password: code,
    });

    if (error) {
      console.error("Tenant login error:", error.message);
      return { error: "Numéro de téléphone ou code d'accès incorrect." };
    }
  } else {
    return { error: "Type de connexion invalide." };
  }
  
  redirect("/portal/dashboard");
}


export async function debugTenantSession() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'No user' };
  const adminClient = createAdminClient();
  const { data: tenant } = await adminClient.from('tenants').select('*').eq('auth_id', user.id).single();
  return { user: user.id, tenant };
}
