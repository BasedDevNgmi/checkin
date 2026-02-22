import { expect, test } from "@playwright/test";

test("check-in wizard route loads", async ({ page }) => {
  await page.goto("/checkin");
  await expect(page.getByText("Wat gaat er door je hoofd?")).toBeVisible();
});
