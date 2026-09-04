// @ts-nocheck
'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';
import { PaymentSchema, TenantSchema, PropertySchema, UnitSchema, OwnerSchema, TicketSchema } from './validations';

import { Owner, Property, Unit, Tenant, Payment, Ticket, Agency } from './mock-data';

// Types - Assuming they mirror mock-data types for compatibility, 
// though camelCase in JS needs to map to snake_case in DB sometimes.

function mapAgency(db: any): Agency {
  return {
    id: db.id,
    name: db.name,
    slug: db.slug,
    logoUrl: db.logo_url,
    contactEmail: db.contact_email,
    contactPhone: db.contact_phone,
    address: db.address,
    tenantAccessCode: db.tenant_access_code
  };
}
import { unstable_noStore as noStore } from 'next/cache';

export async function getCurrentAgency(providedUserId?: string) {
  noStore();
  let userId = providedUserId;
  
  const supabase = await createClient();
  if (!userId) {
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id;
  }
  
  if (!userId) return null;

  // 1. Check if user is a tenant
  const { data: tenant } = await supabase.from('tenants').select('agency_id').eq('auth_id', userId).single();
  let agencyId = tenant?.agency_id;

  // 2. If not a tenant, check if user is an agency manager
  if (!agencyId) {
    const { data: agencyUser } = await supabase.from('agency_users').select('agency_id').eq('user_id', userId).single();
    agencyId = agencyUser?.agency_id;
  }

  // 3. If not an agency manager, check if user is an autonomous owner
  if (!agencyId) {
    const { data: owner } = await supabase.from('owners').select('id, full_name, email, phone, address, slug, management_type, tenant_access_code').eq('auth_id', userId).single();
    if (owner && owner.management_type === 'Autonome') {
      // Return a "virtual agency" object representing the autonomous owner's context
      return {
        id: owner.id,
        name: owner.full_name,
        slug: owner.slug,
        isVirtual: true,
        logoUrl: undefined,
        contactEmail: owner.email,
        contactPhone: owner.phone,
        address: owner.address,
        tenantAccessCode: owner.tenant_access_code,
        _isOwner: true, // Internal flag to distinguish from real agencies
      } as Agency & { _isOwner?: boolean };
    }
    console.log('getCurrentAgency: no role found for user');
    return null;
  }

  const { data, error } = await supabase.from('agencies').select('*').eq('id', agencyId).single();
  if (error) { console.log('getCurrentAgency: error fetching agency', error); return null; }

  console.log('getCurrentAgency returning:', mapAgency(data));
  return mapAgency(data);
}

/**
 * Returns the management context for the currently logged-in user.
 * Used by mutation functions (addTenant, addPayment, etc.) to know 
 * whether to scope data to an agency or an autonomous owner.
 */
export async function getManagerContext(userId: string): Promise<{ type: 'agency'; agencyId: string } | { type: 'owner'; ownerId: string } | null> {
  const supabase = await createClient();

  // 1. Check agency_users
  const { data: agencyUser } = await supabase.from('agency_users').select('agency_id').eq('user_id', userId).single();
  if (agencyUser?.agency_id) {
    return { type: 'agency', agencyId: agencyUser.agency_id };
  }

  // 2. Check owners (autonomous)
  const { data: owner } = await supabase.from('owners').select('id, management_type').eq('auth_id', userId).single();
  if (owner && owner.management_type === 'Autonome') {
    return { type: 'owner', ownerId: owner.id };
  }

  // 3. Check if user is a tenant — route them through their agency or owner context
  const { data: tenant } = await supabase.from('tenants').select('agency_id, unit_id').eq('auth_id', userId).single();
  if (tenant) {
    if (tenant.agency_id) {
      return { type: 'agency', agencyId: tenant.agency_id };
    } else if (tenant.unit_id) {
      const { data: unit } = await supabase.from('units').select('property_id').eq('id', tenant.unit_id).single();
      if (unit?.property_id) {
        const { data: property } = await supabase.from('properties').select('owner_id').eq('id', unit.property_id).single();
        if (property?.owner_id) {
          return { type: 'owner', ownerId: property.owner_id };
        }
      }
    }
  }

  return null;
}

/**
 * Fetch a single tenant directly by their Supabase auth ID.
 * Used by the portal to load the current tenant's profile without going through getManagerContext.
 */
export async function getTenantByAuthId(authId: string): Promise<Tenant | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tenants').select('*').eq('auth_id', authId).single();
  if (error || !data) return null;
  return mapTenant(data);
}

import { revalidatePath } from 'next/cache';

