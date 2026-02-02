import { defineApp } from "convex/server";

const app = defineApp();

export const convexEnv = {
  deployment: process.env.CONVEX_DEPLOYMENT,
  url: process.env.CONVEX_URL,
};

export default app;
