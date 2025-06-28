/* eslint-disable @typescript-eslint/no-explicit-any */
import middy from '@middy/core'
import httpRouterHandler from '@middy/http-router'
import { BulkTransactionsController } from './controllers'
import { BulkTransactionsSchema } from '@repo/schemas/BulkTransactions'
import { validationBody } from '@/middlewares/body-validator'

export const routers = httpRouterHandler([
  {
    method: 'POST',
    path: '/transactions/bulk',
    handler: middy()
      .use(validationBody(BulkTransactionsSchema))
      .handler(BulkTransactionsController.run as any),
  },
])