export async function updateAgency(id: string, updates: any) {
  const supabase = await createClient();
  const dbUpdates: any = {};
  if (updates.name) {
    dbUpdates.name = updates.name;
    dbUpdates.slug = updates.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  if (updates.logoUrl) dbUpdates.logo_url = updates.logoUrl;
  if (updates.contactEmail) dbUpdates.contact_email = updates.contactEmail;
  if (updates.contactPhone) dbUpdates.contact_phone = updates.contactPhone;
  if (updates.address) dbUpdates.address = updates.address;
  if (updates.themeColor) dbUpdates.theme_color = updates.themeColor;
  if (updates.language) dbUpdates.language = updates.language;
  if (updates.tenantAccessCode !== undefined) dbUpdates.tenant_access_code = updates.tenantAccessCode;

  const { data, error } = await supabase.from('agencies').update(dbUpdates).eq('id', id).select().single();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  
  // Mass password updates have been removed since each tenant now has a unique access code.

  revalidatePath('/', 'layout');
  return mapAgency(data);
}

export async function getAgencyById(idOrSlug: string) {
  const supabase = await createClient();
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
  
  if (isUUID) {
    const { data, error } = await supabase.from('agencies').select('*').eq('id', idOrSlug).single();
    if (error || !data) return null;
    return mapAgency(data);
  } else {
    // If it's a slug, we need to query by slug. But first the slug column must exist in the DB!
    const { data, error } = await supabase.from('agencies').select('*').eq('slug', idOrSlug).single();
    if (error || !data) return null;
    return mapAgency(data);
  }
}

export async function getOwnerBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('owners').select('*').eq('slug', slug).single();
  if (error || !data) return null;
  return mapOwner(data);
}

export async function getProperties() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const context = await getManagerContext(user.id);
  if (!context) {
    // Fallback for tenant with no agency_id (autonomous owner's tenant)
    const { data: tenantRow } = await supabase.from('tenants').select('unit_id').eq('auth_id', user.id).single();
    if (tenantRow?.unit_id) {
      const { data: unitRow } = await supabase.from('units').select('property_id').eq('id', tenantRow.unit_id).single();
      if (unitRow?.property_id) {
        const { data } = await supabase.from('properties').select('*').eq('id', unitRow.property_id);
        return (data || []).map(mapProperty);
      }
    }
    return [];
  }
  
  let query = supabase.from('properties').select('*').order('created_at', { ascending: false });
  
  if (context.type === 'agency') {
    query = query.eq('agency_id', context.agencyId);
  } else {
    query = query.eq('owner_id', context.ownerId);
  }

  const { data, error } = await query;
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  return (data || []).map(mapProperty);
}

export async function getProperty(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  return mapProperty(data);
}

export async function getPropertyUnits(propertyId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('units').select('*').eq('property_id', propertyId);
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  return (data || []).map(mapUnit);
}

export async function getUnitTenant(unitId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('tenants').select('*').eq('unit_id', unitId).single();
  if (error && error.code !== 'PGRST116') { console.error(error); throw new Error("Une erreur interne est survenue."); } // Ignore not found
  return data ? mapTenant(data) : undefined;
}

export async function getTenantPayments(tenantId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('tenant_id', tenantId)
    .order('date', { ascending: false });
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  return (data || []).map(mapPayment);
}

export async function addPayment(payment: any) {
  const validatedData = PaymentSchema.parse(payment);
  payment = { ...payment, ...validatedData };
  const supabase = await createClient();
  const { id, isNew, ...rest } = payment;
  
  // Fetch tenant to get agency_id
  const { data: tenant } = await supabase.from('tenants').select('agency_id').eq('id', rest.tenantId).single();
  
  const dbPayment = {
    tenant_id: rest.tenantId,
    agency_id: tenant?.agency_id || null,
    month: rest.month,
    amount_due: rest.amountDue,
    amount_paid: rest.amountPaid,
    date: rest.date,
    status: rest.status,
    payment_method: rest.paymentMethod,
    receipt_url: rest.receiptUrl,
  };
  const { data, error } = await supabase.from('payments').insert([dbPayment]).select().single();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  
  // Update tenant global status
  if (rest.status === 'Payé' || rest.status === 'En retard') {
    await supabase.from('tenants').update({ status: rest.status === 'Payé' ? 'À jour' : 'En retard' }).eq('id', rest.tenantId);
  }
  
  // Force removal of agency_id if it was automatically added by a DB trigger for an autonomous owner
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const context = await getManagerContext(user.id);
    if (context?.type === 'owner' && data.agency_id) {
      const { data: fixedData } = await supabase.from('payments').update({ agency_id: null }).eq('id', data.id).select().single();
      if (fixedData) return mapPayment(fixedData);
    }
  }

  return mapPayment(data);
}

export async function getPropertyStats(propertyId: string) {
  const units = await getPropertyUnits(propertyId);
  const total = units.length;
  const occupied = units.filter(u => u.status === "Occupé").length;
  const vacant = units.filter(u => u.status === "Vacant").length;
  const maintenance = units.filter(u => u.status === "Maintenance").length;
  const expectedRent = units.reduce((sum, u) => sum + (u.status === "Occupé" ? u.rent : 0), 0);
  
  return { total, occupied, vacant, maintenance, expectedRent };
}

// Mappers to convert DB snake_case to app camelCase
function mapProperty(db: any): Property {
  return {
    id: db.id,
    name: db.name,
    type: db.type,
    address: db.address,
    city: db.city,
    neighborhood: db.neighborhood,
    ownerId: db.owner_id,
    owner: db.owner_name,
    status: db.status,
    description: db.description,
    imageUrl: db.image_url,
    area: db.area,
    agencyId: db.agency_id,
  };
}

function mapUnit(db: any): Unit {
  return {
    id: db.id,
    propertyId: db.property_id,
    reference: db.reference,
    type: db.type,
    bedrooms: db.bedrooms,
    floor: db.floor,
    rent: db.rent,
    deposit: db.deposit,
    status: db.status,
    tenantId: db.tenant_id,
    description: db.description,
    agencyId: db.agency_id,
  };
}

