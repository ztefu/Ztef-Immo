// src/lib/mock-data.ts

export type PropertyStatus = "Actif" | "En maintenance" | "Inactif";
export type UnitStatus = "Occupé" | "Vacant" | "Réservé" | "Maintenance";
export type LeaseStatus = "Actif" | "Expire bientôt" | "Expiré" | "Résilié";
export type PaymentStatus = "Payé" | "En attente" | "En retard" | "Partiellement payé" | "Annulé";

export interface Agency {
  id: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
}

export interface Owner {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  managementType: "Déléguée" | "Autonome";
  commissionRate: number; // Percentage (0-100)
  joinDate: string;
  agencyId?: string;
  authId?: string;
  slug?: string;
  logoUrl?: string;
}

export interface Property {
  id: string;
  name: string;
  type: string;
  address: string;
  city: string;
  neighborhood: string;
  ownerId: string;
  owner: string; // Keeps name for backward compatibility in some components
  status: PropertyStatus;
  description?: string;
  imageUrl?: string;
  area?: number; // m2
  agencyId?: string;
}

export interface Unit {
  id: string;
  propertyId: string;
  reference: string;
  type: string;
  bedrooms: number;
  floor: string;
  rent: number; // FCFA
  deposit: number; // FCFA
  status: UnitStatus;
  tenantId?: string | null;
  description?: string;
  agencyId?: string;
}

export interface Payment {
  id: string;
  tenantId: string;
  month: string;
  amountDue: number;
  amountPaid: number;
  date: string;
  status: "Payé" | "En retard" | "Partiellement payé" | "En attente";
  receiptUrl?: string;
  paymentMethod?: "Espèces" | "Virement" | "Mobile Money";
  agencyId?: string;
  created_at?: string;
}

export interface Tenant {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  idCardReference: string;
  unitId?: string;
  
  // Contract / Lease details
  entryDate: string; // Keeps backwards compatibility
  leaseType?: "Habitation" | "Commercial" | "Meublé";
  leaseStartDate?: string;
  leaseEndDate?: string;
  leaseStatus?: "Brouillon" | "En attente" | "Actif" | "Terminé" | "Suspendu" | "Ancien";

  rentAmount: number;
  depositAmount: number;
  notes?: string;
  status: "À jour" | "En retard" | "Incomplet";
  payments?: Payment[];
  agencyId?: string;
  authId?: string;
  contractUrl?: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: "Nouveau" | "En cours" | "Résolu" | "Annulé";
  priority: "Basse" | "Moyenne" | "Haute" | "Urgente";
  category: "Plomberie" | "Électricité" | "Menuiserie" | "Gros œuvre" | "Autre";
  createdAt: string;
  propertyId?: string;
  unitId?: string;
  tenantId?: string;
  cost?: number;
  agencyId?: string;
}

// ------------------------------
// MOCK DATA
// ------------------------------

export const MOCK_OWNERS: Owner[] = [
  {
    id: "owner_1",
    fullName: "Dr. Kamga",
    phone: "+237 6 55 44 33 22",
    email: "kamga@example.com",
    address: "Yaoundé, Cameroun",
    managementType: "Déléguée",
    commissionRate: 10,
    joinDate: "2023-01-15",
  },
  {
    id: "owner_2",
    fullName: "Mme. Eto'o",
    phone: "+237 6 99 88 77 66",
    email: "etoo@example.com",
    address: "Douala, Cameroun",
    managementType: "Autonome",
    commissionRate: 0,
    joinDate: "2022-11-20",
  },
  {
    id: "owner_3",
    fullName: "S.A. Kribi Invest",
    phone: "+237 6 77 66 55 44",
    email: "contact@kribi-invest.cm",
    address: "Kribi, Cameroun",
    managementType: "Déléguée",
    commissionRate: 8,
    joinDate: "2023-05-10",
  }
];

