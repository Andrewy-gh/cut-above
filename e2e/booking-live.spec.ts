import {
  expect,
  test,
  type APIRequestContext,
  type BrowserContext,
} from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { hashPassword } from 'better-auth/crypto';
import { ConvexHttpClient } from 'convex/browser';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { api } from '../convex/_generated/api';

dayjs.extend(utc);
dayjs.extend(timezone);

const REPO_ROOT = process.cwd();
const TIME_ZONE = 'America/New_York';
const BOOKING_PASSWORD = 'Playwright_Booking_123!';

const parseEnvFile = (filePath: string) => {
  try {
    return readFileSync(filePath, 'utf8').split('\n').reduce<Record<string, string>>((acc, line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return acc;
      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) return acc;
      const key = trimmed.slice(0, separatorIndex).trim();
      const value = trimmed.slice(separatorIndex + 1).trim();
      acc[key] = value;
      return acc;
    }, {});
  } catch {
    return {};
  }
};

const getConvexDeploymentUrl = () => {
  const rootEnv = parseEnvFile(resolve(REPO_ROOT, '.env.local'));
  const clientEnv = parseEnvFile(resolve(REPO_ROOT, 'client/.env.local'));

  return (
    process.env.CONVEX_DEPLOYMENT_URL ??
    process.env.CONVEX_URL ??
    rootEnv.CONVEX_DEPLOYMENT_URL ??
    rootEnv.CONVEX_URL ??
    clientEnv.CONVEX_DEPLOYMENT_URL ??
    clientEnv.CONVEX_URL
  );
};

const getConvexSiteUrl = () => {
  const rootEnv = parseEnvFile(resolve(REPO_ROOT, '.env.local'));
  const clientEnv = parseEnvFile(resolve(REPO_ROOT, 'client/.env.local'));

  return (
    process.env.CONVEX_SITE_URL ??
    rootEnv.CONVEX_SITE_URL ??
    clientEnv.CONVEX_SITE_URL ??
    getConvexDeploymentUrl()
  );
};

const nextBookableBusinessDate = () => {
  let candidate = dayjs().tz(TIME_ZONE).add(2, 'day').startOf('day');
  while (candidate.day() === 0 || candidate.day() === 6) {
    candidate = candidate.add(1, 'day');
  }
  return candidate.format('YYYY-MM-DD');
};

const toIso = (date: string, time: string) =>
  dayjs.tz(`${date} ${time}`, 'YYYY-MM-DD HH:mm', TIME_ZONE).toISOString();

const createBookingFixture = async () => {
  const deploymentUrl = getConvexDeploymentUrl();
  if (!deploymentUrl) {
    throw new Error('Missing CONVEX_DEPLOYMENT_URL for live booking e2e.');
  }

  const convex = new ConvexHttpClient(deploymentUrl);
  const runId = `${Date.now()}`;
  const employeeFirstName = `PW${runId.slice(-4)}`;
  const employeeLastName = 'Barber';
  const clientFirstName = `Client${runId.slice(-4)}`;
  const clientLastName = 'Booking';
  const employeeEmail = `playwright.booking.employee.${runId}@cutabove.test`;
  const clientEmail = `playwright.booking.client.${runId}@cutabove.test`;
  const passwordHash = await hashPassword(BOOKING_PASSWORD);
  const date = nextBookableBusinessDate();

  const createUser = async (input: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }) => {
    const name = `${input.firstName} ${input.lastName}`;
    const authUser = await convex.mutation(api.seed.ensureAuthUser, {
      name,
      email: input.email,
      passwordHash,
    });

    await convex.mutation(api.seed.ensureAppUser, {
      authId: authUser.id,
      name,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      role: input.role,
    });

    return authUser.id;
  };

  await createUser({
    email: employeeEmail,
    firstName: employeeFirstName,
    lastName: employeeLastName,
    role: 'employee',
  });

  await convex.mutation(api.seed.ensureSchedule, {
    id: `playwright-booking-${date}`,
    date,
    open: toIso(date, '10:00'),
    close: toIso(date, '14:00'),
  });

  return {
    date,
    displayDate: dayjs.tz(date, TIME_ZONE).format('MM/DD/YYYY'),
    employeeFirstName,
    clientEmail,
    clientPassword: BOOKING_PASSWORD,
    clientFirstName,
    clientLastName,
  };
};