function mapTenant(db: any): Tenant {
  return {
    id: db.id,
    fullName: db.full_name,
    phone: db.phone,
    email: db.email,
    address: db.address,
    idCardReference: db.id_card_reference,
    unitId: db.unit_id,
    entryDate: db.entry_date,
    leaseType: db.lease_type,
    leaseStartDate: db.lease_start_date,
    leaseEndDate: db.lease_end_date,
    leaseStatus: db.lease_status,
    rentAmount: db.rent_amount,
    depositAmount: db.deposit_amount,
    notes: db.notes,
    status: db.status,
    agencyId: db.agency_id,
    authId: db.auth_id,
    contractUrl: db.contract_url,
    accessCode: db.access_code,
  };
}

function mapPayment(db: any): Payment {
  return {
    id: db.id,
    tenantId: db.tenant_id,
    month: db.month,
    amountDue: db.amount_due,
    amountPaid: db.amount_paid,
    date: db.date,
    status: db.status,
    receiptUrl: db.receipt_url,
    paymentMethod: db.payment_method,
    agencyId: db.agency_id,
  };
}

function mapOwner(db: any): Owner {
  return {
    id: db.id,
    fullName: db.full_name,
    phone: db.phone,
    email: db.email,
    address: db.address,
    managementType: db.management_type,
    commissionRate: db.commission_rate,
    joinDate: db.join_date,
    agencyId: db.agency_id,
    authId: db.auth_id,
    slug: db.slug,
    logoUrl: db.logo_url,
    tenantAccessCode: db.tenant_access_code,
  };
}

function mapTicket(db: any): Ticket {
  return {
    id: db.id,
    title: db.title,
    description: db.description,
    status: db.status,
    priority: db.priority,
    category: db.category,
    createdAt: db.created_at,
    propertyId: db.property_id,
    unitId: db.unit_id,
    tenantId: db.tenant_id,
    cost: db.cost,
    agencyId: db.agency_id,
  };
}

export async function getOwners() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const context = await getManagerContext(user.id);
  if (!context) return [];
  
  let query = supabase.from('owners').select('*').order('created_at', { ascending: false });
  
  if (context.type === 'agency') {
    query = query.eq('agency_id', context.agencyId).eq('management_type', 'Déléguée');
  } else {
    query = query.eq('id', context.ownerId);
  }

  const { data, error } = await query;
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  return (data || []).map(mapOwner);
}

export async function getTenants() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const context = await getManagerContext(user.id);
  if (!context) {
    // Last resort: user might be a tenant whose agency_id is NULL (autonomous owner's tenant)
    const { data: tenantRow } = await supabase.from('tenants').select('*').eq('auth_id', user.id).single();
    if (tenantRow) return [mapTenant(tenantRow)];
    return [];
  }
  
  let query = supabase.from('tenants').select('*').order('created_at', { ascending: false });
  
  if (context.type === 'agency') {
    query = query.eq('agency_id', context.agencyId);
  } else {
    const { data: properties } = await supabase.from('properties').select('id').eq('owner_id', context.ownerId);
    const propertyIds = properties?.map(p => p.id) || [];
    if (propertyIds.length === 0) return [];
    
    const { data: units } = await supabase.from('units').select('id').in('property_id', propertyIds);
    const unitIds = units?.map(u => u.id) || [];
    if (unitIds.length === 0) return [];
    
    query = query.in('unit_id', unitIds);
  }

  const { data, error } = await query;
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  return (data || []).map(mapTenant);
}

export async function getUnits() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const context = await getManagerContext(user.id);
  if (!context) {
    // Fallback for tenant with no agency_id (autonomous owner's tenant)
    const { data: tenantRow } = await supabase.from('tenants').select('unit_id').eq('auth_id', user.id).single();
    if (tenantRow?.unit_id) {
      const { data } = await supabase.from('units').select('*').eq('id', tenantRow.unit_id);
      return (data || []).map(mapUnit);
    }
    return [];
  }
  
  let query = supabase.from('units').select('*').order('created_at', { ascending: false });
  
  if (context.type === 'agency') {
    query = query.eq('agency_id', context.agencyId);
  } else {
    const { data: properties } = await supabase.from('properties').select('id').eq('owner_id', context.ownerId);
    const propertyIds = properties?.map(p => p.id) || [];
    if (propertyIds.length > 0) {
      query = query.in('property_id', propertyIds);
    } else {
      return [];
    }
  }

  const { data, error } = await query;
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  return (data || []).map(mapUnit);
}

export async function getPayments() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const context = await getManagerContext(user.id);
  if (!context) {
    // Fallback for tenant with no agency_id (autonomous owner's tenant)
    const { data: tenantRow } = await supabase.from('tenants').select('id').eq('auth_id', user.id).single();
    if (tenantRow?.id) {
      const { data } = await supabase.from('payments').select('*').eq('tenant_id', tenantRow.id).order('created_at', { ascending: false });
      return (data || []).map(mapPayment);
    }
    return [];
  }
  
  let query = supabase.from('payments').select('*').order('created_at', { ascending: false });
  
  if (context.type === 'agency') {
    query = query.eq('agency_id', context.agencyId);
  } else {
    const { data: properties } = await supabase.from('properties').select('id').eq('owner_id', context.ownerId);
    const propertyIds = properties?.map(p => p.id) || [];
    if (propertyIds.length === 0) return [];
    
    const { data: units } = await supabase.from('units').select('id').in('property_id', propertyIds);
    const unitIds = units?.map(u => u.id) || [];
    if (unitIds.length === 0) return [];

    const { data: tenants } = await supabase.from('tenants').select('id').in('unit_id', unitIds);
    const tenantIds = tenants?.map(t => t.id) || [];
    if (tenantIds.length === 0) return [];

    query = query.in('tenant_id', tenantIds);
  }

  const { data, error } = await query;
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  return (data || []).map(mapPayment);
}

