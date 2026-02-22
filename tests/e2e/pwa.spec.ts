import { expect, test } from "@playwright/test";

test.describe("pwa quality", () => {
  test("manifest is discoverable", async ({ page }) => {
    await page.goto("/dashboard");
    const manifestHref = await page
      .locator('link[rel="manifest"]')
      .evaluate((node) => (node as HTMLLinkElement).href);

    expect(manifestHref).toContain("/manifest");
  });

  test("service worker registers in production", async ({ page }) => {
    await page.goto("/dashboard");
    const swState = await page.evaluate(async () => {
      if (!("serviceWorker" in navigator)) return "unsupported";
      const registration = await navigator.serviceWorker.ready;
      return registration.active ? "active" : "missing";
    });

    expect(swState).toBe("active");
  });

  test("navigation still works after going offline", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");

    await context.setOffline(true);
    await page.goto("/checkin");
    await expect(page.locator("body")).toBeVisible();

    await context.close();
  });
});
