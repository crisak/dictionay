import { config } from '@repo/eslint-config/api'

/** @type {import("eslint").Linter.Config} */
export default [
  ...config,
  {
    ignores: ['node_modules', '.serverless', 'dist'],
  },
]
