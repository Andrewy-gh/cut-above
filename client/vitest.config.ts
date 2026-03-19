import { resolve } from 'node:path';
import { configDefaults, defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: [...configDefaults.exclude, '**/opensrc/**'],
  },
  resolve: {
    alias: {
      '@': '/src',
      '@cut-above/shared': resolve(__dirname, '../shared/src/index.ts'),
    },
  },
});
