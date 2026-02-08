import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const envPath = resolve(repoRoot, '.env.local');

const mode = process.argv[2];
if (mode !== 'local' && mode !== 'cloud') {
  console.error('Usage: node scripts/convex-use.mjs <local|cloud>');
  process.exit(2);
}

const parseEnv = (content) => {
  const map = new Map();
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    map.set(key, value);
  }
  return map;
};

const setOrAppend = (lines, key, value) => {
  const prefix = `${key}=`;
  const idx = lines.findIndex((l) => l.startsWith(prefix));
  if (idx !== -1) {
    lines[idx] = `${key}=${value}`;
    return lines;
  }
  lines.push(`${key}=${value}`);
  return lines;
};

const raw = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
const lines = raw ? raw.split(/\r?\n/) : [];
const env = parseEnv(raw);

const get = (key) => process.env[key] ?? env.get(key) ?? '';

const defaultLocal = 'http://localhost:3210';
const deploymentUrl =
  mode === 'local'
    ? get('CONVEX_DEPLOYMENT_URL_LOCAL') || defaultLocal
    : get('CONVEX_DEPLOYMENT_URL_CLOUD');

if (!deploymentUrl) {
  console.error(
    mode === 'cloud'
      ? 'Missing CONVEX_DEPLOYMENT_URL_CLOUD. Add it to .env.local (copy from `pnpm dev:convex` output).'
      : 'Missing local deployment url.'
  );
  process.exit(1);
}

const siteUrl =
  mode === 'local'
    ? get('CONVEX_SITE_URL_LOCAL') || deploymentUrl
    : get('CONVEX_SITE_URL_CLOUD') || deploymentUrl;

setOrAppend(lines, 'CONVEX_DEPLOYMENT_URL', deploymentUrl);
setOrAppend(lines, 'CONVEX_SITE_URL', siteUrl);

// Keep file ending stable; default to CRLF on Windows.
const eol = process.platform === 'win32' ? '\r\n' : '\n';
const out = lines
  .filter((l, i) => i < lines.length - 1 || l !== '')
  .join(eol)
  .replace(/\s+$/, '');

writeFileSync(envPath, `${out}${eol}`, 'utf8');
console.info(`Set CONVEX_DEPLOYMENT_URL and CONVEX_SITE_URL for ${mode} in .env.local`);
