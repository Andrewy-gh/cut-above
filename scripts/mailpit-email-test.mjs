import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const envFile = resolve(repoRoot, ".env.mailpit.local");

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
  const result = spawnSync(command, args, { stdio: "inherit", ...options });
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
delete env.EMAIL_DELIVERY_MODE;

let exitCode = 0;
try {
  run("docker", ["compose", "up", "-d", "mailpit"], { env, cwd: repoRoot });
  run(
    "pnpm",
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
  spawnSync("docker", ["compose", "down"], { stdio: "inherit", env, cwd: repoRoot });
}

process.exit(exitCode);
