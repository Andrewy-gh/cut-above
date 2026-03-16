export const CONVEX_DEPLOYMENT_URL =
  (import.meta.env.CONVEX_DEPLOYMENT_URL as string | undefined) ?? "";

export const CONVEX_SITE_URL =
  (import.meta.env.CONVEX_SITE_URL as string | undefined) ?? "";

const FALLBACK_URL =
  import.meta.env.MODE === "test" ? "http://localhost:3210" : "";

export const CONVEX_URL = CONVEX_DEPLOYMENT_URL || FALLBACK_URL;
