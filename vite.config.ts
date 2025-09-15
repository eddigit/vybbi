import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Vybbi - La plateforme qui connecte les talents',
        short_name: 'Vybbi',
        description: 'Plateforme de gestion des agents, tourneurs et apporteurs d\'affaires dans l\'industrie musicale',
        theme_color: '#0F1419',
        background_color: '#0F1419',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/lovable-uploads/7c8bbe7e-fcc0-4a02-b295-fd73a7ca614c.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/lovable-uploads/7c8bbe7e-fcc0-4a02-b295-fd73a7ca614c.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.vybbi\.com\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'vybbi-api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 300 // 5 minutes
              }
            }
          },
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\//,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'supabase-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 600 // 10 minutes
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: false
      }
    })
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
