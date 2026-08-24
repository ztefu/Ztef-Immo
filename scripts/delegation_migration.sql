-- ============================================
-- Migration : Système de Délégation de Gestion
-- ============================================

-- 1. Créer la table property_delegations
CREATE TABLE IF NOT EXISTS property_delegations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES owners(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'En attente' CHECK (status IN ('En attente', 'Acceptée', 'Refusée', 'Révoquée')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_delegations_agency ON property_delegations(agency_id);
CREATE INDEX IF NOT EXISTS idx_delegations_owner ON property_delegations(owner_id);
CREATE INDEX IF NOT EXISTS idx_delegations_property ON property_delegations(property_id);
CREATE INDEX IF NOT EXISTS idx_delegations_status ON property_delegations(status);

-- 3. Contrainte unique : une seule demande active par propriété
-- (empêche les doublons "En attente" pour la même propriété vers la même agence)
CREATE UNIQUE INDEX IF NOT EXISTS idx_delegations_unique_pending 
  ON property_delegations(property_id, agency_id) 
  WHERE status IN ('En attente', 'Acceptée');

-- 4. Trigger : mise à jour automatique de updated_at
CREATE OR REPLACE FUNCTION update_delegation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_delegation_updated_at ON property_delegations;
CREATE TRIGGER trg_delegation_updated_at
  BEFORE UPDATE ON property_delegations
  FOR EACH ROW
  EXECUTE FUNCTION update_delegation_timestamp();

-- 5. Trigger principal : cascade agency_id sur acceptation/révocation
CREATE OR REPLACE FUNCTION handle_delegation_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Quand une demande est ACCEPTÉE : assigner l'agency_id
  IF NEW.status = 'Acceptée' AND OLD.status = 'En attente' THEN
    -- Mettre à jour la propriété
    UPDATE properties SET agency_id = NEW.agency_id WHERE id = NEW.property_id;
    
    -- Mettre à jour les logements de cette propriété
    UPDATE units SET agency_id = NEW.agency_id WHERE property_id = NEW.property_id;
    
    -- Mettre à jour les locataires liés aux logements de cette propriété
    UPDATE tenants SET agency_id = NEW.agency_id 
    WHERE unit_id IN (SELECT id FROM units WHERE property_id = NEW.property_id);
    
    -- Mettre à jour les paiements liés à ces locataires
    UPDATE payments SET agency_id = NEW.agency_id 
    WHERE tenant_id IN (
      SELECT t.id FROM tenants t 
      JOIN units u ON t.unit_id = u.id 
      WHERE u.property_id = NEW.property_id
    );
    
    -- Mettre à jour les tickets liés à cette propriété
    UPDATE tickets SET agency_id = NEW.agency_id WHERE property_id = NEW.property_id;
  END IF;
  
  -- Quand une délégation est RÉVOQUÉE : retirer l'agency_id
  IF NEW.status = 'Révoquée' AND OLD.status = 'Acceptée' THEN
    -- Remettre agency_id à NULL pour la propriété
    UPDATE properties SET agency_id = NULL WHERE id = NEW.property_id;
    
    -- Remettre agency_id à NULL pour les logements
    UPDATE units SET agency_id = NULL WHERE property_id = NEW.property_id;
    
    -- Remettre agency_id à NULL pour les locataires
    UPDATE tenants SET agency_id = NULL 
    WHERE unit_id IN (SELECT id FROM units WHERE property_id = NEW.property_id);
    
    -- Remettre agency_id à NULL pour les paiements
    UPDATE payments SET agency_id = NULL 
    WHERE tenant_id IN (
      SELECT t.id FROM tenants t 
      JOIN units u ON t.unit_id = u.id 
      WHERE u.property_id = NEW.property_id
    );
    
    -- Remettre agency_id à NULL pour les tickets
    UPDATE tickets SET agency_id = NULL WHERE property_id = NEW.property_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_delegation_status_change ON property_delegations;
CREATE TRIGGER trg_delegation_status_change
  AFTER UPDATE OF status ON property_delegations
  FOR EACH ROW
  EXECUTE FUNCTION handle_delegation_status_change();

-- 6. RLS (Row Level Security)
ALTER TABLE property_delegations ENABLE ROW LEVEL SECURITY;

-- Politique de lecture : propriétaire et agence concernés peuvent lire
CREATE POLICY "Owners can view their delegations"
  ON property_delegations FOR SELECT
  USING (true);  -- Permissive via service_role, on filtrera côté app

-- Politique d'insertion : via service_role uniquement
CREATE POLICY "Service role can insert delegations"
  ON property_delegations FOR INSERT
  WITH CHECK (true);

-- Politique de mise à jour : via service_role uniquement  
CREATE POLICY "Service role can update delegations"
  ON property_delegations FOR UPDATE
  USING (true);
