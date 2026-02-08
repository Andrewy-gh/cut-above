import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const envLocal = resolve(repoRoot, ".env.mailpit.local");
const envExample = resolve(repoRoot, ".env.mailpit.example");
const isWindows = process.platform === "win32";

const parseEnvFile = (filePath) => {
  if (!existsSync(filePath)) return {};
  const content = readFileSync(filePath, "utf8");
  return content.split("\n").reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) return acc;
    const index = trimmed.indexOf("=");
    if (index === -1) return acc;
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    acc[key] = value;
    return acc;
  }, {});
};

const args = process.argv.slice(2);
const getArgValue = (name) => {
  const idx = args.findIndex((arg) => arg === name);
  return idx !== -1 ? args[idx + 1] : undefined;
};

const siteUrl = getArgValue("--site-url") || process.env.SITE_URL || "http://localhost:5173";

const mailpitEnv = {
  ...parseEnvFile(envExample),
  ...parseEnvFile(envLocal),
};

const emailHost = mailpitEnv.EMAIL_HOST || "127.0.0.1";
const emailPort = mailpitEnv.EMAIL_PORT || "1025";
const emailSecure = mailpitEnv.EMAIL_SECURE || "false";
const emailUser = mailpitEnv.EMAIL_USER || "no-reply@cutabove.local";

const run = (cmd, cmdArgs) => {
  const result = spawnSync(cmd, cmdArgs, { stdio: "inherit", shell: isWindows });
  if (result.error) {
    console.error(result.error);
  }
  if ((result.status ?? 0) !== 0) {
    process.exit(result.status ?? 1);
  }
};

// Set Convex runtime env vars for local dev:
// - SITE_URL for link generation
// - SMTP settings pointing at Mailpit
// - EMAIL_DELIVERY_MODE forced off of "log"
run("pnpm", ["dlx", "convex", "env", "set", "SITE_URL", siteUrl]);
run("pnpm", ["dlx", "convex", "env", "set", "EMAIL_HOST", emailHost]);
run("pnpm", ["dlx", "convex", "env", "set", "EMAIL_PORT", String(emailPort)]);
run("pnpm", ["dlx", "convex", "env", "set", "EMAIL_SECURE", String(emailSecure)]);
run("pnpm", ["dlx", "convex", "env", "set", "EMAIL_USER", emailUser]);
run("pnpm", ["dlx", "convex", "env", "set", "EMAIL_DELIVERY_MODE", "smtp"]);

