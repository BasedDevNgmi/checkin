import { expect, test } from "@playwright/test";

test("entries detail route responds", async ({ page }) => {
  await page.goto("/entries/test-id");
  await expect(page.locator("body")).toBeVisible();
});
