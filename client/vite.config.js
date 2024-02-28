import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dns from 'dns';

dns.setDefaultResultOrder('verbatim');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: '3000',
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  optimizeDeps: {
    include: [
      'prop-types',
      // eslint-disable-next-line no-undef
      process.env.NODE_ENV === 'production' ? undefined : 'prop-types',
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'mui-x-date-pickers': ['@mui/x-date-pickers'],
          'mui-x-date-pickers-pro': ['@mui/x-date-pickers-pro'],
        },
      },
    },
  },
});
