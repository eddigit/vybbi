/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { VitePWA } from 'vite-plugin-pwa';
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true, // Écoute sur toutes les interfaces réseau (localhost, 127.0.0.1, etc.)
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
    chunkSizeWarningLimit: 1000,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production'
      }
    },
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom'],
          radix: [
            '@radix-ui/react-accordion', '@radix-ui/react-alert-dialog', '@radix-ui/react-aspect-ratio',
            '@radix-ui/react-avatar', '@radix-ui/react-checkbox', '@radix-ui/react-collapsible',
            '@radix-ui/react-context-menu', '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-hover-card', '@radix-ui/react-label', '@radix-ui/react-menubar',
            '@radix-ui/react-navigation-menu', '@radix-ui/react-popover', '@radix-ui/react-progress',
            '@radix-ui/react-radio-group', '@radix-ui/react-scroll-area', '@radix-ui/react-select',
            '@radix-ui/react-separator', '@radix-ui/react-slider', '@radix-ui/react-slot',
            '@radix-ui/react-switch', '@radix-ui/react-tabs', '@radix-ui/react-toast',
            '@radix-ui/react-toggle', '@radix-ui/react-toggle-group', '@radix-ui/react-tooltip'
          ],
          tanstack: ['@tanstack/react-query', '@tanstack/react-query-devtools'],
          supabase: ['@supabase/supabase-js'],
          solana: [
            '@solana/web3.js', '@solana/wallet-adapter-react', '@solana/wallet-adapter-base',
            '@solana/wallet-adapter-phantom', '@solana/wallet-adapter-react-ui'
          ]
        }
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
        runtimeCaching: [
          // Cache des bundles JS avec NetworkFirst pour garantir la dernière version
          {
            urlPattern: /\/assets\/.*\.js$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'js-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 // 1 jour
              },
              networkTimeoutSeconds: 3 // Fallback au cache après 3s
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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
}));
