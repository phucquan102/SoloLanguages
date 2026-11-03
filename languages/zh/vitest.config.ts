import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { name: 'lang-zh', include: ['test/**/*.test.ts'] },
});
