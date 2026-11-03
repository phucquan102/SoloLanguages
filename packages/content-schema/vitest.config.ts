import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'content-schema',
    include: ['test/**/*.test.ts'],
  },
});
