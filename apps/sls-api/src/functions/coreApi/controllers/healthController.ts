import middy from '@middy/core'
import type { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda'

type EventGW<Body = string> = Omit<APIGatewayEvent, 'body'> & {
  body: Body
}

export const healthController = middy<EventGW, APIGatewayProxyResult>().handler(
  async () => {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'API is healthy',
        date: new Date().toISOString(),
        // eslint-disable-next-line turbo/no-undeclared-env-vars
        environment: process.env.NODE_ENV || 'development',
      }),
    }
  },
)