export async function getNewTicketsCount() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const context = await getManagerContext(user.id);
  if (!context) return 0;
  
  let query = supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'Nouveau');
  
  if (context.type === 'agency') {
    query = query.eq('agency_id', context.agencyId);
  } else {
    // get properties of this owner to filter tickets
    const { data: properties } = await supabase.from('properties').select('id').eq('owner_id', context.ownerId);
    const propertyIds = properties?.map(p => p.id) || [];
    if (propertyIds.length > 0) {
      query = query.in('property_id', propertyIds);
    } else {
      return 0; // no properties = no tickets
    }
  }

  const { count, error } = await query;
  if (error) return 0;
  return count || 0;
}

export async function getTickets() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const context = await getManagerContext(user.id);
  if (!context) return [];
  
  let query = supabase.from('tickets').select('*').order('created_at', { ascending: false });
  
  if (context.type === 'agency') {
    query = query.eq('agency_id', context.agencyId);
  } else {
    const { data: properties } = await supabase.from('properties').select('id').eq('owner_id', context.ownerId);
    const propertyIds = properties?.map(p => p.id) || [];
    if (propertyIds.length > 0) {
      query = query.in('property_id', propertyIds);
    } else {
      return [];
    }
  }

  const { data, error } = await query;
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  return (data || []).map(mapTicket);
}

// Additional CRUD operations
export async function addProperty(property: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let agencyId = null;
  if (user) {
    const context = await getManagerContext(user.id);
    if (context?.type === 'agency') {
      agencyId = context.agencyId;
    }
  }

  const dbProperty = {
    name: property.name,
    type: property.type,
    address: property.address,
    city: property.city,
    neighborhood: property.neighborhood,
    owner_id: property.ownerId,
    owner_name: property.owner,
    status: property.status,
    description: property.description,
    image_url: property.imageUrl,
    area: property.area,
    agency_id: agencyId,
  };
  const { data, error } = await supabase.from('properties').insert([dbProperty]).select().single();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  
  // Force removal of agency_id if it was automatically added by a DB trigger for an autonomous owner
  if (!agencyId && data.agency_id) {
    const { data: fixedData } = await supabase.from('properties').update({ agency_id: null }).eq('id', data.id).select().single();
    if (fixedData) return mapProperty(fixedData);
  }

  return mapProperty(data);
}

export async function deleteProperty(id: string) {
  const supabase = await createClient();
  
  // Clean up units first to avoid foreign key constraints (if no cascade)
  const { data: units } = await supabase.from('units').select('id').eq('property_id', id);
  if (units && units.length > 0) {
    const unitIds = units.map(u => u.id);
    await supabase.from('units').delete().in('id', unitIds);
  }
  
  const { error } = await supabase.from('properties').delete().eq('id', id);
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  return true;
}

export async function updateProperty(id: string, updates: any) {
  const validatedData = PropertySchema.partial().parse(updates);
  updates = { ...updates, ...validatedData };
  const supabase = await createClient();
  const dbUpdates: any = {};
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.type) dbUpdates.type = updates.type;
  if (updates.address) dbUpdates.address = updates.address;
  if (updates.city) dbUpdates.city = updates.city;
  if (updates.neighborhood) dbUpdates.neighborhood = updates.neighborhood;
  if (updates.ownerId) dbUpdates.owner_id = updates.ownerId;
  if (updates.owner) dbUpdates.owner_name = updates.owner;
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.description) dbUpdates.description = updates.description;
  if (updates.imageUrl) dbUpdates.image_url = updates.imageUrl;
  if (updates.area !== undefined) dbUpdates.area = updates.area;

  const { data, error } = await supabase.from('properties').update(dbUpdates).eq('id', id).select().single();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }

  // Force removal of agency_id if it was automatically added by a DB trigger for an autonomous owner
  // In update we just check if it shouldn't have one
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const context = await getManagerContext(user.id);
    if (context?.type === 'owner' && data.agency_id) {
      const { data: fixedData } = await supabase.from('properties').update({ agency_id: null }).eq('id', data.id).select().single();
      if (fixedData) return mapProperty(fixedData);
    }
  }

  return mapProperty(data);
}

export async function addUnit(unit: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let agencyId = null;
  if (user) {
    const context = await getManagerContext(user.id);
    if (context?.type === 'agency') {
      agencyId = context.agencyId;
    }
  }

  const dbUnit = {
    property_id: unit.propertyId,
    reference: unit.reference,
    type: unit.type,
    bedrooms: unit.bedrooms,
    floor: unit.floor,
    rent: unit.rent,
    deposit: unit.deposit,
    status: unit.status,
    tenant_id: unit.tenantId,
    description: unit.description,
    agency_id: agencyId,
  };
  const { data, error } = await supabase.from('units').insert([dbUnit]).select().single();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  
  // Force removal of agency_id if it was automatically added by a DB trigger for an autonomous owner
  if (!agencyId && data.agency_id) {
    const { data: fixedData } = await supabase.from('units').update({ agency_id: null }).eq('id', data.id).select().single();
    if (fixedData) return mapUnit(fixedData);
  }

  return mapUnit(data);
}

