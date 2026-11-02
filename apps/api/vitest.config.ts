import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Resolves the path aliases declared in tsconfig.json, including the ones
  // added by `nest g library`. Requires Vite 8, which ships this option.
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.spec.ts'],
    // `pnpm test` roda junto com o web, e cada arquivo migra um PGlite do zero.
    hookTimeout: 60_000,
    testTimeout: 30_000,
  },
});
