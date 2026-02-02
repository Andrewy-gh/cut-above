import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dns from 'dns';

dns.setDefaultResultOrder('verbatim');

const convexDeploymentUrl = process.env.CONVEX_DEPLOYMENT_URL ?? '';

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    'import.meta.env.CONVEX_DEPLOYMENT_URL':
      JSON.stringify(convexDeploymentUrl),
  },
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    fs: {
      allow: ['..'],
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
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