export async function updateUnit(id: string, updates: any) {
  const validatedData = UnitSchema.partial().parse(updates);
  updates = { ...updates, ...validatedData };
  const supabase = await createClient();
  const dbUpdates: any = {};
  if (updates.propertyId) dbUpdates.property_id = updates.propertyId;
  if (updates.reference) dbUpdates.reference = updates.reference;
  if (updates.type) dbUpdates.type = updates.type;
  if (updates.bedrooms) dbUpdates.bedrooms = updates.bedrooms;
  if (updates.floor) dbUpdates.floor = updates.floor;
  if (updates.rent) dbUpdates.rent = updates.rent;
  if (updates.deposit) dbUpdates.deposit = updates.deposit;
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.tenantId !== undefined) dbUpdates.tenant_id = updates.tenantId;
  if (updates.description) dbUpdates.description = updates.description;

  const { data, error } = await supabase.from('units').update(dbUpdates).eq('id', id).select().single();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  return mapUnit(data);
}

export async function deleteUnit(id: string) {
  const supabase = await createClient();
  
  // Vérification de sécurité : le logement est-il occupé ?
  const { data: unitToCheck } = await supabase.from('units').select('status, tenant_id').eq('id', id).single();
  if (unitToCheck && (unitToCheck.status === 'Occupé' || unitToCheck.tenant_id !== null)) {
    throw new Error("Impossible de supprimer ce logement car un locataire y réside actuellement. Veuillez d'abord libérer le logement.");
  }
  
  const { data: deleted, error } = await supabase.from('units').delete().eq('id', id).select();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  if (!deleted || deleted.length === 0) throw new Error("Impossible de supprimer cette unité.");
}

export async function addTenant(tenant: any) {
  const validatedData = TenantSchema.parse(tenant);
  tenant = { ...tenant, ...validatedData };
  const adminClient = createAdminClient();
  const supabase = await createClient();
  
  // Get current manager's context (agency or autonomous owner)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Vous devez être connecté.");
  
  const context = await getManagerContext(user.id);
  if (!context) throw new Error("Vous n'êtes associé à aucune agence ou compte propriétaire.");
  
  const agencyId = context.type === 'agency' ? context.agencyId : null;
  const scopeId = context.type === 'agency' ? context.agencyId : context.ownerId;
  
  const accessCode = crypto.randomUUID().slice(0, 8);
  
  const cleanPhone = tenant.phone.replace(/\s+/g, '');
  const tenantDomain = process.env.TENANT_EMAIL_DOMAIN;
  if (!tenantDomain) throw new Error("Configuration manquante (TENANT_EMAIL_DOMAIN)");
  const pseudoEmail = `${cleanPhone}.${scopeId}@${tenantDomain}`;

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email: pseudoEmail,
    password: accessCode,
    email_confirm: true
  });

  if (authError) {
    console.error("Auth creation error:", authError);
    throw new Error("Impossible de créer le compte d'authentification pour le locataire.");
  }

  const dbTenant = {
    full_name: tenant.fullName,
    phone: tenant.phone,
    email: tenant.email,
    address: tenant.address,
    id_card_reference: tenant.idCardReference,
    unit_id: tenant.unitId,
    entry_date: tenant.entryDate,
    lease_type: tenant.leaseType,
    lease_start_date: tenant.leaseStartDate,
    lease_end_date: tenant.leaseEndDate,
    lease_status: tenant.leaseStatus,
    rent_amount: tenant.rentAmount,
    deposit_amount: tenant.depositAmount,
    notes: tenant.notes,
    status: tenant.status,
    auth_id: authData?.user?.id, // Link the tenant to the auth user
    agency_id: agencyId,
    access_code: accessCode, // Save the generated password
  };
  const { data, error } = await supabase.from('tenants').insert([dbTenant]).select().single();
  if (error) {
    if (authData?.user?.id) {
       await adminClient.auth.admin.deleteUser(authData.user.id); // Rollback auth user
    }
    console.error(error); throw new Error("Une erreur interne est survenue.");
  }
  if (!data) return null as any;

  if (tenant.unitId) {
    const { error: unitError } = await supabase.from('units').update({ status: 'Occupé', tenant_id: data.id }).eq('id', tenant.unitId);
    if (unitError) console.error("Error updating unit to Occupé:", unitError);
  }
  
  // Gestion des mois d'avance
  const advanceMonths = tenant.advanceMonths || 0;
  const paymentMethod = tenant.paymentMethod || "Non spécifié";
  
  if (advanceMonths > 0) {
    const entryDate = new Date(tenant.entryDate || new Date());
    const frenchMonths = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    
    const paymentsToInsert = [];
    
    for (let i = 0; i < advanceMonths; i++) {
      // Calculate the month for this iteration
      const paymentDate = new Date(entryDate.getFullYear(), entryDate.getMonth() + i, 1);
      const monthStr = `${frenchMonths[paymentDate.getMonth()]} ${paymentDate.getFullYear()}`;
      
      // Format the date string like "10 Août 2026"
      const day = entryDate.getDate().toString().padStart(2, '0');
      const dateStr = `${day} ${monthStr}`;
      
      paymentsToInsert.push({
        tenant_id: data.id,
        agency_id: agencyId, // null for autonomous owners
        month: monthStr,
        amount_due: tenant.rentAmount,
        amount_paid: tenant.rentAmount,
        date: dateStr,
        status: 'Payé',
        payment_method: paymentMethod
      });
    }
    
    if (paymentsToInsert.length > 0) {
      const { error: paymentError } = await supabase.from('payments').insert(paymentsToInsert);
      if (paymentError) console.error("Error creating advance payments:", paymentError);
    }
  }

  // Force removal of agency_id if it was automatically added by a DB trigger for an autonomous owner
  if (context.type === 'owner' && data.agency_id) {
    const { data: fixedData } = await supabase.from('tenants').update({ agency_id: null }).eq('id', data.id).select().single();
    if (fixedData) return mapTenant(fixedData);
  }

  return mapTenant(data);
}

