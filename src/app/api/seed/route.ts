import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {
  MOCK_OWNERS,
  MOCK_PROPERTIES,
  MOCK_UNITS,
  MOCK_TENANTS,
  MOCK_PAYMENTS,
  MOCK_TICKETS
} from '@/lib/mock-data';

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 403 });
  }

  const supabase = createClient();

  // Mapping old string IDs to new UUIDs
  const idMap = new Map<string, string>();

  const generateUuid = () => crypto.randomUUID();

  try {
    // 1. OWNERS
    const ownersToInsert = MOCK_OWNERS.map(owner => {
      const newId = generateUuid();
      idMap.set(owner.id, newId);
      return {
        id: newId,
        full_name: owner.fullName,
        phone: owner.phone,
        email: owner.email,
        address: owner.address,
        management_type: owner.managementType,
        commission_rate: owner.commissionRate,
        join_date: owner.joinDate,
      };
    });

    if (ownersToInsert.length > 0) {
      const { error } = await supabase.from('owners').insert(ownersToInsert);
      if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
    }

    // 2. PROPERTIES
    const propertiesToInsert = MOCK_PROPERTIES.map(prop => {
      const newId = generateUuid();
      idMap.set(prop.id, newId);
      return {
        id: newId,
        name: prop.name,
        type: prop.type,
        address: prop.address,
        city: prop.city,
        neighborhood: prop.neighborhood,
        owner_id: idMap.get(prop.ownerId) || null,
        owner_name: prop.owner,
        status: prop.status,
        description: prop.description,
        image_url: prop.imageUrl,
        area: prop.area,
      };
    });

    if (propertiesToInsert.length > 0) {
      const { error } = await supabase.from('properties').insert(propertiesToInsert);
      if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
    }

    // 3. TENANTS (Initial insert without unit_id to avoid circular dependency issues)
    const tenantsToInsert = MOCK_TENANTS.map(tenant => {
      const newId = generateUuid();
      idMap.set(tenant.id, newId);
      return {
        id: newId,
        full_name: tenant.fullName,
        phone: tenant.phone,
        email: tenant.email,
        address: tenant.address,
        id_card_reference: tenant.idCardReference,
        entry_date: tenant.entryDate,
        lease_type: tenant.leaseType,
        lease_start_date: tenant.leaseStartDate,
        lease_end_date: tenant.leaseEndDate,
        lease_status: tenant.leaseStatus,
        rent_amount: tenant.rentAmount,
        deposit_amount: tenant.depositAmount,
        notes: tenant.notes,
        status: tenant.status,
      };
    });

    if (tenantsToInsert.length > 0) {
      const { error } = await supabase.from('tenants').insert(tenantsToInsert);
      if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
    }

    // 4. UNITS
    const unitsToInsert = MOCK_UNITS.map(unit => {
      const newId = generateUuid();
      idMap.set(unit.id, newId);
      return {
        id: newId,
        property_id: idMap.get(unit.propertyId),
        reference: unit.reference,
        type: unit.type,
        bedrooms: unit.bedrooms,
        floor: unit.floor,
        rent: unit.rent,
        deposit: unit.deposit,
        status: unit.status,
        tenant_id: unit.tenantId ? idMap.get(unit.tenantId) : null,
        description: unit.description,
      };
    });

    if (unitsToInsert.length > 0) {
      const { error } = await supabase.from('units').insert(unitsToInsert);
      if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
    }

    // 5. UPDATE TENANTS WITH UNIT_ID
    for (const tenant of MOCK_TENANTS) {
      if (tenant.unitId) {
        const tenantNewId = idMap.get(tenant.id);
        const unitNewId = idMap.get(tenant.unitId);
        if (tenantNewId && unitNewId) {
          const { error } = await supabase
            .from('tenants')
            .update({ unit_id: unitNewId })
            .eq('id', tenantNewId);
          if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
        }
      }
    }

    // 6. PAYMENTS
    const paymentsToInsert = MOCK_PAYMENTS.map(pay => {
      const newId = generateUuid();
      idMap.set(pay.id, newId);
      return {
        id: newId,
        tenant_id: idMap.get(pay.tenantId),
        month: pay.month,
        amount_due: pay.amountDue,
        amount_paid: pay.amountPaid,
        date: pay.date,
        status: pay.status,
        receipt_url: pay.receiptUrl,
        payment_method: pay.paymentMethod,
      };
    });

    if (paymentsToInsert.length > 0) {
      const { error } = await supabase.from('payments').insert(paymentsToInsert);
      if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
    }

    // 7. TICKETS
    const ticketsToInsert = MOCK_TICKETS.map(ticket => {
      const newId = generateUuid();
      idMap.set(ticket.id, newId);
      return {
        id: newId,
        title: ticket.title,
        description: ticket.description,
        status: ticket.status,
        priority: ticket.priority,
        category: ticket.category,
        property_id: ticket.propertyId ? idMap.get(ticket.propertyId) : null,
        unit_id: ticket.unitId ? idMap.get(ticket.unitId) : null,
        tenant_id: ticket.tenantId ? idMap.get(ticket.tenantId) : null,
        cost: ticket.cost,
      };
    });

    if (ticketsToInsert.length > 0) {
      const { error } = await supabase.from('tickets').insert(ticketsToInsert);
      if (error) { console.error(error); throw new Error("Une erreur interne est survenue."); }
    }

    return NextResponse.json({ success: true, message: 'Data seeded successfully!' });
  } catch (error: any) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      success: false, 
      error: "Une erreur interne est survenue lors de l'initialisation des données." 
    }, { status: 500 });
  }
}
