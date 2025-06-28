/* eslint-disable @typescript-eslint/ban-ts-comment */
import { MiddlewareObj } from '@middy/core'
import { APIGatewayEvent } from 'aws-lambda'

/**
 * Global middlewares
 */
export const authentication = (): MiddlewareObj<APIGatewayEvent> => ({
  before: (handler) => {
    const getAuth = handler.event.headers.Authorization || ''
    const base64 = getAuth

    if (!base64) {
      // @ts-ignore
      global.dictionary = {
        auth: {
          id: '60a3e5b9c7d4e12345678901',
          username: 'opensource1998',
        },
      }

      return
    }

    const decodeBase64 = Buffer.from(base64, 'base64').toString('utf-8')
    const objectJs = JSON.parse(decodeBase64)

    if (!objectJs) {
      return
    }

    // @ts-ignore
    global.dictionary = {
      auth: objectJs,
    }
  },
})
