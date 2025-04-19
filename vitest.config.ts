/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { URL, fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue'],
  },
  test: {
    globals: true,
    environment: 'node',
  },
});
