import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WhatsAppBatchModal } from '@/components/ui/WhatsAppBatchModal';

describe('WhatsAppBatchModal', () => {
  const mockTenants = [
    {
      tenant: {
        id: '1',
        fullName: 'Jean Dupont',
        email: 'jean@test.com',
        phone: '690001122',
        cni: '12345',
        unitId: 'u1',
        status: 'Actif',
        rentAmount: 50000,
        createdAt: new Date().toISOString(),
      },
      amountDue: 50000,
    },
    {
      tenant: {
        id: '2',
        fullName: 'Marie Curie',
        email: 'marie@test.com',
        phone: '690003344',
        cni: '67890',
        unitId: 'u2',
        status: 'Actif',
        rentAmount: 75000,
        createdAt: new Date().toISOString(),
      },
      amountDue: 25000,
    },
  ];

  it('affiche le bon nombre de locataires en retard', () => {
    render(
      <WhatsAppBatchModal 
        isOpen={true} 
        onClose={() => {}} 
        lateTenants={mockTenants as any} 
      />
    );

    // On vérifie que le texte "2 locataire(s) en retard" est présent
    expect(screen.getByText('2 locataire(s) en retard')).toBeInTheDocument();
    
    // On vérifie que les noms des locataires sont affichés
    expect(screen.getByText('Jean Dupont')).toBeInTheDocument();
    expect(screen.getByText('Marie Curie')).toBeInTheDocument();
  });

  it('affiche un message de succès quand il n\'y a pas de retard', () => {
    render(
      <WhatsAppBatchModal 
        isOpen={true} 
        onClose={() => {}} 
        lateTenants={[]} 
      />
    );

    expect(screen.getByText('Aucun retard !')).toBeInTheDocument();
  });
});
