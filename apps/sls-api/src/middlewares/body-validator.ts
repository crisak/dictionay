import { z } from 'zod'
import { createError } from '@middy/util'
import type { MiddlewareObj } from '@middy/core'
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export const validationBody = (
  schema: z.ZodTypeAny,
): MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> =>
  ({
    before: (handler) => {
      const body = handler.event.body || null
      try {
        schema.parse(body)
      } catch (error) {
        if (error instanceof z.ZodError) {
          const errors = error.errors

          // Bad Request
          throw createError(400, JSON.stringify(errors), {
            cause: {
              package: 'custom-body-validator',
            },
          })
        }
      }
    },
  }) as const
