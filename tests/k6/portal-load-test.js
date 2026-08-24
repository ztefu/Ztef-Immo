import http from 'k6/http';
import { check, sleep } from 'k6';

// --- Configuration du Test (Scénarios) ---
export const options = {
  stages: [
    // Phase 1 : Montée en charge progressive
    { duration: '30s', target: 20 },  // Atteindre 20 utilisateurs simultanés en 30 secondes
    
    // Phase 2 : Pic de charge (Stress)
    { duration: '1m', target: 50 },   // Maintenir 50 utilisateurs pendant 1 minute
    
    // Phase 3 : Descente
    { duration: '30s', target: 0 },   // Redescendre à 0 utilisateur
  ],
  thresholds: {
    // Critères de réussite du test (les seuils)
    http_req_duration: ['p(95)<500'], // 95% des requêtes doivent répondre en moins de 500ms
    http_req_failed: ['rate<0.01'],   // Moins de 1% d'erreurs HTTP autorisées
  },
};

// L'URL de base de votre application locale (Next.js tourne sur le port 3000 par défaut)
const BASE_URL = 'http://localhost:3000';

// --- Comportement de l'Utilisateur Virtuel (VU) ---
export default function () {
  // 1. Visite de la page du portail locataire
  const res = http.get(`${BASE_URL}/portal`);

  // 2. Vérifications (Checks)
  check(res, {
    'Statut est bien 200 (OK)': (r) => r.status === 200,
    'La page charge l\'UI du portail': (r) => r.body.includes('Espace Locataire'),
  });

  // 3. Pause (Simule le temps de lecture ou de saisie du locataire)
  sleep(Math.random() * 2 + 1); // Pause aléatoire entre 1 et 3 secondes
}
