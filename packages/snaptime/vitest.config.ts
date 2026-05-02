import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    // The suite was written against Jest globals — expose describe/it/expect
    // globally so every file runs unchanged after the jest.* → vi.* rename.
    globals: true,
    include: ['test/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      reporter: ['text', 'html']
    }
  }
})