export const MOCK_PROPERTIES: Property[] = [
  {
    id: "prop_1",
    name: "Immeuble La Grâce",
    type: "Immeuble Résidentiel",
    address: "Rue des manguiers",
    city: "Yaoundé",
    neighborhood: "Bastos",
    ownerId: "owner_1",
    owner: "Dr. Kamga",
    status: "Actif",
    description: "Immeuble de haut standing au coeur de Bastos.",
    imageUrl: "/mock-prop-1.jpg",
    area: 500,
  },
  {
    id: "prop_2",
    name: "Résidence Les Palmiers",
    type: "Résidence",
    address: "Boulevard de la liberté",
    city: "Douala",
    neighborhood: "Bonamoussadi",
    ownerId: "owner_2",
    owner: "Mme. Eto'o",
    status: "Actif",
    description: "Résidence sécurisée avec piscine et parking.",
    imageUrl: "/mock-prop-2.jpg",
    area: 1200,
  },
  {
    id: "prop_3",
    name: "Villa Océane",
    type: "Villa",
    address: "Route de la plage",
    city: "Kribi",
    neighborhood: "Mboa Manga",
    ownerId: "owner_3",
    owner: "S.A. Kribi Invest",
    status: "Actif",
    description: "Belle villa en bordure de mer.",
    imageUrl: "/mock-prop-3.jpg",
    area: 300,
  },
];

export const MOCK_TENANTS: Tenant[] = [
  {
    id: "tenant_1",
    fullName: "Alice Ndongo",
    phone: "+237 699 00 11 22",
    email: "alice.ndongo@example.com",
    address: "Yaoundé",
    idCardReference: "CNI-10293847",
    unitId: "unit_1",
    entryDate: "15 Janvier 2024",
    rentAmount: 150000,
    depositAmount: 300000,
    status: "À jour",
  },
  {
    id: "tenant_2",
    fullName: "Marc Eto'o",
    phone: "+237 677 88 99 00",
    email: "marc.etoo@example.com",
    address: "Douala",
    idCardReference: "CNI-56473829",
    unitId: "unit_4",
    entryDate: "01 Mars 2025",
    rentAmount: 200000,
    depositAmount: 400000,
    status: "En retard",
  },
  {
    id: "tenant_3",
    fullName: "Sophie Biloa",
    phone: "+237 655 44 33 22",
    email: "sophie.biloa@example.com",
    address: "Yaoundé",
    idCardReference: "CNI-99887766",
    unitId: "unit_2",
    entryDate: "10 Novembre 2023",
    rentAmount: 175000,
    depositAmount: 350000,
    status: "À jour",
  }
];

export const MOCK_PAYMENTS: Payment[] = [
  { id: "pay_1", tenantId: "tenant_1", month: "Août 2026", amountDue: 150000, amountPaid: 150000, date: "02 Août 2026", status: "Payé", paymentMethod: "Mobile Money" },
  { id: "pay_2", tenantId: "tenant_1", month: "Juillet 2026", amountDue: 150000, amountPaid: 150000, date: "05 Juillet 2026", status: "Payé", paymentMethod: "Virement" },
  { id: "pay_3", tenantId: "tenant_1", month: "Juin 2026", amountDue: 150000, amountPaid: 150000, date: "01 Juin 2026", status: "Payé", paymentMethod: "Espèces" },
  
  { id: "pay_4", tenantId: "tenant_2", month: "Août 2026", amountDue: 200000, amountPaid: 50000, date: "10 Août 2026", status: "Partiellement payé", paymentMethod: "Espèces" },
  { id: "pay_5", tenantId: "tenant_2", month: "Juillet 2026", amountDue: 200000, amountPaid: 200000, date: "10 Juillet 2026", status: "Payé", paymentMethod: "Virement" },
  
  { id: "pay_6", tenantId: "tenant_3", month: "Août 2026", amountDue: 175000, amountPaid: 175000, date: "03 Août 2026", status: "Payé", paymentMethod: "Mobile Money" }
];

