import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';
import { readdirSync, statSync } from 'node:fs';

// Peso de las fotos de las fichas, para el texto de «Usar sin conexión».
const DIR_FOTOS = new URL('./public/fotos/', import.meta.url);
let bytesFotos = 0;
try { for (const f of readdirSync(DIR_FOTOS)) bytesFotos += statSync(new URL(f, DIR_FOTOS)).size; } catch { /* sin fotos */ }
const MB_FOTOS = Math.max(1, Math.round(bytesFotos / 1e6));

// PWA estática y offline-first. Sin servidor. Siempre precacheado: la app, las fichas con sus avisos
// y los gnomos. Las fotos de las fichas, solo con «Usar sin conexión» (src/descarga.js).
export default defineConfig({
  define: { __MB_FOTOS__: JSON.stringify(MB_FOTOS) },
  plugins: [
    preact(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false, // lo registramos en src/main.jsx (sin scripts inline: CSP estricta)
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'icono.svg'],
      manifest: {
        id: '/',
        name: 'Setas de Saceruela',
        short_name: 'Setas',
        description: 'Fotografía setas, completa tu Micodex y colecciona gnomos. Jornadas Micológicas de Saceruela.',
        lang: 'es',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#0B1A1F',
        background_color: '#0B1A1F',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        // App, catálogo (va dentro del JS), gnomos e iconos: siempre. Las fotos de las fichas, no.
        globPatterns: ['**/*.{js,css,html,svg,png,webp,jpg,json,woff2,ico}'],
        globIgnores: ['fotos/**'],
        // Fotos de las fichas: primero la caché de «Usar sin conexión»; si no están, de la red y SIN
        // guardarlas (con el interruptor en «No» no se descarga nada). Mismo nombre que FOTOS en src/descarga.js.
        runtimeCaching: [
          {
            urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.startsWith('/fotos/'),
            handler: 'CacheFirst',
            options: { cacheName: 'setas-fotos', plugins: [{ cacheWillUpdate: async () => null }] }
          }
        ],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        // Que la primera visita quede ya controlada por el SW (si no, «Descargar para el monte» no se completa hasta recargar).
        clientsClaim: true,
        skipWaiting: true
      }
    })
  ],
  build: {
    target: 'es2019', // móviles viejos
    sourcemap: false
  }
});
