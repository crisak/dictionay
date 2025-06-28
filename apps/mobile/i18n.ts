import { getRequestConfig } from 'next-intl/server'

export const locales = ['en', 'es', 'pt']
export const defaultLocale = 'en'

export default getRequestConfig(async (props) => {
  const locale = props.locale || defaultLocale

  const messages = (await import(`@repo/translations/mobile/${locale}.json`)).default

  if (!messages) {
    throw new Error(`No messages for locale "${locale}"`)
  }

  return {
    messages,
    locale: locale,
  }
})
