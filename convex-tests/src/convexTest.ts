/// <reference types="vite/client" />

import { convexTest } from 'convex-test';
import { register as registerBetterAuth } from '@convex-dev/better-auth/test';

import schema from '../../convex/schema';

if (!process.env.SITE_URL) {
  process.env.SITE_URL = 'http://localhost:5173';
}

if (!process.env.CONVEX_SITE_URL) {
  process.env.CONVEX_SITE_URL = 'http://localhost:3210';
}

const modules = import.meta.glob('../../convex/**/*.{ts,js}');

export const createConvexTest = () => {
  const t = convexTest(schema, modules);
  registerBetterAuth(t);
  return t;
};
