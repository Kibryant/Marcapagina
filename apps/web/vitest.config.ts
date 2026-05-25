import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    // Os specs em e2e/ são Playwright, não Vitest — pular.
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'],
  },
  resolve: {
    alias: {
      '@marcapagina/shared': path.resolve(
        __dirname,
        '../../packages/shared/index.ts'
      ),
    },
  },
});
