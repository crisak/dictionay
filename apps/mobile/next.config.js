import createNextIntlPlugin from 'next-intl/plugin'

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@repo/mobile-ui'],
}

const withNextIntl = createNextIntlPlugin('./i18n.ts')

export default withNextIntl(nextConfig)
