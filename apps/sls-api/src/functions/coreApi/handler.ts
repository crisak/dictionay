import '@/utils/setupVerboseLogs'
import middy from '@middy/core'
import httpJsonBodyParser from '@middy/http-json-body-parser'
import httpErrorHandler from '@middy/http-error-handler'
import cors from '@middy/http-cors'
import httpHeaderNormalizer from '@middy/http-header-normalizer'
import { routers } from './router'
import { authentication } from '@/middlewares/authentication'
import { logger } from '@/middlewares/logger'

export const main = middy()
  .use(logger())
  .use(httpHeaderNormalizer())
  .use(httpJsonBodyParser())
  .use(httpErrorHandler())
  .use(cors())
  .use(authentication())
  .handler(routers)
