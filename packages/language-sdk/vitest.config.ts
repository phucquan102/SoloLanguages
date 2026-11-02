import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'language-sdk',
    include: ['test/**/*.test.ts'],
  },
});
