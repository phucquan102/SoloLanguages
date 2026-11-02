import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'literal-check',
    include: ['test/**/*.test.ts'],
  },
});
