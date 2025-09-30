import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  define: {
    // Fix buffer issue for Solana web3.js
    global: 'globalThis',
  },
  optimizeDeps: {
    include: ['buffer'],
  },
  build: {
    // Optimisations pour réduire la taille des bundles
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les vendors les plus lourds
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
          'query-vendor': ['@tanstack/react-query'],
          'form-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'chart-vendor': ['recharts'],
          'solana-vendor': ['@solana/web3.js'],
        }
      }
    },
    // Augmenter la limite d'avertissement
    chunkSizeWarningLimit: 1000,
    // Minification optimisée
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production'
      }
    }
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    VitePWA({
      registerType: 'prompt',
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
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        // Augmenter la limite pour les gros bundles
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Exclure les très gros fichiers du precache
        globIgnores: ['**/assets/index-*.js'],
        runtimeCaching: [
          // Cache des bundles JS principaux avec une stratégie plus sûre (StaleWhileRevalidate)
          {
            urlPattern: /\/assets\/index-.*\.js$/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'js-bundle-cache',
              expiration: {
                maxEntries: 5,
                maxAgeSeconds: 60 * 60 * 24 * 7 // 1 semaine
              }
            }
          },
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
    dedupe: ["react", "react-dom"],
  },
}));
