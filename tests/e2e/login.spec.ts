import { test, expect } from '@playwright/test';

test.describe('Flux de Connexion', () => {
  
  test('L\'administrateur peut se connecter et accéder au dashboard', async ({ page }) => {
    // 1. Aller sur la page de connexion
    await page.goto('/login');
    
    // 2. Vérifier que la page s'est bien chargée
    await expect(page).toHaveTitle(/Ztefu-Immo/);
    await expect(page.locator('h1')).toContainText('Se connecter');
    
    // 3. Remplir le formulaire
    // (Remplacez ces identifiants par ceux configurés dans votre environnement local)
    await page.fill('input[type="email"]', 'test@ztefu-immo.com');
    await page.fill('input[type="password"]', 'password123');
    
    // 4. Soumettre le formulaire
    await page.click('button[type="submit"]');
    
    // 5. Vérifier la redirection vers le dashboard
    // Par défaut, l'application redirige vers /dashboard après une connexion réussie
    await expect(page).toHaveURL(/\/dashboard/);
    
    // 6. Vérifier la présence d'un élément clé du dashboard
    await expect(page.locator('h1')).toContainText('Tableau de bord');
  });

  test('La validation du mot de passe fonctionne', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[type="email"]', 'test@ztefu-immo.com');
    await page.fill('input[type="password"]', 'mauvaismotdepasse');
    await page.click('button[type="submit"]');
    
    // S'assurer que l'utilisateur n'est pas redirigé
    await expect(page).not.toHaveURL(/\/dashboard/);
  });
});
