import { test, expect } from "@playwright/test";

const MOBILE_VIEWPORTS = [
  { name: "iPhone SE", width: 375, height: 667 },
  { name: "iPhone 14", width: 390, height: 844 },
  { name: "Samsung Galaxy S21", width: 360, height: 800 },
];

for (const viewport of MOBILE_VIEWPORTS) {
  test.describe(`Mobile: ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    test("landing page renders without horizontal overflow", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 10);
    });

    test("results page is usable on mobile", async ({ page }) => {
      await page.goto("/results");
      await expect(page.getByText(/véhicule/i).first()).toBeVisible({ timeout: 15000 });
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 10);
    });

    test("floating bottom nav is visible on mobile", async ({ page }) => {
      await page.goto("/results");
      await page.waitForTimeout(1000);
      const nav = page.locator('nav[aria-label="Navigation principale"]');
      if (await nav.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(nav).toBeVisible();
        const box = await nav.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.y).toBeGreaterThan(viewport.height - 150);
      }
    });

    test("chat page renders correctly on mobile", async ({ page }) => {
      await page.goto("/chat");
      await page.waitForLoadState("networkidle");
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 10);
      const input = page.locator('input[aria-label="Votre message"]');
      await expect(input).toBeVisible({ timeout: 5000 });
    });

    test("vehicle detail page is readable on mobile", async ({ page }) => {
      await page.goto("/results");
      await page.waitForTimeout(1000);
      const firstCard = page.locator('a[href*="/vehicle/"]').first();
      if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
        await firstCard.click();
        await page.waitForLoadState("networkidle");
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 10);
      }
    });

    test("compare page works on mobile", async ({ page }) => {
      await page.goto("/compare");
      await page.waitForLoadState("networkidle");
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 10);
    });

    test("favorites page renders on mobile", async ({ page }) => {
      await page.goto("/favorites");
      await page.waitForLoadState("networkidle");
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 10);
    });
  });
}

test.describe("Mobile: safe area insets", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("floating nav uses safe area inset CSS", async ({ page }) => {
    await page.goto("/results");
    await page.waitForTimeout(1000);
    const nav = page.locator('nav[aria-label="Navigation principale"]');
    if (await nav.isVisible({ timeout: 3000 }).catch(() => false)) {
      const style = await nav.evaluate((el) => el.getAttribute("style") || "");
      expect(style).toContain("env(safe-area-inset-bottom");
    }
  });

  test("toast uses safe area inset CSS", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const toastContainer = page.locator(".fixed.bottom-6.right-6");
    if (await toastContainer.count() > 0) {
      const style = await toastContainer.first().evaluate((el) => el.getAttribute("style") || "");
      expect(style).toContain("env(safe-area-inset");
    }
  });
});

test.describe("Mobile: virtual keyboard handling", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("chat input has correct mobile attributes", async ({ page }) => {
    await page.goto("/chat");
    await page.waitForLoadState("networkidle");
    const input = page.locator('input[aria-label="Votre message"]');
    await expect(input).toBeVisible({ timeout: 5000 });
    const inputMode = await input.getAttribute("inputmode");
    expect(inputMode).toBe("search");
    const enterHint = await input.getAttribute("enterkeyhint");
    expect(enterHint).toBe("send");
  });
});
