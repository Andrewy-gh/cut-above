import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { ConvexHttpClient } from "convex/browser";

import { api } from "../convex/_generated/api";
import {
  defaultSeedUsers,
  type SeedUserProfile,
  validateSeedProfiles,
} from "./seed-users";

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const DEFAULT_SEED_USERS_FILE = ".seed-prod.json";
const DEFAULT_SEED_PREFIX = "seed-";

type SeedMode = "dev" | "prod";

const parseEnvFile = (filePath: string) => {
  if (!existsSync(filePath)) return {};
  const content = readFileSync(filePath, "utf8");
  return content.split("\n").reduce<Record<string, string>>((acc, line) => {
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

const env = {
  ...parseEnvFile(resolve(repoRoot, "client/.env.local")),
  ...parseEnvFile(resolve(repoRoot, ".env.local")),
  ...process.env,
};

const getArgValue = (name: string) => {
  const args = process.argv.slice(2);
  const index = args.indexOf(name);
  if (index === -1) return undefined;
  return args[index + 1];
};

const resolveMode = (): SeedMode => {
  const mode = (getArgValue("--mode") ?? env.SEED_MODE ?? "dev").toLowerCase().trim();
  if (mode === "dev" || mode === "prod") return mode;
  throw new Error(`Invalid reset mode "${mode}". Use --mode dev or --mode prod.`);
};

const getDeploymentUrl = (source: Record<string, string | undefined>) =>
  source.CONVEX_DEPLOYMENT_URL ?? source.CONVEX_URL ?? source.CONVEX_HTTP_URL;

const loadProdUsers = (usersFile: string): SeedUserProfile[] => {
  const absolutePath = resolve(repoRoot, usersFile);
  if (!existsSync(absolutePath)) {
    throw new Error(
      `Missing ${usersFile}. Copy .seed-prod.example.json to ${usersFile} and update users before running seed:reset --mode prod.`
    );
  }
  const raw = readFileSync(absolutePath, "utf8");
  const parsed = JSON.parse(raw) as { users?: SeedUserProfile[] };
  if (!Array.isArray(parsed.users)) {
    throw new Error(`${usersFile} must contain { "users": [...] }`);
  }
  return validateSeedProfiles(parsed.users);
};

const resolveUsers = (mode: SeedMode) => {
  if (mode === "dev") return validateSeedProfiles(defaultSeedUsers);
  const usersFile = env.SEED_USERS_FILE ?? DEFAULT_SEED_USERS_FILE;
  return loadProdUsers(usersFile);
};

const clientEnv = parseEnvFile(resolve(repoRoot, "client/.env.local"));
const rootEnv = parseEnvFile(resolve(repoRoot, ".env.local"));
const processEnv = process.env as Record<string, string | undefined>;

const deploymentUrl =
  getDeploymentUrl(processEnv) ??
  getDeploymentUrl(rootEnv) ??
  getDeploymentUrl(clientEnv) ??
  env.CONVEX_DEPLOYMENT_URL ??
  env.CONVEX_URL ??
  env.CONVEX_HTTP_URL;

if (!deploymentUrl) {
  console.error(
    "Missing CONVEX_DEPLOYMENT_URL (or CONVEX_URL). Set it in .env.local (preferred) or client/.env.local."
  );
  process.exit(1);
}

const isCloudDeployment = deploymentUrl.includes(".convex.cloud");
if (isCloudDeployment && env.ALLOW_CLOUD_SEED !== "true") {
  console.error(
    `Refusing to reset seed data in cloud deployment (${deploymentUrl}). Set ALLOW_CLOUD_SEED=true to proceed.`
  );
  process.exit(1);
}

if (env.CONFIRM_SEED_RESET !== "true") {
  console.error(
    "Refusing to reset seed data. Set CONFIRM_SEED_RESET=true to proceed."
  );
  process.exit(1);
}

const mode = resolveMode();
const users = resolveUsers(mode);
const seedIdPrefix = (env.SEED_ID_PREFIX ?? DEFAULT_SEED_PREFIX).trim();

if (!seedIdPrefix) throw new Error("SEED_ID_PREFIX cannot be empty.");

const convex = new ConvexHttpClient(deploymentUrl);

const run = async () => {
  const result = await convex.mutation(api.seed.clearSeedData, {
    confirm: "RESET_SEED_DATA",
    idPrefix: seedIdPrefix,
    seededUserEmails: users.map((user) => user.email),
  });

  console.log("Seed reset complete:", {
    mode,
    deploymentUrl,
    idPrefix: seedIdPrefix,
    ...result,
  });
};

run().catch((error) => {
  console.error("Seed reset failed:", error);
  process.exit(1);
});
