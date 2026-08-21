-- Exécutez ce script dans l'éditeur SQL de Supabase pour ajouter le support des slugs

-- 1. Ajouter la colonne 'slug' à la table 'agencies'
ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2. (Optionnel) Mettre à jour une agence existante avec un slug
-- Remplacez 'ID_DE_VOTRE_AGENCE' par le vrai UUID de l'agence Ztefu
UPDATE public.agencies 
SET slug = 'ztefu-immo' 
WHERE id = '7e5d9204-7e55-4860-8234-5ed907b2e76f';
