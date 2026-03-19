import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const loadOptionalEnvFile = (fileName: string) => {
  const filePath = resolve(repoRoot, fileName);
  if (!existsSync(filePath)) return;

  const content = readFileSync(filePath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    if (!key || process.env[key] !== undefined) continue;

    process.env[key] = trimmed.slice(separatorIndex + 1).trim();
  }
};

loadOptionalEnvFile('.env.mailpit');
loadOptionalEnvFile('.env.mailpit.local');

export default defineConfig({
  resolve: {
    alias: {
      '@cut-above/shared': resolve(repoRoot, 'shared/src/index.ts'),
    },
  },
  test: {
    environment: 'edge-runtime',
    server: {
      deps: {
        inline: ['convex-test'],
      },
    },
  },
});