export async function updateTenant(id: string, updates: any) {
  const validatedData = TenantSchema.partial().parse(updates);
  updates = { ...updates, ...validatedData };
  const supabase = await createClient();
  const dbUpdates: any = {};
  if (updates.fullName) dbUpdates.full_name = updates.fullName;
  if (updates.phone) dbUpdates.phone = updates.phone;
  if (updates.email) dbUpdates.email = updates.email;
  if (updates.address) dbUpdates.address = updates.address;
  if (updates.idCardReference) dbUpdates.id_card_reference = updates.idCardReference;
  if (updates.unitId !== undefined) dbUpdates.unit_id = updates.unitId;
  if (updates.entryDate) dbUpdates.entry_date = updates.entryDate;
  if (updates.leaseType) dbUpdates.lease_type = updates.leaseType;
  if (updates.leaseStartDate) dbUpdates.lease_start_date = updates.leaseStartDate;
  if (updates.leaseEndDate) dbUpdates.lease_end_date = updates.leaseEndDate;
  if (updates.leaseStatus) dbUpdates.lease_status = updates.leaseStatus;
  if (updates.rentAmount) dbUpdates.rent_amount = updates.rentAmount;
  if (updates.depositAmount) dbUpdates.deposit_amount = updates.depositAmount;
  if (updates.notes) dbUpdates.notes = updates.notes;
  if (updates.status) dbUpdates.status = updates.status;

  const { data: oldTenant } = await supabase.from('tenants').select('unit_id').eq('id', id).single();
  
  const { data, error } = await supabase.from('tenants').update(dbUpdates).eq('id', id).select().single();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }

  if (updates.status === 'Ancien' && oldTenant?.unit_id) {
    // Le bail est terminé, on libère le logement
    const { error: err1 } = await supabase.from('units').update({ status: 'Vacant', tenant_id: null }).eq('id', oldTenant.unit_id);
    if (err1) console.error("Error setting unit to Vacant:", err1);
  } else if (updates.unitId !== undefined) {
    if (oldTenant?.unit_id && oldTenant.unit_id !== updates.unitId) {
      const { error: err1 } = await supabase.from('units').update({ status: 'Vacant', tenant_id: null }).eq('id', oldTenant.unit_id);
      if (err1) console.error("Error setting old unit to Vacant:", err1);
    }
    if (updates.unitId) {
      const { error: err2 } = await supabase.from('units').update({ status: 'Occupé', tenant_id: id }).eq('id', updates.unitId);
      if (err2) console.error("Error setting new unit to Occupé:", err2);
    }
  }

  return mapTenant(data);
}

export async function deleteTenant(id: string) {
  const adminClient = createAdminClient();
  
  // 1. Get the tenant details (unit_id and auth_id)
  const { data: tenant } = await adminClient.from('tenants').select('unit_id, auth_id').eq('id', id).single();
  
  // 2. Free up the unit
  if (tenant?.unit_id) {
    await adminClient.from('units').update({ status: 'Vacant', tenant_id: null }).eq('id', tenant.unit_id);
  }
  
  // 3. Delete from tenants table
  const { data: deleted, error } = await adminClient.from('tenants').delete().eq('id', id).select();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  if (!deleted || deleted.length === 0) {
    console.error("Aucun locataire n'a été supprimé (problème de droits ou ID introuvable).");
    throw new Error("Impossible de supprimer ce locataire.");
  }

  // 4. Delete the Supabase Auth user if it exists
  if (tenant?.auth_id) {
    const { error: authError } = await adminClient.auth.admin.deleteUser(tenant.auth_id);
    if (authError) {
      console.error("Error deleting auth user:", authError);
    } else {
      console.log("Successfully deleted auth user for tenant");
    }
  }
}

export async function getOwnerProperties(ownerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from('properties').select('*').eq('owner_id', ownerId);
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  return (data || []).map(mapProperty);
}

export async function getOwnerStats(ownerId: string) {
  const properties = await getOwnerProperties(ownerId);
  let totalUnits = 0;
  let occupiedUnits = 0;
  let totalRentCollected = 0;
  
  for (const p of properties) {
    const units = await getPropertyUnits(p.id);
    totalUnits += units.length;
    
    for (const u of units) {
      if (u.status === 'Occupé') {
        occupiedUnits++;
        totalRentCollected += u.rent || 0;
      }
    }
  }
  
  return {
    propertyCount: properties.length,
    totalUnits,
    occupiedUnits,
    totalRentCollected
  };
}

