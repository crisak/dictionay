import { defineConfig } from 'vitest/config'
import { config } from '@repo/test-config'

export default defineConfig(
  config.server({
    test: {
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: [
        'node_modules',
        '.serverless',
        '.esbuild',
        '.webpack',
        'dist',
        'build',
        'coverage',
      ],
      coverage: {
        thresholds: {
          lines: 10,
          functions: 10,
          branches: 10,
          statements: 10,
        },
        exclude: [
          'node_modules/',
          '.serverless/',
          '.webpack/',
          '**/*.d.ts',
          '**/*.config.{js,ts}',
          '**/types/**',
          '**/__mocks__/**',
          '**/tests/**',
          'dist/',
          'build/',
          'coverage/',
          'serverless.ts',
          'esbuild.config.js',
        ],
      },
    },
    resolve: {
      alias: {
        '@': '/src',
      },
    },
  }),
)
