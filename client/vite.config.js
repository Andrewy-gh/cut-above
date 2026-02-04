import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import dns from 'dns';

dns.setDefaultResultOrder('verbatim');

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const convexDeploymentUrl = env.CONVEX_DEPLOYMENT_URL ?? '';
  const convexSiteUrl = env.CONVEX_SITE_URL ?? '';

  return {
    define: {
      'import.meta.env.CONVEX_DEPLOYMENT_URL':
        JSON.stringify(convexDeploymentUrl),
      'import.meta.env.CONVEX_SITE_URL': JSON.stringify(convexSiteUrl),
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
  };
});
