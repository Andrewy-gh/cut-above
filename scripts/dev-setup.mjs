import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const siteArgIndex = args.findIndex((arg) => arg === "--site-url");
const siteUrl =
  (siteArgIndex !== -1 ? args[siteArgIndex + 1] : undefined) ||
  process.env.SITE_URL ||
  "http://localhost:5173";

if (!siteUrl) {
  console.error("Missing SITE_URL. Pass --site-url or set SITE_URL.");
  process.exit(1);
}

const pnpmCommand = process.platform === "win32" ? "pnpm.cmd" : "pnpm";

const result = spawnSync(
  pnpmCommand,
  ["dlx", "convex", "env", "set", "SITE_URL", siteUrl],
  { stdio: "inherit" }
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
