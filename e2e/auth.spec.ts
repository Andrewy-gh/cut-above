import { expect, test, type Page } from '@playwright/test';

const persistedAuthStorageKey = 'persist:auth';

const stalePersistedAuthState = JSON.stringify({
  user: JSON.stringify('persisted@example.com'),
  role: JSON.stringify('client'),
  _persist: JSON.stringify({ version: -1, rehydrated: true }),
});

async function mockUnauthenticatedSession(page: Page) {
  await page.route('**/api/auth/get-session**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: 'null',
    });
  });
}

test('@auth redirects protected routes to login and clears stale persisted auth', async ({
  page,
}) => {
  await page.addInitScript(
    ({ storageKey, storageValue }) => {
      window.localStorage.setItem(storageKey, storageValue);
    },
    {
      storageKey: persistedAuthStorageKey,
      storageValue: stalePersistedAuthState,
    }
  );
  await mockUnauthenticatedSession(page);

  await page.goto('/account?tab=security');

  await expect(page).toHaveURL(
    /\/login\?returnTo=%2Faccount%3Ftab%3Dsecurity$/
  );
  await expect(
    page.getByRole('heading', { name: /log in/i })
  ).toBeVisible();
  await expect(
    page.locator('form').getByRole('button', { name: /^login$/i })
  ).toBeVisible();

  await page.waitForFunction((storageKey) => {
    const persisted = window.localStorage.getItem(storageKey);
    return (
      persisted != null &&
      persisted.includes('"user":"null"') &&
      persisted.includes('"role":"null"')
    );
  }, persistedAuthStorageKey);
});