export const MOCK_TICKETS: Ticket[] = [
  {
    id: "ticket_1",
    title: "Fuite d'eau sous l'évier",
    description: "Le tuyau d'évacuation de l'évier de la cuisine fuit abondamment. Nécessite une intervention rapide pour éviter un dégât des eaux.",
    status: "Nouveau",
    priority: "Urgente",
    category: "Plomberie",
    createdAt: "2026-08-10T10:00:00Z",
    tenantId: "tenant_1",
    unitId: "unit_1",
    propertyId: "prop_1"
  },
  {
    id: "ticket_2",
    title: "Prise électrique défectueuse",
    description: "La prise du salon fait des étincelles lors du branchement.",
    status: "En cours",
    priority: "Haute",
    category: "Électricité",
    createdAt: "2026-08-08T14:30:00Z",
    tenantId: "tenant_2",
    unitId: "unit_4",
    propertyId: "prop_2",
    cost: 15000
  },
  {
    id: "ticket_3",
    title: "Porte d'entrée qui coince",
    description: "La porte principale frotte contre le sol et devient difficile à fermer.",
    status: "Résolu",
    priority: "Moyenne",
    category: "Menuiserie",
    createdAt: "2026-07-25T09:15:00Z",
    tenantId: "tenant_3",
    unitId: "unit_2",
    propertyId: "prop_1",
    cost: 8000
  }
];

export const MOCK_UNITS: Unit[] = [
  {
    id: "unit_1",
    propertyId: "prop_1",
    reference: "A01",
    type: "Appartement",
    bedrooms: 2,
    floor: "RDC",
    rent: 150000,
    deposit: 300000,
    status: "Occupé",
    tenantId: "tenant_1",
  },
  {
    id: "unit_2",
    propertyId: "prop_1",
    reference: "A02",
    type: "Appartement",
    bedrooms: 3,
    floor: "RDC",
    rent: 175000,
    deposit: 350000,
    status: "Occupé",
    tenantId: "tenant_3",
  },
  {
    id: "unit_3",
    propertyId: "prop_1",
    reference: "A03",
    type: "Studio",
    bedrooms: 1,
    floor: "1er Étage",
    rent: 175000,
    deposit: 180000,
    status: "Vacant",
    tenantId: null,
  },
  {
    id: "unit_4",
    propertyId: "prop_2",
    reference: "B01",
    type: "Appartement",
    bedrooms: 4,
    floor: "2ème Étage",
    rent: 120000,
    deposit: 400000,
    status: "Occupé",
    tenantId: "tenant_2",
  },
  {
    id: "unit_5",
    propertyId: "prop_2",
    reference: "B02",
    type: "Studio",
    bedrooms: 1,
    floor: "RDC",
    rent: 200000,
    deposit: 200000,
    status: "Maintenance",
    tenantId: null,
  },
  {
    id: "unit_6",
    propertyId: "prop_3",
    reference: "V01",
    type: "Villa entière",
    bedrooms: 5,
    floor: "RDC + 1",
    rent: 500000,
    deposit: 1000000,
    status: "Vacant",
    tenantId: null,
  }
];

// ------------------------------
// HELPER FUNCTIONS
// ------------------------------

export function getPropertyUnits(propertyId: string): Unit[] {
  return MOCK_UNITS.filter(u => u.propertyId === propertyId);
}

export function getUnitTenant(unitId: string): Tenant | undefined {
  return MOCK_TENANTS.find(t => t.unitId === unitId);
}

export function getTenantPayments(tenantId: string): Payment[] {
  return MOCK_PAYMENTS.filter(p => p.tenantId === tenantId).sort((a, b) => {
    const parseDate = (d: string) => {
      const parts = d.split(' ');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const months: Record<string, number> = { "Janvier": 0, "Février": 1, "Mars": 2, "Avril": 3, "Mai": 4, "Juin": 5, "Juillet": 6, "Août": 7, "Septembre": 8, "Octobre": 9, "Novembre": 10, "Décembre": 11 };
        const month = months[parts[1]] || 0;
        const year = parseInt(parts[2], 10);
        return new Date(year, month, day).getTime();
      }
      return 0;
    };
    return parseDate(b.date) - parseDate(a.date);
  });
}

