/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// Written by Aishiki
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
  },
})*/
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true, // Active les variables globales de vitest (comme vi)
    environment: 'jsdom', // Utilise jsdom pour simuler un environnement DOM
    setupFiles: './src/setupTests.js', // Fichier de configuration pour les tests
  },
});

