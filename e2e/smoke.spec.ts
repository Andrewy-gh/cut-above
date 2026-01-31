import { test, expect, type Page } from '@playwright/test';

async function mockApi(page: Page) {
  await page.route('**/api/employees/profiles', (route) =>
    route.fulfill({ json: [] })
  );
  await page.route('**/api/employees', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/schedules', (route) => route.fulfill({ json: [] }));
}

test('home and booking smoke', async ({ page }) => {
  await mockApi(page);

  await page.goto('/');
  await expect(
    page.getByRole('heading', { name: /experience a cut above/i })
  ).toBeVisible();

  await page.getByRole('button', { name: /schedule an appointment/i }).click();
  await expect(
    page.getByRole('heading', { name: /schedule your appointment/i })
  ).toBeVisible();
  await expect(page.getByText(/no times available/i)).toBeVisible();
});
