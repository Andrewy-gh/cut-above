import { spawnSync } from "node:child_process";

const isWindows = process.platform === "win32";

const run = (cmd, args, options = {}) => {
  const result = spawnSync(cmd, args, {
    stdio: "inherit",
    shell: isWindows,
    ...options,
  });

  if (result.error) {
    console.error(result.error);
    process.exit(1);
  }

  const status = result.status ?? 1;
  if (status !== 0) {
    process.exit(status);
  }
};

const required = {
  SITE_URL: process.env.SITE_URL ?? "",
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ?? "",
};

const emailUser = process.env.EMAIL_USER ?? "";
const emailService = process.env.EMAIL_SERVICE ?? "";
const emailPassword = process.env.EMAIL_PASSWORD ?? "";
const emailHost = process.env.EMAIL_HOST ?? "";
const emailPort = process.env.EMAIL_PORT ?? "";
const emailSecure = process.env.EMAIL_SECURE ?? "";
const emailDeliveryMode = (process.env.EMAIL_DELIVERY_MODE ?? "log")
  .toLowerCase()
  .trim();
const loggingOnlyMode = emailDeliveryMode === "log";

const missingRequired = Object.entries(required)
  .filter(([, value]) => !value)
  .map(([key]) => key);

if (missingRequired.length > 0) {
  console.error(
    [
      "Missing required environment variables for production deploy:",
      ...missingRequired.map((key) => `- ${key}`),
      "",
      "Set them in your shell, then re-run `pnpm deploy:prod`.",
    ].join("\n")
  );
  process.exit(1);
}

const usingServiceConfig = Boolean(emailService);
const usingHostConfig = Boolean(emailHost);

if (!loggingOnlyMode && !emailUser) {
  console.error("EMAIL_USER is required unless EMAIL_DELIVERY_MODE=log.");
  process.exit(1);
}

if (!loggingOnlyMode && !usingServiceConfig && !usingHostConfig) {
  console.error(
    [
      "Email config missing. Provide one of:",
      "- EMAIL_SERVICE + EMAIL_PASSWORD",
      "- EMAIL_HOST (+ optional EMAIL_PORT/EMAIL_SECURE/EMAIL_PASSWORD)",
    ].join("\n")
  );
  process.exit(1);
}

if (!loggingOnlyMode && usingServiceConfig && !usingHostConfig && !emailPassword) {
  console.error("EMAIL_PASSWORD is required when EMAIL_SERVICE is set.");
  process.exit(1);
}

const runGate = () => {
  console.info("Running preflight gate...");
  run("pnpm", ["install", "--frozen-lockfile"]);
  run("pnpm", ["lint"]);
  run("pnpm", ["typecheck"]);
  run("pnpm", ["test:run"]);
  run("pnpm", ["build"]);
};

const setProdEnv = () => {
  console.info("Setting Convex production env...");

  const envPairs = [
    ["SITE_URL", required.SITE_URL],
    ["BETTER_AUTH_SECRET", required.BETTER_AUTH_SECRET],
    ["EMAIL_DELIVERY_MODE", emailDeliveryMode],
  ];

  if (emailUser) {
    envPairs.push(["EMAIL_USER", emailUser]);
  }

  if (!loggingOnlyMode && usingServiceConfig) {
    envPairs.push(["EMAIL_SERVICE", emailService], ["EMAIL_PASSWORD", emailPassword]);
  }

  if (!loggingOnlyMode && usingHostConfig) {
    envPairs.push(["EMAIL_HOST", emailHost]);
    if (emailPort) envPairs.push(["EMAIL_PORT", emailPort]);
    if (emailSecure) envPairs.push(["EMAIL_SECURE", emailSecure]);
    if (emailPassword) envPairs.push(["EMAIL_PASSWORD", emailPassword]);
  }

  for (const [key, value] of envPairs) {
    run("pnpm", ["exec", "convex", "env", "set", key, value, "--prod"]);
  }
};

const deployConvex = () => {
  console.info("Deploying Convex to production...");
  run("pnpm", ["exec", "convex", "deploy", "-y"]);
};

runGate();
setProdEnv();
deployConvex();

console.info("Production backend deploy complete.");
console.info(
  "Next: set frontend host env CONVEX_DEPLOYMENT_URL and CONVEX_SITE_URL to your production Convex values."
);
