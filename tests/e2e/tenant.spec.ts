import { test, expect } from '@playwright/test';

test.describe('Gestion des Locataires', () => {
  
  // On se connecte avant chaque test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@mazeno.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('Création d\'un nouveau locataire', async ({ page }) => {
    // 1. Aller sur la page des locataires
    await page.click('a[href="/tenants"]');
    await expect(page).toHaveURL(/\/tenants/);
    
    // 2. Ouvrir la modale d'ajout
    await page.click('button:has-text("Nouveau locataire")');
    
    // 3. Remplir le formulaire
    const randomSuffix = Math.floor(Math.random() * 1000);
    const tenantName = `Locataire Test ${randomSuffix}`;
    
    await page.fill('input[name="fullName"]', tenantName);
    await page.fill('input[name="email"]', `locataire${randomSuffix}@test.com`);
    await page.fill('input[name="phone"]', `69000${randomSuffix}`);
    await page.fill('input[name="cni"]', `CNI${randomSuffix}`);
    
    // 4. Soumettre le formulaire
    await page.click('button[type="submit"]');
    
    // 5. Vérifier que la modale s'est fermée et que le message de succès apparaît
    await expect(page.locator('text=Locataire ajouté avec succès')).toBeVisible({ timeout: 10000 });
    
    // 6. Vérifier que le nouveau locataire est bien dans la liste
    await expect(page.locator(`text=${tenantName}`)).toBeVisible();
  });
});