export function addPayment(payment: Payment) {
  (payment as any).isNew = true;
  MOCK_PAYMENTS.unshift(payment);
  setTimeout(() => { (payment as any).isNew = false; }, 10000);
  
  // Update tenant global status
  const tenant = MOCK_TENANTS.find(t => t.id === payment.tenantId);
  if (tenant) {
    if (payment.status === "Payé") tenant.status = "À jour";
    else tenant.status = "En retard";
  }
}

export function getPropertyStats(propertyId: string) {
  const units = getPropertyUnits(propertyId);
  const total = units.length;
  const occupied = units.filter(u => u.status === "Occupé").length;
  const vacant = units.filter(u => u.status === "Vacant").length;
  const maintenance = units.filter(u => u.status === "Maintenance").length;
  const expectedRent = units.reduce((sum, u) => sum + (u.status === "Occupé" ? u.rent : 0), 0);
  
  return { total, occupied, vacant, maintenance, expectedRent };
}

export function addProperty(property: any) {
  property.isNew = true;
  MOCK_PROPERTIES.unshift(property);
  setTimeout(() => { property.isNew = false; }, 10000);
}

export function updateProperty(id: string, updates: any) {
  const index = MOCK_PROPERTIES.findIndex(p => p.id === id);
  if (index !== -1) {
    MOCK_PROPERTIES[index] = { ...MOCK_PROPERTIES[index], ...updates };
  }
}

export function deleteProperty(id: string) {
  const index = MOCK_PROPERTIES.findIndex(p => p.id === id);
  if (index !== -1) MOCK_PROPERTIES.splice(index, 1);
}

export function addUnit(unit: any) {
  unit.isNew = true;
  MOCK_UNITS.unshift(unit);
  setTimeout(() => { unit.isNew = false; }, 10000);
}

export function updateUnit(id: string, updates: any) {
  const index = MOCK_UNITS.findIndex(u => u.id === id);
  if (index !== -1) {
    MOCK_UNITS[index] = { ...MOCK_UNITS[index], ...updates };
  }
}

export function deleteUnit(id: string) {
  const index = MOCK_UNITS.findIndex(u => u.id === id);
  if (index !== -1) MOCK_UNITS.splice(index, 1);
}

export function addTenant(tenant: any) {
  tenant.isNew = true;
  MOCK_TENANTS.unshift(tenant);
  setTimeout(() => { tenant.isNew = false; }, 10000);
  if (tenant.unitId) {
    const unitIndex = MOCK_UNITS.findIndex(u => u.id === tenant.unitId);
    if (unitIndex !== -1) {
      MOCK_UNITS[unitIndex].status = "Occupé";
      MOCK_UNITS[unitIndex].tenantId = tenant.id;
    }
  }
}

export function updateTenant(id: string, updates: any) {
  const index = MOCK_TENANTS.findIndex(t => t.id === id);
  if (index !== -1) {
    const oldUnitId = MOCK_TENANTS[index].unitId;
    MOCK_TENANTS[index] = { ...MOCK_TENANTS[index], ...updates };
    const newUnitId = MOCK_TENANTS[index].unitId;
    
    if (oldUnitId && oldUnitId !== newUnitId) {
      const oldIndex = MOCK_UNITS.findIndex(u => u.id === oldUnitId);
      if (oldIndex !== -1) {
        MOCK_UNITS[oldIndex].status = "Vacant";
        MOCK_UNITS[oldIndex].tenantId = null;
      }
    }
    if (newUnitId && oldUnitId !== newUnitId) {
      const newIndex = MOCK_UNITS.findIndex(u => u.id === newUnitId);
      if (newIndex !== -1) {
        MOCK_UNITS[newIndex].status = "Occupé";
        MOCK_UNITS[newIndex].tenantId = id;
      }
    }
  }
}

export function deleteTenant(id: string) {
  const index = MOCK_TENANTS.findIndex(t => t.id === id);
  if (index !== -1) {
    const unitId = MOCK_TENANTS[index].unitId;
    if (unitId) {
      const unitIndex = MOCK_UNITS.findIndex(u => u.id === unitId);
      if (unitIndex !== -1) {
        MOCK_UNITS[unitIndex].status = "Vacant";
        MOCK_UNITS[unitIndex].tenantId = null;
      }
    }
    MOCK_TENANTS.splice(index, 1);
  }
}

