import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

// Set environment variables BEFORE any other imports
process.env.NODE_ENV = 'test';
process.env.DOTENV_CONFIG_PATH = resolve(__dirname, '.env.test');

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
