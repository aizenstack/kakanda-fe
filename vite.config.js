import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, 
      },
      manifest: {
        name: 'Sistem Koperasi Terpadu',
        short_name: 'SIKOTER',
        description: 'Point of Sale Application',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icon1.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon2.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon3.png',
            sizes: '180x180',  
            type: 'image/png'
          }
        ]
      }
    })
  ],
  server: {
    host: true,
    https: true,
  }
})