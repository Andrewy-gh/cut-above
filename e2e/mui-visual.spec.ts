import { test, expect, type Page } from '@playwright/test';

const FIXED_NOW = '2026-01-15T12:00:00.000Z';
const desktopViewport = { width: 1280, height: 720 };

async function mockApi(page: Page) {
  await page.route('**/api/employees/profiles', (route) =>
    route.fulfill({ json: [] })
  );
  await page.route('**/api/employees', (route) => route.fulfill({ json: [] }));
  await page.route('**/api/schedules', (route) => route.fulfill({ json: [] }));
}

async function freezeTime(page: Page) {
  await page.addInitScript(
    ({ now }) => {
      const fixed = new Date(now);
      const OriginalDate = Date;
      class MockDate extends OriginalDate {
        constructor(...args: ConstructorParameters<typeof Date>) {
          if (args.length === 0) {
            return new OriginalDate(fixed);
          }
          return new OriginalDate(...args);
        }

        static now() {
          return fixed.getTime();
        }
      }
      // eslint-disable-next-line no-global-assign
      Date = MockDate as DateConstructor;
    },
    { now: FIXED_NOW }
  );
}

async function stabilize(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        caret-color: transparent !important;
      }
    `,
  });
}

test('home visual', async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await mockApi(page);
  await freezeTime(page);

  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(
    page.getByRole('heading', { name: /experience a cut above/i })
  ).toBeVisible();
  await stabilize(page);

  await expect(page).toHaveScreenshot('home.png', { fullPage: true });
});

test('booking visual', async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await mockApi(page);
  await freezeTime(page);

  await page.goto('/bookings');
  await page.waitForLoadState('networkidle');
  await expect(
    page.getByRole('heading', { name: /schedule your appointment/i })
  ).toBeVisible();
  await stabilize(page);

  await expect(page).toHaveScreenshot('booking.png', { fullPage: true });
});

test('date picker visual (mobile)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockApi(page);
  await freezeTime(page);

  await page.goto('/bookings');
  await page.waitForLoadState('networkidle');
  await expect(
    page.getByRole('heading', { name: /schedule your appointment/i })
  ).toBeVisible();

  await page.getByPlaceholder('MM/DD/YYYY').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await stabilize(page);

  await expect(page).toHaveScreenshot('date-picker-mobile.png', {
    fullPage: true,
  });
});
