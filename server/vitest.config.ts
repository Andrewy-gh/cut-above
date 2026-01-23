import { defineConfig } from 'vitest/config';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

// Set environment variables BEFORE any other imports
process.env.NODE_ENV = 'test';
const rootDir = fileURLToPath(new URL('.', import.meta.url));
process.env.DOTENV_CONFIG_PATH = resolve(rootDir, '.env.test');

// Now load dotenv with the config path
import { config } from 'dotenv';
config({ path: process.env.DOTENV_CONFIG_PATH });

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: [],
    // Run tests serially to avoid database conflicts
    fileParallelism: false,
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
  },
});
