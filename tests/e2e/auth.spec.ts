import { expect, test } from "@playwright/test";

test.describe("auth flow", () => {
  test("login page renders", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Inchecken")).toBeVisible();
  });
});
