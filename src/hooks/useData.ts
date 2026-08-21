"use client";

import useSWR from 'swr';
import { getProperties, getUnits, getTenants, getTickets, getPayments, getOwners } from '@/lib/supabase-api';

// Cache keys
export const CACHE_KEYS = {
  properties: 'properties',
  units: 'units',
  tenants: 'tenants',
  tickets: 'tickets',
  payments: 'payments',
  owners: 'owners'
};

export function useProperties() {
  const { data, error, isLoading, mutate } = useSWR(CACHE_KEYS.properties, getProperties);
  return { properties: data || [], isLoading, isError: error, refreshProperties: mutate };
}

export function useUnits() {
  const { data, error, isLoading, mutate } = useSWR(CACHE_KEYS.units, getUnits);
  return { units: data || [], isLoading, isError: error, refreshUnits: mutate };
}

export function useTenants() {
  const { data, error, isLoading, mutate } = useSWR(CACHE_KEYS.tenants, getTenants);
  return { tenants: data || [], isLoading, isError: error, refreshTenants: mutate };
}

export function useTickets() {
  const { data, error, isLoading, mutate } = useSWR(CACHE_KEYS.tickets, getTickets);
  return { tickets: data || [], isLoading, isError: error, refreshTickets: mutate };
}

export function usePayments() {
  const { data, error, isLoading, mutate } = useSWR(CACHE_KEYS.payments, getPayments);
  return { payments: data || [], isLoading, isError: error, refreshPayments: mutate };
}

export function useOwners() {
  const { data, error, isLoading, mutate } = useSWR(CACHE_KEYS.owners, getOwners);
  return { owners: data || [], isLoading, isError: error, refreshOwners: mutate };
}
