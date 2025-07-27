import createNextIntlPlugin from 'next-intl/plugin'

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@repo/mobile-ui',
    '@repo/eslint-config',
    '@repo/test-config',
    '@repo/prettier-config',
    '@repo/translations',
    '@repo/typescript-config',
  ],
}

const withNextIntl = createNextIntlPlugin('./i18n.ts')

export default withNextIntl(nextConfig)
