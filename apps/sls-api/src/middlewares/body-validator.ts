import { z } from 'zod'
import { createError } from '@middy/util'

export const validationBody = (schema: z.ZodTypeAny) =>
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