// Ensure exactly 32 units for data consistency with dashboard
const firstNamesGen = ["Paul", "Pierre", "Lucie", "Jacques", "Charles", "Henri", "Michel", "Sarah", "Jeanne", "Louis", "David", "Thomas", "Laura", "Julie", "Claire", "Antoine", "Céline", "Victor", "Emilie", "Martin", "François", "Nicolas", "Alain", "Béatrice", "Carole", "Denis", "Elodie"];
const lastNamesGen = ["Mvogo", "Kengne", "Kamdem", "Njoya", "Essomba", "Biya", "Fotsing", "Tchoungui", "Abouna", "Ndam", "Awono", "Zambo", "Mbia", "Onana", "Nguema", "Mba", "Ndi", "Ondoa", "Nkoulou", "Njie", "Ndip", "Ngu", "Fosso", "Fotso", "Nga", "Beti", "Eyenga"];

let generatedTenantCounter = 4;
let generatedPaymentCounter = 10;

for (let i = 4; i <= 21; i++) {
  const isOccupied = i < 20;
  const unitId = `unit_1_${i}`;
  const tenantId = isOccupied ? `tenant_gen_${generatedTenantCounter}` : null;
  
  MOCK_UNITS.push({
    id: unitId,
    propertyId: "prop_1",
    reference: `A${i < 10 ? '0'+i : i}`,
    type: "Appartement",
    bedrooms: 2,
    floor: "Étage " + Math.ceil(i/3),
    rent: 150000,
    deposit: 300000,
    status: isOccupied ? "Occupé" : "Vacant",
    tenantId: tenantId
  });

  if (isOccupied) {
    MOCK_TENANTS.push({
      id: tenantId!,
      fullName: `${firstNamesGen[generatedTenantCounter % firstNamesGen.length]} ${lastNamesGen[generatedTenantCounter % lastNamesGen.length]}`,
      phone: `+237 6${Math.floor(Math.random() * 90000000 + 10000000)}`,
      email: `tenant${generatedTenantCounter}@example.com`,
      address: "Yaoundé",
      idCardReference: `CNI-${Math.floor(Math.random() * 90000000)}`,
      unitId: unitId,
      entryDate: "10 Janvier 2024",
      rentAmount: 150000,
      depositAmount: 300000,
      status: "À jour",
    });

    MOCK_PAYMENTS.push({
      id: `pay_gen_${generatedPaymentCounter++}`,
      tenantId: tenantId!,
      month: "Août 2026",
      amountDue: 150000,
      amountPaid: 150000,
      date: `05 Août 2026`,
      status: "Payé",
      paymentMethod: "Mobile Money"
    });

    generatedTenantCounter++;
  }
}

for (let i = 3; i <= 9; i++) {
  const unitId = `unit_2_${i}`;
  const tenantId = `tenant_gen_${generatedTenantCounter}`;
  
  MOCK_UNITS.push({
    id: unitId,
    propertyId: "prop_2",
    reference: `B${i < 10 ? '0'+i : i}`,
    type: "Appartement",
    bedrooms: 3,
    floor: "Étage " + Math.ceil(i/2),
    rent: 200000,
    deposit: 400000,
    status: "Occupé",
    tenantId: tenantId
  });

  MOCK_TENANTS.push({
    id: tenantId,
    fullName: `${firstNamesGen[generatedTenantCounter % firstNamesGen.length]} ${lastNamesGen[generatedTenantCounter % lastNamesGen.length]}`,
    phone: `+237 6${Math.floor(Math.random() * 90000000 + 10000000)}`,
    email: `tenant${generatedTenantCounter}@example.com`,
    address: "Douala",
    idCardReference: `CNI-${Math.floor(Math.random() * 90000000)}`,
    unitId: unitId,
    entryDate: "15 Février 2025",
    rentAmount: 200000,
    depositAmount: 400000,
    status: "À jour",
  });

  MOCK_PAYMENTS.push({
    id: `pay_gen_${generatedPaymentCounter++}`,
    tenantId: tenantId,
    month: "Août 2026",
    amountDue: 200000,
    amountPaid: 200000,
    date: `02 Août 2026`,
    status: "Payé",
    paymentMethod: "Virement"
  });

  generatedTenantCounter++;
}

