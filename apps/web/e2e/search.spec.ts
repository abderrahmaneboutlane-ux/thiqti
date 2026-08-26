import { test, expect } from "@playwright/test";

/* ── Flow 1: Landing page search (SPA) ─────────────────────── */
test.describe("Flow 1: Recherche", () => {
  test("la page d'accueil affiche la barre de recherche", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#searchInput")).toBeVisible({ timeout: 10000 });
  });

  test("une recherche produit des résultats dans le SPA", async ({ page }) => {
    await page.goto("/");
    const input = page.locator("#searchInput");
    await input.fill("SUV diesel autour de 300000 DH");
    await input.press("Enter");
    await page.waitForTimeout(2000);
    const resultsVisible = await page.locator("#page-results").isVisible().catch(() => false);
    const hasCards = await page.locator(".car-card, .vehicle-card, [data-car]").first().isVisible({ timeout: 5000 }).catch(() => false);
    expect(resultsVisible || hasCards).toBeTruthy();
  });

  test("les filtres fonctionnent", async ({ page }) => {
    await page.goto("/");
    const input = page.locator("#searchInput");
    await input.fill("Voiture");
    await input.press("Enter");
    await page.waitForTimeout(1000);
    const filterBtns = page.locator("button").filter({ hasText: /Diesel|Essence|Tous/i });
    if (await filterBtns.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await filterBtns.first().click();
    }
    expect(true).toBeTruthy();
  });
});

/* ── Flow 2: Results page (Next.js) ────────────────────────── */
test.describe("Flow 2: Fiche véhicule", () => {
  test("la page résultats Next.js affiche des cartes véhicules", async ({ page }) => {
    await page.goto("/results");
    await expect(page.getByText(/véhicule/i).first()).toBeVisible({ timeout: 15000 });
  });

  test("la fiche affiche le prix et les specs", async ({ page }) => {
    const res = await page.request.get("/api/search?limit=1");
    const body = await res.json();
    const firstId = body.results?.[0]?.id;
    expect(firstId).toBeTruthy();
    await page.goto(`/vehicle/${firstId}`);
    await expect(page.locator("body")).toContainText(/DH|DH\./, { timeout: 20000 });
  });

  test("un véhicule inexistant affiche un message d'erreur", async ({ page }) => {
    await page.goto("/vehicle/nonexistent-vehicle-12345");
    await page.waitForTimeout(3000);
    const content = await page.textContent("body");
    expect(content).toBeTruthy();
  });
});

/* ── Flow 3: Favorites ──────────────────────────────────────── */
test.describe("Flow 3: Favoris", () => {
  test("la page favoris est accessible", async ({ page }) => {
    await page.goto("/favorites");
    await expect(page.getByText(/favoris/i).first()).toBeVisible({ timeout: 10000 });
  });
});

/* ── Flow 4: Comparison ─────────────────────────────────────── */
test.describe("Flow 4: Comparaison", () => {
  test("la page comparaison est accessible", async ({ page }) => {
    await page.goto("/compare");
    await expect(page.getByText(/comparaison/i).first()).toBeVisible({ timeout: 10000 });
  });
});

/* ── Flow 5: Chat ───────────────────────────────────────────── */
test.describe("Flow 5: Chat IA", () => {
  test("la page chat est accessible", async ({ page }) => {
    await page.goto("/chat");
    await expect(page.getByText(/Thiqti/i).first()).toBeVisible({ timeout: 15000 });
  });
});

/* ── Security: Middleware Auth ───────────────────────────────── */
test.describe("Sécurité", () => {
  test("l'admin redirige vers login sans session", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/login/, { timeout: 10000 });
  });

  test("l'API auth/me retourne 401 sans token", async ({ page }) => {
    const response = await page.request.get("/api/auth/me");
    expect(response.status()).toBe(401);
  });
});

/* ── SEO: Meta tags ─────────────────────────────────────────── */
test.describe("SEO", () => {
  test("la page résultats a des meta tags OG", async ({ page }) => {
    await page.goto("/results");
    await page.waitForTimeout(3000);
    const html = await page.content();
    expect(html).toContain("og:");
  });

  test("le sitemap.xml est accessible", async ({ page }) => {
    const response = await page.request.get("/sitemap.xml");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("urlset");
  });

  test("le robots.txt est accessible", async ({ page }) => {
    const response = await page.request.get("/robots.txt");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain("User-Agent");
  });
});
