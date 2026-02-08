import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const envFile = resolve(repoRoot, ".env.mailpit.local");
const isWindows = process.platform === "win32";
// On Windows, `pnpm` is typically a `.cmd` shim and requires `shell: true`.
const pnpmCmd = "pnpm";
const dockerCmd = isWindows ? "docker.exe" : "docker";

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

const run = (command, args, options = {}) => {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: isWindows,
    ...options,
  });
  if (result.error) {
    // `stdio: inherit` won't print spawn errors (like command-not-found) nicely.
    console.error(result.error);
  }
  if (result.status !== 0) {
    const error = new Error(`${command} ${args.join(" ")} failed`);
    error.exitCode = result.status ?? 1;
    throw error;
  }
};

const env = {
  ...process.env,
  ...parseEnvFile(envFile),
};

if (!existsSync(envFile)) {
  console.warn(
    "Missing .env.mailpit.local. Falling back to MAILPIT_URL/EMAIL_HOST defaults."
  );
}

env.MAILPIT_URL = env.MAILPIT_URL ?? "http://localhost:8025";
env.EMAIL_HOST = env.EMAIL_HOST ?? "127.0.0.1";
env.EMAIL_PORT = env.EMAIL_PORT ?? "1025";
env.EMAIL_SECURE = env.EMAIL_SECURE ?? "false";
// Mailpit doesn't require auth, but nodemailer still wants a `from` address.
env.EMAIL_USER = env.EMAIL_USER ?? "no-reply@cutabove.local";
delete env.EMAIL_DELIVERY_MODE;

let exitCode = 0;
try {
  run(dockerCmd, ["compose", "up", "-d", "mailpit"], { env, cwd: repoRoot });
  run(
    pnpmCmd,
    [
      "-C",
      "convex-tests",
      "exec",
      "vitest",
      "run",
      "src/emailOutbox.mailpit.test.ts",
    ],
    { env, cwd: repoRoot }
  );
} catch (error) {
  exitCode = error.exitCode ?? 1;
} finally {
  spawnSync(dockerCmd, ["compose", "down"], {
    stdio: "inherit",
    shell: isWindows,
    env,
    cwd: repoRoot,
  });
}

process.exit(exitCode);
