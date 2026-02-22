import { expect, test } from "@playwright/test";

test("profile route responds", async ({ page }) => {
  await page.goto("/profile");
  await expect(page.locator("body")).toBeVisible();
});
