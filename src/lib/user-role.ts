'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';
import { unstable_noStore as noStore } from 'next/cache';

export type UserRole = 
  | { type: "agency_admin"; agencyId: string; agencyName: string; agencySlug?: string }
  | { type: "owner_autonomous"; ownerId: string; ownerName: string; ownerSlug?: string }
  | { type: "tenant"; tenantId: string; agencyId?: string }
  | null;

/**
 * Determines the role of the currently authenticated user.
 * Priority: agency_admin > owner_autonomous > tenant
 */
export async function getUserRole(providedUserId?: string): Promise<UserRole> {
  noStore();
  let userId = providedUserId;

  if (!userId) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
  }

  if (!userId) return null;

  const adminClient = createAdminClient();

  // 1. Check if user is an agency admin/manager
  const { data: agencyUser } = await adminClient
    .from('agency_users')
    .select('agency_id')
    .eq('user_id', userId)
    .single();

  if (agencyUser?.agency_id) {
    const { data: agency } = await adminClient
      .from('agencies')
      .select('name, slug')
      .eq('id', agencyUser.agency_id)
      .single();

    return {
      type: "agency_admin",
      agencyId: agencyUser.agency_id,
      agencyName: agency?.name || "Agence",
      agencySlug: agency?.slug,
    };
  }

  // 2. Check if user is an autonomous owner
  const { data: owner } = await adminClient
    .from('owners')
    .select('id, full_name, slug, management_type')
    .eq('auth_id', userId)
    .single();

  if (owner && owner.management_type === 'Autonome') {
    return {
      type: "owner_autonomous",
      ownerId: owner.id,
      ownerName: owner.full_name,
      ownerSlug: owner.slug,
    };
  }

  // 3. Check if user is a tenant
  const { data: tenant } = await adminClient
    .from('tenants')
    .select('id, agency_id')
    .eq('auth_id', userId)
    .single();

  if (tenant) {
    return {
      type: "tenant",
      tenantId: tenant.id,
      agencyId: tenant.agency_id,
    };
  }

  return null;
}