const waitForAuthSiteReady = async () => {
  const siteUrl = getConvexSiteUrl();
  if (!siteUrl) {
    throw new Error('Missing CONVEX_SITE_URL for live booking e2e.');
  }

  const deadline = Date.now() + 30_000;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${siteUrl}/api/auth/get-session`, {
        redirect: 'manual',
      });
      if (response.status < 500) {
        return;
      }
      lastError = new Error(`Auth site returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await new Promise((resolveReady) => setTimeout(resolveReady, 1_000));
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Convex auth site did not become ready in time.');
};

const parseCookieFromSetCookieHeader = (setCookieHeader: string | null) => {
  if (!setCookieHeader) {
    throw new Error('Missing auth cookie from Better Auth response.');
  }

  const [cookiePair] = setCookieHeader.split(';', 1);
  const separatorIndex = cookiePair.indexOf('=');
  if (separatorIndex === -1) {
    throw new Error(`Malformed auth cookie header: ${setCookieHeader}`);
  }

  return {
    name: cookiePair.slice(0, separatorIndex),
    value: cookiePair.slice(separatorIndex + 1),
  };
};

const signUpClientSession = async (
  request: APIRequestContext,
  context: BrowserContext,
  fixture: Awaited<ReturnType<typeof createBookingFixture>>
) => {
  const siteUrl = getConvexSiteUrl();
  const deploymentUrl = getConvexDeploymentUrl();
  if (!siteUrl || !deploymentUrl) {
    throw new Error('Missing Convex auth URLs for live booking e2e.');
  }

  const name = `${fixture.clientFirstName} ${fixture.clientLastName}`;
  const signUpResponse = await request.post(
    `${siteUrl}/api/auth/sign-up/email`,
    {
      data: {
        email: fixture.clientEmail,
        password: fixture.clientPassword,
        name,
      },
    }
  );

  expect(signUpResponse.ok()).toBe(true);
  const authCookie = parseCookieFromSetCookieHeader(
    signUpResponse.headers()['set-cookie'] ?? null
  );
  await context.addCookies([
    {
      name: authCookie.name,
      value: authCookie.value,
      domain: 'localhost',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    },
  ]);

  const payload = (await signUpResponse.json()) as { user: { id: string } };

  const convex = new ConvexHttpClient(deploymentUrl);
  await convex.mutation(api.seed.ensureAppUser, {
    authId: payload.user.id,
    name,
    firstName: fixture.clientFirstName,
    lastName: fixture.clientLastName,
    email: fixture.clientEmail,
    role: 'client',
  });
};

test('real Convex booking flow', async ({ page, context, request }) => {
  test.setTimeout(60_000);

  const fixture = await createBookingFixture();
  await waitForAuthSiteReady();
  await signUpClientSession(request, context, fixture);

  await page.setViewportSize({ width: 390, height: 844 });

  await page.goto('/bookings');
  await expect(
    page.getByRole('heading', { name: /book your appointment/i })
  ).toBeVisible();

  await page.getByRole('combobox', { name: /choose a barber/i }).click();
  await page.getByRole('option', { name: fixture.employeeFirstName }).click();

  await page.getByRole('combobox', { name: /choose a service/i }).click();
  await page.getByRole('option', { name: /^Haircut/i }).click();

  const dateInput = page.getByLabel(/pick a date/i);
  await dateInput.fill(fixture.displayDate);
  await dateInput.press('Tab');

  const timeSlotButton = page
    .getByRole('button', { name: /\d{1,2}:\d{2}(am|pm)/i })
    .first();
  await expect(timeSlotButton).toBeVisible({ timeout: 10000 });
  await timeSlotButton.click();

  await expect(
    page.getByRole('heading', { name: /complete your booking/i })
  ).toBeVisible();
  await page.getByRole('button', { name: /book now/i }).click();

  await expect(page.getByRole('alert')).toContainText(
    'Appointment successfully created'
  );
});
