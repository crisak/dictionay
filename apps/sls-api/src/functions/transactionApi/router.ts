import middy from '@middy/core'
import httpRouterHandler from '@middy/http-router'
import { BulkTransactionsController } from './controllers'
import { BulkTransactions } from '@repo/schemas'
import { validationBody } from '@/middlewares/body-validator'

export const routers = httpRouterHandler([
  {
    method: 'POST',
    path: '/transactions/bulk',
    handler: middy()
      .use(validationBody(BulkTransactions.BulkTransactionsSchema))
      .handler(BulkTransactionsController.run as never),
  },
])
