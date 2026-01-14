import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dns from 'dns';

dns.setDefaultResultOrder('verbatim');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
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
