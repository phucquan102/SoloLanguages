import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { name: 'lang-en', include: ['test/**/*.test.ts'] },
});