export async function addOwner(owner: any) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let agencyId = null;
  if (user) {
    const context = await getManagerContext(user.id);
    if (context?.type === 'agency') {
      agencyId = context.agencyId;
    }
  }

  const dbOwner = {
    full_name: owner.fullName,
    phone: owner.phone,
    email: owner.email,
    address: owner.address,
    management_type: owner.managementType,
    commission_rate: owner.commissionRate,
    join_date: owner.joinDate,
    agency_id: agencyId,
  };
  const { data, error } = await supabase.from('owners').insert([dbOwner]).select().single();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  return mapOwner(data);
}

export async function updateOwner(id: string, updates: any) {
  const validatedData = OwnerSchema.partial().parse(updates);
  updates = { ...updates, ...validatedData };
  const supabase = await createClient();
  const dbUpdates: any = {};
  if (updates.fullName) dbUpdates.full_name = updates.fullName;
  if (updates.phone) dbUpdates.phone = updates.phone;
  if (updates.email) dbUpdates.email = updates.email;
  if (updates.address) dbUpdates.address = updates.address;
  if (updates.managementType) dbUpdates.management_type = updates.managementType;
  if (updates.commissionRate) dbUpdates.commission_rate = updates.commissionRate;
  if (updates.joinDate) dbUpdates.join_date = updates.joinDate;
  if (updates.tenantAccessCode !== undefined) dbUpdates.tenant_access_code = updates.tenantAccessCode;

  const { data, error } = await supabase.from('owners').update(dbUpdates).eq('id', id).select().single();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }

  // Mass password updates have been removed since each tenant now has a unique access code.

  return mapOwner(data);
}

export async function deleteOwner(id: string) {
  const supabase = await createClient();
  const { data: deleted, error } = await supabase.from('owners').delete().eq('id', id).select();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  if (!deleted || deleted.length === 0) throw new Error("Impossible de supprimer ce propriétaire.");
}

export async function addTicket(ticket: any) {
  const supabase = await createClient();
  
  // Fetch tenant to get agency_id if applicable
  const { data: tenant } = await supabase.from('tenants').select('agency_id').eq('id', ticket.tenantId).single();

  let propertyId = ticket.propertyId;
  if (!propertyId && ticket.unitId) {
    const { data: unit } = await supabase.from('units').select('property_id').eq('id', ticket.unitId).single();
    if (unit) propertyId = unit.property_id;
  }

  const dbTicket = {
    title: ticket.title,
    description: ticket.description,
    status: ticket.status,
    priority: ticket.priority,
    category: ticket.category,
    property_id: propertyId,
    unit_id: ticket.unitId,
    tenant_id: ticket.tenantId,
    agency_id: tenant?.agency_id || null,
    cost: ticket.cost,
  };
  const { data, error } = await supabase.from('tickets').insert([dbTicket]).select().single();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  
  // Force removal of agency_id if it was automatically added by a DB trigger for an autonomous owner
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const context = await getManagerContext(user.id);
    if (context?.type === 'owner' && data.agency_id) {
      const { data: fixedData } = await supabase.from('tickets').update({ agency_id: null }).eq('id', data.id).select().single();
      if (fixedData) return mapTicket(fixedData);
    }
  }

  return mapTicket(data);
}

export async function updateTicket(id: string, updates: any) {
  const validatedData = TicketSchema.partial().parse(updates);
  updates = { ...updates, ...validatedData };
  const supabase = await createClient();
  const dbUpdates: any = {};
  if (updates.title) dbUpdates.title = updates.title;
  if (updates.description) dbUpdates.description = updates.description;
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.priority) dbUpdates.priority = updates.priority;
  if (updates.category) dbUpdates.category = updates.category;
  if (updates.propertyId) dbUpdates.property_id = updates.propertyId;
  if (updates.unitId) dbUpdates.unit_id = updates.unitId;
  if (updates.tenantId) dbUpdates.tenant_id = updates.tenantId;
  if (updates.cost) dbUpdates.cost = updates.cost;

  const { data, error } = await supabase.from('tickets').update(dbUpdates).eq('id', id).select().single();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  return mapTicket(data);
}

export async function deleteTicket(id: string) {
  const supabase = await createClient();
  const { data: deleted, error } = await supabase.from('tickets').delete().eq('id', id).select();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  if (!deleted || deleted.length === 0) throw new Error("Impossible de supprimer ce ticket.");
}

export async function uploadContractPdf(tenantId: string, pdfBlob: Blob): Promise<string | null> {
  const supabase = await createClient();
  const fileName = `${tenantId}/contrat_bail.pdf`;
  
  // Upload to Supabase Storage 'documents' bucket
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(fileName, pdfBlob, {
      contentType: 'application/pdf',
      upsert: true, // This overwrites the existing file
    });
    
  if (error) {
    console.error('Error uploading contract PDF:', error);
    return null;
  }
  
  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName);
    
  // Add a cache-buster so the browser fetches the new version if it was overwritten
  const publicUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
  
  // Save URL in database
  const { error: updateError } = await supabase
    .from('tenants')
    .update({ contract_url: publicUrl })
    .eq('id', tenantId);
    
  if (updateError) {
    console.error('Error updating tenant with contract URL:', updateError);
    return null;
  }
  
  return publicUrl;
}

// =============================================
// DELEGATION MANAGEMENT (Propriétaire → Agence)
// =============================================

