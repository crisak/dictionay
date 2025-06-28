import { defineConfig as def, mergeConfig } from 'vitest/config'

/**
 * A shared Vitest config configuration for the repository.
 * This configuration is used for client-side tests.
 */
/** @type {import("vite").UserConfig} */
const configBase = {
  test: {
    globals: true,
    environment: 'node',

    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist'],

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['**/*.{ts,tsx}'],
      exclude: [
        'node_modules/',
        '.next/',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        '**/types/**',
        '**/__mocks__/**',
        '**/tests/**',

        '.serverless/',
        '.webpack/',
        'dist/',
        'build/',
        'out/',
        'coverage/',
      ],
      all: true,
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      reportsDirectory: './coverage',
    },
  },
}

/**
 *
 * @param {import("vite").UserConfig} newOptions
 */
export const config = (newOptions) => def(mergeConfig(configBase, newOptions))
