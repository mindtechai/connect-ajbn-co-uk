import { test, expect } from "@playwright/test";

const BASE = process.env.APP_URL ?? "http://localhost:8080";

async function fillAndSubmit(page: import("@playwright/test").Page) {
  await page.goto(`${BASE}/services`);
  await page.getByRole("button", { name: "Submit a Deal" }).first().click();
  await page.getByLabel("Name").fill("Test User");
  await page.getByLabel("Email").fill("test@example.com");
  await page.getByLabel("Phone number").fill("07000000000");
  await page.getByLabel("Message").fill("This is a Playwright test enquiry.");
  await page.getByTestId("svc-submit").click();
  await expect(page.getByText(/team will be in touch/i)).toBeVisible({ timeout: 10_000 });
}

test("public user can submit an enquiry", async ({ page }) => {
  await fillAndSubmit(page);
});

test("authenticated user can submit an enquiry", async ({ page, context }) => {
  const storageKey = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
  const sessionJson = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;
  const cookiesJson = process.env.LOVABLE_BROWSER_SUPABASE_COOKIES_JSON;
  if (cookiesJson) {
    const cookies = JSON.parse(cookiesJson).map((c: Record<string, unknown>) => ({ ...c, url: BASE }));
    await context.addCookies(cookies);
  }
  await page.goto(BASE);
  if (storageKey && sessionJson) {
    await page.evaluate(([k, v]) => window.localStorage.setItem(k!, v!), [storageKey, sessionJson]);
  }
  await fillAndSubmit(page);
});