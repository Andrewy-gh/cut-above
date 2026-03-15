import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "..");
const envExample = resolve(repoRoot, ".env.resend.example");
const envLocal = resolve(repoRoot, ".env.resend.local");

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

const env = {
  ...parseEnvFile(envExample),
  ...parseEnvFile(envLocal),
  ...process.env,
};

const apiKey = env.RESEND_API_KEY;
const from = env.RESEND_FROM;
const to = getArgValue("--to") || env.RESEND_TO;
const subject =
  getArgValue("--subject") ||
  `Cut Above Resend smoke test ${new Date().toISOString()}`;
const text =
  getArgValue("--text") ||
  [
    "This is a direct Resend smoke test from cut-above.",
    `Sent at: ${new Date().toISOString()}`,
  ].join("\n");

const missing = [
  ["RESEND_API_KEY", apiKey],
  ["RESEND_FROM", from],
  ["RESEND_TO or --to", to],
].filter(([, value]) => !value);

if (missing.length > 0) {
  console.error("Missing required Resend smoke-test config:");
  for (const [key] of missing) {
    console.error(`- ${key}`);
  }
  console.error("");
  console.error("Create .env.resend.local from .env.resend.example or pass --to.");
  process.exit(1);
}

const response = await fetch("https://api.resend.com/emails", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    from,
    to: [to],
    subject,
    text,
  }),
});

const body = await response.text();
if (!response.ok) {
  console.error(`Resend request failed: ${response.status} ${body}`);
  process.exit(1);
}

let messageId = "";
try {
  const parsed = JSON.parse(body);
  messageId = typeof parsed?.id === "string" ? parsed.id : "";
} catch {
  // Ignore parse failures and still print the raw response below.
}

console.info("Resend smoke test sent successfully.");
if (messageId) console.info(`messageId: ${messageId}`);
if (body) console.info(body);