export type PropertyDelegation = {
  id: string;
  propertyId: string;
  ownerId: string;
  agencyId: string;
  status: 'En attente' | 'Acceptée' | 'Refusée' | 'Révoquée';
  createdAt: string;
  updatedAt: string;
  // Joined data
  propertyName?: string;
  ownerName?: string;
  agencyName?: string;
};

function mapDelegation(db: any): PropertyDelegation {
  return {
    id: db.id,
    propertyId: db.property_id,
    ownerId: db.owner_id,
    agencyId: db.agency_id,
    status: db.status,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    propertyName: db.properties?.name || db.property_name,
    ownerName: db.owners?.full_name || db.owner_name,
    agencyName: db.agencies?.name || db.agency_name,
  };
}

/**
 * Search for an agency by its slug (for owners to find an agency to delegate to)
 */
export async function searchAgencyBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('agencies')
    .select('id, name, slug, contact_email, contact_phone, address')
    .eq('slug', slug)
    .single();
  if (error || !data) return null;
  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    contactEmail: data.contact_email,
    contactPhone: data.contact_phone,
    address: data.address,
  };
}

/**
 * Request delegation of a property to an agency (called by owner)
 */
export async function requestDelegation(propertyId: string, agencySlug: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Vous devez être connecté.");

  // Get owner ID
  const { data: owner } = await supabase
    .from('owners')
    .select('id')
    .eq('auth_id', user.id)
    .single();
  if (!owner) throw new Error("Vous n'êtes pas un propriétaire enregistré.");

  // Find the agency by slug
  const { data: agency } = await supabase
    .from('agencies')
    .select('id, name')
    .eq('slug', agencySlug)
    .single();
  if (!agency) throw new Error("Aucune agence trouvée avec cet identifiant.");

  // Verify property belongs to this owner
  const { data: property } = await supabase
    .from('properties')
    .select('id, owner_id')
    .eq('id', propertyId)
    .eq('owner_id', owner.id)
    .single();
  if (!property) throw new Error("Cette propriété ne vous appartient pas.");

  // Check if a delegation already exists for this property+agency
  const { data: existing } = await supabase
    .from('property_delegations')
    .select('id, status')
    .eq('property_id', propertyId)
    .eq('agency_id', agency.id)
    .in('status', ['En attente', 'Acceptée'])
    .maybeSingle();
  if (existing) {
    if (existing.status === 'Acceptée') throw new Error("Cette propriété est déjà gérée par cette agence.");
    if (existing.status === 'En attente') throw new Error("Une demande est déjà en cours pour cette propriété.");
  }

  // Create the delegation request
  const { data: delegation, error } = await supabase
    .from('property_delegations')
    .insert({
      property_id: propertyId,
      owner_id: owner.id,
      agency_id: agency.id,
      status: 'En attente',
    })
    .select()
    .single();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }

  return { ...mapDelegation(delegation), agencyName: agency.name };
}

/**
 * Get all delegations visible to the current user (owner or agency)
 */
export async function getDelegations() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const context = await getManagerContext(user.id);
  if (!context) return [];

  let query = supabase
    .from('property_delegations')
    .select(`
      *,
      properties:property_id(name),
      owners:owner_id(full_name),
      agencies:agency_id(name)
    `)
    .order('created_at', { ascending: false });

  if (context.type === 'agency') {
    query = query.eq('agency_id', context.agencyId);
  } else {
    query = query.eq('owner_id', context.ownerId);
  }

  const { data, error } = await query;
  if (error) { console.error('getDelegations error:', error); return []; }
  return (data || []).map(mapDelegation);
}

/**
 * Accept a delegation request (called by agency manager)
 */
export async function acceptDelegation(delegationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('property_delegations')
    .update({ status: 'Acceptée' })
    .eq('id', delegationId)
    .eq('status', 'En attente')
    .select()
    .single();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  revalidatePath('/', 'layout');
  return mapDelegation(data);
}

/**
 * Reject a delegation request (called by agency manager)
 */
export async function rejectDelegation(delegationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('property_delegations')
    .update({ status: 'Refusée' })
    .eq('id', delegationId)
    .eq('status', 'En attente')
    .select()
    .single();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  return mapDelegation(data);
}

/**
 * Revoke a delegation (called by owner to take back control)
 */
export async function revokeDelegation(delegationId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('property_delegations')
    .update({ status: 'Révoquée' })
    .eq('id', delegationId)
    .eq('status', 'Acceptée')
    .select()
    .single();
  if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
  revalidatePath('/', 'layout');
  return mapDelegation(data);
}

/**
 * Get the active delegation for a property (if any)
 */
export async function getPropertyDelegation(propertyId: string): Promise<PropertyDelegation | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('property_delegations')
    .select(`
      *,
      agencies:agency_id(name)
    `)
    .eq('property_id', propertyId)
    .in('status', ['En attente', 'Acceptée'])
    .maybeSingle();
  if (error || !data) return null;
  return mapDelegation(data);
}

/**
 * Get count of pending delegation requests for the current agency
 */
export async function getPendingDelegationsCount(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const context = await getManagerContext(user.id);
  if (!context) return 0;
  let query = supabase
    .from('property_delegations')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'En attente');
    
  if (context.type === 'agency') {
    query = query.eq('agency_id', context.agencyId);
  } else if (context.type === 'owner') {
    query = query.eq('owner_id', context.ownerId);
  } else {
    return 0;
  }

  const { count, error } = await query;
  if (error) return 0;
  return count || 0;
}
