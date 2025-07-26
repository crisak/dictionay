import middy from '@middy/core'
import httpRouterHandler from '@middy/http-router'
import { BulkTransactionsController } from './controllers'
import { BulkTransactions } from '@repo/schemas'
import { validationBody } from '@/middlewares/body-validator'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { APIGatewayEvent } from './types/aws'

// Define the handler with proper typing
const bulkTransactionsHandler = middy<APIGatewayProxyEvent>()
  .use(validationBody(BulkTransactions.BulkTransactionsSchema))
  .handler(async (event): Promise<APIGatewayProxyResult> => {
    // After validation, we know the body is valid but still need to cast
    const typedEvent =
      event as unknown as APIGatewayEvent<BulkTransactions.BulkTransactions>
    return await BulkTransactionsController.run(typedEvent)
  })

export const routers = httpRouterHandler([
  {
    method: 'POST',
    path: '/transactions/bulk',
    handler: bulkTransactionsHandler,
  },
])
