import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'lang-fixture',
    include: ['test/**/*.test.ts'],
  },
});
