import { config } from '@repo/test-config/client'
import tsconfigPaths from 'vite-tsconfig-paths'

export default config({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ['@repo/test-config/setup/client'],
    coverage: {
      thresholds: {
        lines: 10,
        functions: 10,
        branches: 10,
        statements: 10,
      },
    },
  },
})
