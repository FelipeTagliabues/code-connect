import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    // Cada arquivo migra um PGlite do zero antes do primeiro teste.
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
});
