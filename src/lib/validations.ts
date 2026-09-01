import { z } from 'zod';

export const PaymentSchema = z.object({
  tenantId: z.string().uuid(),
  month: z.string().min(1).max(50),
  amountDue: z.coerce.number().nonnegative().max(100000000),
  amountPaid: z.coerce.number().nonnegative().max(100000000),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date string" }),
  status: z.enum(["Payé", "En retard", "Partiellement payé", "En attente"]),
  paymentMethod: z.enum(["Espèces", "Virement", "Mobile Money"]).optional(),
  receiptUrl: z.string().url().optional()
});

export const TenantSchema = z.object({
  fullName: z.string().min(1).max(150),
  phone: z.string().min(1).max(50),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().max(255).optional(),
  idCardReference: z.string().max(100).optional(),
  unitId: z.string().uuid().optional().nullable(),
  
  entryDate: z.string().optional(),
  leaseType: z.enum(["Habitation", "Commercial", "Meublé"]).optional(),
  leaseStartDate: z.string().optional(),
  leaseEndDate: z.string().optional(),
  leaseStatus: z.enum(["Brouillon", "En attente", "Actif", "Terminé", "Suspendu", "Ancien"]).optional(),
  
  rentAmount: z.coerce.number().nonnegative(),
  depositAmount: z.coerce.number().nonnegative(),
  notes: z.string().max(1000).optional(),
  status: z.enum(["À jour", "En retard", "Incomplet"]).default("À jour")
});

export const PropertySchema = z.object({
  name: z.string().min(1).max(150),
  type: z.string().min(1).max(100),
  address: z.string().min(1).max(255),
  city: z.string().min(1).max(100),
  neighborhood: z.string().max(100).optional(),
  ownerId: z.string().uuid(),
  status: z.enum(["Actif", "En maintenance", "Inactif"]),
  description: z.string().max(1000).optional(),
  area: z.coerce.number().positive().optional()
});

export const UnitSchema = z.object({
  propertyId: z.string().uuid(),
  reference: z.string().min(1).max(100),
  type: z.string().min(1).max(100),
  bedrooms: z.coerce.number().int().nonnegative(),
  floor: z.string().max(50).optional(),
  rent: z.coerce.number().positive(),
  deposit: z.coerce.number().nonnegative(),
  status: z.enum(["Occupé", "Vacant", "Réservé", "Maintenance"]),
  description: z.string().max(1000).optional()
});

export const OwnerSchema = z.object({
  fullName: z.string().min(1).max(150),
  phone: z.string().min(1).max(50),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().max(255).optional(),
  managementType: z.enum(["Déléguée", "Autonome"]),
  commissionRate: z.coerce.number().nonnegative().max(100)
});

export const TicketSchema = z.object({
  propertyId: z.string().uuid(),
  unitId: z.string().uuid().optional().nullable(),
  title: z.string().min(1).max(150),
  description: z.string().min(1).max(2000),
  category: z.string().max(100).optional(),
  priority: z.enum(["Basse", "Moyenne", "Haute", "Urgente"]),
  status: z.enum(["Nouveau", "En cours", "En attente", "Résolu", "Fermé"]),
  reportedBy: z.enum(["Locataire", "Propriétaire", "Agence", "Système"]).optional(),
  tenantId: z.string().uuid().optional().nullable(),
  assignedTo: z.string().max(150).optional().nullable()
});
