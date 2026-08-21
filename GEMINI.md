# Ztefu-Immo : Documentation de Référence (Context & State)

Ce fichier sert de "mémoire" et de contexte pour tout futur modèle IA travaillant sur ce projet. Il résume l'état actuel de l'application, ses fonctionnalités, sa structure, et ses règles de design architecturales.

---

## 1. Ce que fait l'application
**Ztefu-Immo** est un SaaS (Software as a Service) de gestion immobilière de type "Premium". 
Il permet aux propriétaires et gestionnaires de biens immobiliers de suivre l'état de leur parc, de gérer les locataires, de suivre les encaissements de loyers et de piloter la maintenance (tickets). 
Il est divisé en deux parties principales :
1. **Le Dashboard Administrateur** : Interface complète de gestion pour les propriétaires/gestionnaires.
2. **Le Portail Locataire** : Espace dédié au locataire pour suivre ses paiements et déclarer des incidents.

---

## 2. Fonctionnalités Implémentées (État actuel)
> *Note : Actuellement, l'application fonctionne avec un système de Mock Data (`src/lib/mock-data.ts`) complet qui simule un comportement CRUD asynchrone.*

- **Dashboard Principal (`/dashboard`)** : KPI dynamiques, graphiques de revenus, taux d'occupation, locataires en retard. Les données sont filtrables par période (Mois, Année, Global).
- **Gestion des Locataires (`/tenants`)** : Formulaire CRUD complet (Ajout, Édition) avec assignation de logement.
- **Gestion des Loyers & Paiements (`/rent`)** : Enregistrement manuel des paiements, calcul automatique des reliquats et mise à jour du statut du locataire (Payé, Partiellement payé, En retard).
- **Rapports et Statistiques (`/reports`)** : Calcul des recettes brutes, des dépenses de maintenance, bénéfices nets, et réparition des revenus par propriété. (Sensible au filtrage par période).
- **Gestion de la Maintenance (`/maintenance`)** : Système de tickets avec priorités et changement d'états (Nouveau, En cours, Résolu).
- **Portail Locataire (`/portal`)** : Interface de connexion par téléphone + code (UI prête, attente de connexion avec le vrai dashboard locataire `portal/(auth)`).
- **Sidebar Interactive** : Navigation latérale rétractable avec animation complexe (faisceau lumineux vibrant verticalement).

---

## 3. Structure des Fichiers
Le projet utilise le routeur `app` de Next.js.
```
src/
├── app/
│   ├── (dashboard)/       # Routes du gestionnaire (protégées par la suite)
│   │   ├── dashboard/     # Vue d'ensemble
│   │   ├── tenants/       # Locataires
│   │   ├── properties/    # Propriétés
│   │   ├── units/         # Logements
│   │   ├── rent/          # Loyers / Paiements
│   │   ├── maintenance/   # Tickets d'intervention
│   │   ├── leases/        # Baux
│   │   ├── reports/       # Statistiques
│   │   └── layout.tsx     # Layout principal (Sidebar + Header)
│   ├── portal/            # Espace Locataire
│   │   ├── (auth)/        # Dashboard & vues du locataire connecté
│   │   └── page.tsx       # Page de login Locataire
│   ├── globals.css        # Styles globaux Tailwind
│   └── layout.tsx         # Root Layout
├── components/
│   ├── layout/            # AppSidebar, PageHeader
│   └── ui/                # Composants réutilisables (DataTable, Modal, StatusBadge...)
└── lib/
    ├── mock-data.ts       # Base de données temporaire et logique métier (CRUD)
    └── utils.ts           # Utilitaires (ex: cn pour classnames)
```

---

## 4. Technologies Utilisées
- **Framework** : Next.js (React) avec l'App Router.
- **Styling** : Tailwind CSS (Vanilla CSS pour la flexibilité).
- **Animations** : Framer Motion (Essentiel pour l'UX Premium).
- **Graphiques** : Recharts.
- **Icônes** : Lucide React.
- **Toasts/Notifications** : `react-hot-toast`.
- *(À venir)* : Supabase (Auth & PostgreSQL).

---

## 5. Décisions de Design & Règles pour l'IA (AGENTS.md)
Le design doit être **extrêmement Premium**, "Apple-like", fluide et interactif. Il est strictement encadré par les règles définies dans les instructions agentiques :

### Esthétique
- **Couleurs de fond** : `bg-slate-50` pour la page, `bg-white` pour les cartes.
- **Typographie** : Contraste fort. `text-slate-900` pour l'important, `text-slate-500` pour le secondaire.
- **Ombres (Crucial)** : Ne jamais utiliser les ombres par défaut de Tailwind. 
  - Défaut : `shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)]`
  - Hover : `shadow-[0_12px_24px_-8px_rgba(0,0,0,0.1)]`
- **Bordures et Arrondis** : Très prononcés. `rounded-[24px]` ou `32px` pour les blocs majeurs, `rounded-full` pour boutons/badges.
- **Code Couleur Fonctionnel** : 
  - Succès/Payé : Vert (`#22c55e` / `bg-green-100`)
  - Info/Revenus : Bleu (`#3b82f6` / `bg-blue-100`)
  - Attention/En retard : Jaune/Orange (`#eab308` / `bg-yellow-100`)
  - Utilisateurs/Neutre : Violet (`#a855f7` / `bg-purple-100`)

### Animations
L'interface doit paraître "vivante". 
- Chaque carte principale doit réagir au survol (`hover:-translate-y-1.5`, changement d'ombre).
- Apparition des éléments en cascade (`staggerChildren` via Framer Motion).

### Orientations futures
1. **Migration Supabase** : C'est le prochain jalon technique. Le remplacement de `mock-data.ts` par des vraies tables PostgreSQL nécessitera de refactoriser les appels pour qu'ils soient asynchrones.
2. **Supabase Auth** : À implémenter pour sécuriser le Dashboard et le Portail Locataire.
3. **Génération de Baux & Quittances** : Les documents contractuels devront être générés automatiquement en PDF.
4. **Relances Emails** : À prévoir pour les paiements en retard.

> **Instruction au prochain LLM** : Lisez toujours ce document avant d'entreprendre des modifications de l'UI pour garantir la consistance esthétique, et prenez en compte l'état de la migration Supabase.
