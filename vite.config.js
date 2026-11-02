import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Image paths in the code are written as PUBLIC_URL + '/images/...'.
  // The site is served from the domain root, so that prefix is empty.
  define: { 'process.env.PUBLIC_URL': JSON.stringify('') },
  build: {
    // Keep the old Create React App folder name so the 404 copy and
    // `npm run deploy` (gh-pages -d build) work unchanged.
    outDir: 'build',
  },
  server: { port: 3000 },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js',
  },
});
