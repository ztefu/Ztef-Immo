import { describe, it, expect } from 'vitest';
import { Payment } from '@/lib/mock-data';

// Simuler la fonction de calcul (qui est dans rent/page.tsx actuellement)
function calculateLateFees(payments: Payment[]): number {
  const totalCollected = payments.reduce((sum, p) => sum + (p.amountPaid || 0), 0);
  const totalDue = payments.reduce((sum, p) => sum + (p.amountDue || 0), 0);
  return totalDue - totalCollected;
}

describe('Calculs Financiers', () => {
  it('calcule correctement le total des loyers en retard', () => {
    const mockPayments = [
      { amountDue: 100000, amountPaid: 100000, status: 'Payé' },
      { amountDue: 50000, amountPaid: 25000, status: 'Partiellement payé' },
      { amountDue: 75000, amountPaid: 0, status: 'En retard' },
    ] as Payment[];

    // Reste à payer : (50k - 25k) + (75k - 0) = 100k
    const lateAmount = calculateLateFees(mockPayments);
    
    expect(lateAmount).toBe(100000);
  });
});
