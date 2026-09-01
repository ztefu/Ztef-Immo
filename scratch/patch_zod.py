import re
import os

def patch_supabase_api():
    with open('src/lib/supabase-api.ts', 'r', encoding='utf-8') as f:
        content = f.read()
        
    # Add imports
    import_stmt = "import { PaymentSchema, TenantSchema, PropertySchema, UnitSchema, OwnerSchema, TicketSchema } from './validations';\n"
    if 'PaymentSchema' not in content:
        content = content.replace("import { createClient, createAdminClient } from '@/utils/supabase/server';", 
                                  "import { createClient, createAdminClient } from '@/utils/supabase/server';\n" + import_stmt)

    # We need to replace `if (error) throw error;` with generic error
    # Sometimes it's `if (error) { console.log(...); throw error; }`
    
    # Generic replacement for `throw error;`
    content = re.sub(r'throw error;', r'console.error(error); throw new Error("Une erreur interne est survenue.");', content)
    
    # Add validation to addPayment
    content = re.sub(r'export async function addPayment\(payment: any\) {', 
                     r'export async function addPayment(payment: any) {\n  const validatedData = PaymentSchema.parse(payment);\n  payment = { ...payment, ...validatedData };', content)
                     
    content = re.sub(r'export async function updatePayment\(id: string, updates: any\) {', 
                     r'export async function updatePayment(id: string, updates: any) {\n  const validatedData = PaymentSchema.partial().parse(updates);\n  updates = { ...updates, ...validatedData };', content)

    content = re.sub(r'export async function addTenant\(tenant: any\) {', 
                     r'export async function addTenant(tenant: any) {\n  const validatedData = TenantSchema.parse(tenant);\n  tenant = { ...tenant, ...validatedData };', content)

    content = re.sub(r'export async function updateTenant\(id: string, updates: any\) {', 
                     r'export async function updateTenant(id: string, updates: any) {\n  const validatedData = TenantSchema.partial().parse(updates);\n  updates = { ...updates, ...validatedData };', content)

    content = re.sub(r'export async function createProperty\(property: any\) {', 
                     r'export async function createProperty(property: any) {\n  const validatedData = PropertySchema.parse(property);\n  property = { ...property, ...validatedData };', content)

    content = re.sub(r'export async function updateProperty\(id: string, updates: any\) {', 
                     r'export async function updateProperty(id: string, updates: any) {\n  const validatedData = PropertySchema.partial().parse(updates);\n  updates = { ...updates, ...validatedData };', content)
                     
    content = re.sub(r'export async function createUnit\(unit: any\) {', 
                     r'export async function createUnit(unit: any) {\n  const validatedData = UnitSchema.parse(unit);\n  unit = { ...unit, ...validatedData };', content)
                     
    content = re.sub(r'export async function updateUnit\(id: string, updates: any\) {', 
                     r'export async function updateUnit(id: string, updates: any) {\n  const validatedData = UnitSchema.partial().parse(updates);\n  updates = { ...updates, ...validatedData };', content)

    content = re.sub(r'export async function createOwner\(owner: any\) {', 
                     r'export async function createOwner(owner: any) {\n  const validatedData = OwnerSchema.parse(owner);\n  owner = { ...owner, ...validatedData };', content)

    content = re.sub(r'export async function updateOwner\(id: string, updates: any\) {', 
                     r'export async function updateOwner(id: string, updates: any) {\n  const validatedData = OwnerSchema.partial().parse(updates);\n  updates = { ...updates, ...validatedData };', content)

    content = re.sub(r'export async function createTicket\(ticket: any\) {', 
                     r'export async function createTicket(ticket: any) {\n  const validatedData = TicketSchema.parse(ticket);\n  ticket = { ...ticket, ...validatedData };', content)

    content = re.sub(r'export async function updateTicket\(id: string, updates: any\) {', 
                     r'export async function updateTicket(id: string, updates: any) {\n  const validatedData = TicketSchema.partial().parse(updates);\n  updates = { ...updates, ...validatedData };', content)

    with open('src/lib/supabase-api.ts', 'w', encoding='utf-8') as f:
        f.write(content)
        
patch_supabase_api()
print("supabase-api patched")