{
  const unitId = "unit_3_1";
  const tenantId = `tenant_gen_${generatedTenantCounter}`;

  MOCK_UNITS.push({
    id: unitId,
    propertyId: "prop_3",
    reference: "V02",
    type: "Dépendance",
    bedrooms: 1,
    floor: "RDC",
    rent: 80000,
    deposit: 160000,
    status: "Occupé",
    tenantId: tenantId
  });

  MOCK_TENANTS.push({
    id: tenantId,
    fullName: `${firstNamesGen[generatedTenantCounter % firstNamesGen.length]} ${lastNamesGen[generatedTenantCounter % lastNamesGen.length]}`,
    phone: `+237 6${Math.floor(Math.random() * 90000000 + 10000000)}`,
    email: `tenant${generatedTenantCounter}@example.com`,
    address: "Kribi",
    idCardReference: `CNI-${Math.floor(Math.random() * 90000000)}`,
    unitId: unitId,
    entryDate: "20 Mars 2026",
    rentAmount: 80000,
    depositAmount: 160000,
    status: "À jour",
  });

  MOCK_PAYMENTS.push({
    id: `pay_gen_${generatedPaymentCounter++}`,
    tenantId: tenantId,
    month: "Août 2026",
    amountDue: 80000,
    amountPaid: 80000,
    date: `08 Août 2026`,
    status: "Payé",
    paymentMethod: "Espèces"
  });
}

// ------------------------------
// OWNER CRUD
// ------------------------------

export function getOwnerProperties(ownerId: string) {
  return MOCK_PROPERTIES.filter(p => p.ownerId === ownerId);
}

export function getOwnerStats(ownerId: string) {
  const properties = getOwnerProperties(ownerId);
  let totalUnits = 0;
  let occupiedUnits = 0;
  let totalRentCollected = 0;
  
  properties.forEach(p => {
    const units = getPropertyUnits(p.id);
    totalUnits += units.length;
    
    units.forEach(u => {
      if (u.status === "Occupé") {
        occupiedUnits++;
        totalRentCollected += u.rent || 0; // Simple approximation for now
      }
    });
  });
  
  return {
    propertyCount: properties.length,
    totalUnits,
    occupiedUnits,
    totalRentCollected
  };
}

export function addOwner(owner: Owner) {
  (owner as any).isNew = true;
  MOCK_OWNERS.unshift(owner);
  setTimeout(() => { (owner as any).isNew = false; }, 10000);
}

export function updateOwner(id: string, updates: Partial<Owner>) {
  const index = MOCK_OWNERS.findIndex(o => o.id === id);
  if (index !== -1) {
    MOCK_OWNERS[index] = { ...MOCK_OWNERS[index], ...updates };
  }
}

export function deleteOwner(id: string) {
  const index = MOCK_OWNERS.findIndex(o => o.id === id);
  if (index !== -1) {
    MOCK_OWNERS.splice(index, 1);
    
    // Unlink properties
    MOCK_PROPERTIES.forEach(p => {
      if (p.ownerId === id) {
        p.ownerId = "";
        p.owner = "Propriétaire supprimé";
      }
    });
  }
}

// ------------------------------
// MAINTENANCE / TICKETS CRUD
// ------------------------------

export function addTicket(ticket: Ticket) {
  (ticket as any).isNew = true;
  MOCK_TICKETS.unshift(ticket);
  setTimeout(() => { (ticket as any).isNew = false; }, 10000);
}

export function updateTicket(id: string, updates: Partial<Ticket>) {
  const index = MOCK_TICKETS.findIndex(t => t.id === id);
  if (index !== -1) {
    MOCK_TICKETS[index] = { ...MOCK_TICKETS[index], ...updates };
  }
}

export function deleteTicket(id: string) {
  const index = MOCK_TICKETS.findIndex(t => t.id === id);
  if (index !== -1) MOCK_TICKETS.splice(index, 1);
}
