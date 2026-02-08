import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn, spawnSync } from 'node:child_process';
import net from 'node:net';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const isWindows = process.platform === 'win32';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const parseEnvFile = (filePath) => {
  if (!existsSync(filePath)) return {};
  const content = readFileSync(filePath, 'utf8');
  return content.split(/\r?\n/).reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return acc;
    const idx = trimmed.indexOf('=');
    if (idx === -1) return acc;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim();
    acc[key] = value;
    return acc;
  }, {});
};

const mailpitEnvFileLocal = resolve(repoRoot, '.env.mailpit.local');
const mailpitEnvFileExample = resolve(repoRoot, '.env.mailpit.example');
const mailpitEnv = {
  ...parseEnvFile(mailpitEnvFileExample),
  ...parseEnvFile(mailpitEnvFileLocal),
};

const mailpitUrl = mailpitEnv.MAILPIT_URL || 'http://localhost:8025';
const emailHost = mailpitEnv.EMAIL_HOST || '127.0.0.1';
const emailPort = mailpitEnv.EMAIL_PORT || '1025';
const emailSecure = mailpitEnv.EMAIL_SECURE || 'false';
const emailUser = mailpitEnv.EMAIL_USER || 'no-reply@cutabove.local';

const args = process.argv.slice(2);
const backendOnly = args.includes('--backend-only');
const siteUrlArgIndex = args.findIndex((arg) => arg === '--site-url');
const siteUrl =
  (siteUrlArgIndex !== -1 ? args[siteUrlArgIndex + 1] : undefined) ||
  process.env.SITE_URL ||
  'http://localhost:5173';

const run = (cmd, cmdArgs, env = process.env, { allowFailure = false } = {}) => {
  const result = spawnSync(cmd, cmdArgs, {
    stdio: 'inherit',
    shell: isWindows,
    cwd: repoRoot,
    env,
  });
  if (result.error) {
    console.error(result.error);
  }
  if (!allowFailure && (result.status ?? 0) !== 0) {
    process.exit(result.status ?? 1);
  }
  return result.status ?? 0;
};

// Ensure the client points at the local Convex URL (defaults to http://localhost:3210).
run('pnpm', ['convex:use:local']);

// Bring up Mailpit.
run('docker', ['compose', 'up', '-d', 'mailpit']);

const envLocalFile = resolve(repoRoot, '.env.local');
const envLocal = parseEnvFile(envLocalFile);
const convexUrl = envLocal.CONVEX_DEPLOYMENT_URL || 'http://localhost:3210';

const childEnv = {
  ...process.env,
  SITE_URL: siteUrl,
  EMAIL_HOST: emailHost,
  EMAIL_PORT: String(emailPort),
  EMAIL_SECURE: String(emailSecure),
  EMAIL_USER: emailUser,
  // Ensure we don't accidentally stay in `log` mode.
  EMAIL_DELIVERY_MODE: 'smtp',
};

console.info(`Mailpit UI: ${mailpitUrl}`);
console.info(`SMTP: ${emailHost}:${emailPort}`);
console.info(`SITE_URL: ${siteUrl}`);
console.info(`Convex URL (client): ${convexUrl}`);

const children = [];

const spawnLong = (cmd, cmdArgs) => {
  const child = spawn(cmd, cmdArgs, {
    stdio: 'inherit',
    shell: isWindows,
    cwd: repoRoot,
    env: childEnv,
  });
  children.push(child);
  return child;
};

const waitForTcp = async (url, timeoutMs = 120_000) => {
  const parsed = new URL(url);
  const host = parsed.hostname;
  const port = Number(parsed.port || (parsed.protocol === 'https:' ? '443' : '80'));
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const ok = await new Promise((resolve) => {
      const socket = net.connect({ host, port });
      socket.once('connect', () => {
        socket.end();
        resolve(true);
      });
      socket.once('error', () => {
        resolve(false);
      });
      socket.setTimeout(500, () => {
        socket.destroy();
        resolve(false);
      });
    });

    if (ok) return true;
    await sleep(500);
  }
  return false;
};

// Start Convex dev (prefer local dev deployment).
// This may prompt on first run.
spawnLong('pnpm', ['dev:convex:local']);

// Wait for the local Convex backend to actually start listening.
// If it never comes up (e.g. waiting for interactive config), the client can look "logged in"
// from persisted state while auth calls (like sign out) fail with NetworkError.
const isConvexUp = await waitForTcp(convexUrl);
if (!isConvexUp) {
  console.warn(
    `Warning: Convex is not reachable at ${convexUrl} yet. If you see auth/network errors, finish Convex config and restart.`
  );
}

// Best-effort: set Convex runtime env for Mailpit once Convex is reachable.
// If Convex isn't configured yet, this will keep failing until you complete the prompt.
for (let attempt = 1; attempt <= 30; attempt += 1) {
  const status = run('pnpm', ['dev:setup:mailpit', '--', '--site-url', siteUrl], childEnv, {
    allowFailure: true,
  });
  if (status === 0) break;
  await sleep(1000);
}

if (!backendOnly) {
  spawnLong('pnpm', ['-C', 'client', 'dev']);
}

const shutdown = () => {
  for (const child of children) {
    try {
      child.kill();
    } catch {
      // ignore
    }
  }
  spawnSync('docker', ['compose', 'down'], {
    stdio: 'inherit',
    shell: isWindows,
    cwd: repoRoot,
  });
};

process.on('SIGINT', () => {
  shutdown();
  process.exit(0);
});
process.on('SIGTERM', () => {
  shutdown();
  process.exit(0);
});
