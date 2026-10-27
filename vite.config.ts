import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/soccer': {
          target: 'https://worldcup26.ir',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api\/soccer/, '/get/soccer'),
          headers: {
            'User-Agent': 'MatchBay/1.0',
            'Accept': 'application/json',
          },
          configure: (proxy) => {
            proxy.on('error', (err, _req, res) => {
              console.warn('[Vite Proxy] Error proxying to worldcup26.ir:', err.message);
              if (res && 'writeHead' in res && !(res as any).headersSent) {
                (res as any).writeHead(502, { 'Content-Type': 'application/json' });
                (res as any).end(JSON.stringify({ error: 'Proxy upstream unavailable', details: err.message }));
              }
            });
          },
        },
      },
    },
  };
});
