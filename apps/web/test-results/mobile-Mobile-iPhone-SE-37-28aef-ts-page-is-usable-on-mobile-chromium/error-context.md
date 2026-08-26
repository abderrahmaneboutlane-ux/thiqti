# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: mobile.spec.ts >> Mobile: iPhone SE (375x667) >> results page is usable on mobile
- Location: e2e\mobile.spec.ts:20:9

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
Call log:
  - navigating to "http://localhost:3001/results", waiting until "load"

```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | const MOBILE_VIEWPORTS = [
  4   |   { name: "iPhone SE", width: 375, height: 667 },
  5   |   { name: "iPhone 14", width: 390, height: 844 },
  6   |   { name: "Samsung Galaxy S21", width: 360, height: 800 },
  7   | ];
  8   | 
  9   | for (const viewport of MOBILE_VIEWPORTS) {
  10  |   test.describe(`Mobile: ${viewport.name} (${viewport.width}x${viewport.height})`, () => {
  11  |     test.use({ viewport: { width: viewport.width, height: viewport.height } });
  12  | 
  13  |     test("landing page renders without horizontal overflow", async ({ page }) => {
  14  |       await page.goto("/");
  15  |       await page.waitForLoadState("networkidle");
  16  |       const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  17  |       expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 10);
  18  |     });
  19  | 
  20  |     test("results page is usable on mobile", async ({ page }) => {
> 21  |       await page.goto("/results");
      |                  ^ Error: page.goto: net::ERR_ABORTED; maybe frame was detached?
  22  |       await expect(page.getByText(/véhicule/i).first()).toBeVisible({ timeout: 15000 });
  23  |       const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  24  |       expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 10);
  25  |     });
  26  | 
  27  |     test("floating bottom nav is visible on mobile", async ({ page }) => {
  28  |       await page.goto("/results");
  29  |       await page.waitForTimeout(1000);
  30  |       const nav = page.locator('nav[aria-label="Navigation principale"]');
  31  |       if (await nav.isVisible({ timeout: 3000 }).catch(() => false)) {
  32  |         await expect(nav).toBeVisible();
  33  |         const box = await nav.boundingBox();
  34  |         expect(box).not.toBeNull();
  35  |         expect(box!.y).toBeGreaterThan(viewport.height - 150);
  36  |       }
  37  |     });
  38  | 
  39  |     test("chat page renders correctly on mobile", async ({ page }) => {
  40  |       await page.goto("/chat");
  41  |       await page.waitForLoadState("networkidle");
  42  |       const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  43  |       expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 10);
  44  |       const input = page.locator('input[aria-label="Votre message"]');
  45  |       await expect(input).toBeVisible({ timeout: 5000 });
  46  |     });
  47  | 
  48  |     test("vehicle detail page is readable on mobile", async ({ page }) => {
  49  |       await page.goto("/results");
  50  |       await page.waitForTimeout(1000);
  51  |       const firstCard = page.locator('a[href*="/vehicle/"]').first();
  52  |       if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
  53  |         await firstCard.click();
  54  |         await page.waitForLoadState("networkidle");
  55  |         const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  56  |         expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 10);
  57  |       }
  58  |     });
  59  | 
  60  |     test("compare page works on mobile", async ({ page }) => {
  61  |       await page.goto("/compare");
  62  |       await page.waitForLoadState("networkidle");
  63  |       const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  64  |       expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 10);
  65  |     });
  66  | 
  67  |     test("favorites page renders on mobile", async ({ page }) => {
  68  |       await page.goto("/favorites");
  69  |       await page.waitForLoadState("networkidle");
  70  |       const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
  71  |       expect(bodyWidth).toBeLessThanOrEqual(viewport.width + 10);
  72  |     });
  73  |   });
  74  | }
  75  | 
  76  | test.describe("Mobile: safe area insets", () => {
  77  |   test.use({ viewport: { width: 390, height: 844 } });
  78  | 
  79  |   test("floating nav uses safe area inset CSS", async ({ page }) => {
  80  |     await page.goto("/results");
  81  |     await page.waitForTimeout(1000);
  82  |     const nav = page.locator('nav[aria-label="Navigation principale"]');
  83  |     if (await nav.isVisible({ timeout: 3000 }).catch(() => false)) {
  84  |       const style = await nav.evaluate((el) => el.getAttribute("style") || "");
  85  |       expect(style).toContain("env(safe-area-inset-bottom");
  86  |     }
  87  |   });
  88  | 
  89  |   test("toast uses safe area inset CSS", async ({ page }) => {
  90  |     await page.goto("/");
  91  |     await page.waitForLoadState("networkidle");
  92  |     const toastContainer = page.locator(".fixed.bottom-6.right-6");
  93  |     if (await toastContainer.count() > 0) {
  94  |       const style = await toastContainer.first().evaluate((el) => el.getAttribute("style") || "");
  95  |       expect(style).toContain("env(safe-area-inset");
  96  |     }
  97  |   });
  98  | });
  99  | 
  100 | test.describe("Mobile: virtual keyboard handling", () => {
  101 |   test.use({ viewport: { width: 390, height: 844 } });
  102 | 
  103 |   test("chat input has correct mobile attributes", async ({ page }) => {
  104 |     await page.goto("/chat");
  105 |     await page.waitForLoadState("networkidle");
  106 |     const input = page.locator('input[aria-label="Votre message"]');
  107 |     await expect(input).toBeVisible({ timeout: 5000 });
  108 |     const inputMode = await input.getAttribute("inputmode");
  109 |     expect(inputMode).toBe("search");
  110 |     const enterHint = await input.getAttribute("enterkeyhint");
  111 |     expect(enterHint).toBe("send");
  112 |   });
  113 | });
  114 | 
```