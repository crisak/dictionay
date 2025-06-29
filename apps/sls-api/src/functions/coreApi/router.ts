import middy from '@middy/core'
import httpRouterHandler from '@middy/http-router'
import {
  createTermController,
  deleteTermController,
  getTermsController,
  translateAudioController,
  translateController,
} from './controllers'
import { APIGatewayEvent } from 'aws-lambda'
import { Term } from './schemas'

type EventGW<Body = string> = Omit<APIGatewayEvent, 'body'> & {
  body: Body
}

type PostTranslateTerm = {
  text: string
  source: string
  to: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const routers = httpRouterHandler<EventGW<any>>([
  {
    method: 'POST',
    path: '/v1/translate',
    handler: middy<EventGW<PostTranslateTerm>>().handler(async (event) => {
      console.debug('Start POST /translate')

      const bodyDirty = event.body

      const body = {
        text: (bodyDirty.text || '').trim().toLowerCase(),
        source: bodyDirty.source || 'en',
        to: (bodyDirty.to || 'es').trim().toLowerCase(),
      }

      if (!body.text) {
        console.error('Text is required', body)

        return {
          statusCode: 400,
          body: JSON.stringify({
            message: 'Text is required',
          }),
        }
      }

      const response = await translateController(body)

      return {
        statusCode: 200,
        body: JSON.stringify(response),
      }
    }),
  },
  {
    method: 'POST',
    path: '/v1/translate-audio',
    handler: middy<EventGW<PostTranslateTerm>>().handler(async (event) => {
      console.debug('Start POST /translate-audio')

      const bodyDirty = event.body

      const body = {
        text: (bodyDirty.text || '').trim().toLowerCase(),
        source: bodyDirty.source || 'en',
      } as const

      const audioBase64 = await translateAudioController(body)

      return {
        statusCode: 200,
        body: JSON.stringify({
          audio: audioBase64,
        }),
      }
    }),
  },
  {
    method: 'POST',
    path: '/v1/terms',
    handler: middy<EventGW<Term>>().handler(async (event) => {
      console.debug('Start POST /translate-audio')

      const body = event.body

      const cleanBody = {
        ...body,
        tags: body.tags || [],
        srcLanguage: body.srcLanguage.toLowerCase().trim() || 'en',
        toLanguage: body.toLanguage.toLowerCase().trim() || 'es',
        term: body.term.toLowerCase().trim(),
      }

      const response = await createTermController(cleanBody)

      return {
        statusCode: 200,
        body: JSON.stringify(response),
      }
    }),
  },

  {
    method: 'GET',
    path: '/v1/terms',
    handler: middy<EventGW>().handler(async (event) => {
      const auth = global.dictionary.auth

      const page = parseInt(event.queryStringParameters?.page || '') || 1
      const limit = parseInt(event.queryStringParameters?.limit || '') || 20

      const { list, total } = await getTermsController(auth.id, page, limit)

      const responseSize = Buffer.byteLength(JSON.stringify(list))
      console.debug(`Response size: ${responseSize} bytes`)

      return {
        statusCode: 200,
        body: JSON.stringify({
          list,
          total,
          page,
          limit,
        }),
      }
    }),
  },
  {
    method: 'DELETE',
    path: '/v1/terms/:id',
    handler: middy<EventGW>().handler(async (event) => {
      const auth = global.dictionary.auth

      await deleteTermController(auth.id, event.pathParameters?.id || '')

      return {
        statusCode: 200,
        body: JSON.stringify({
          message: 'Term deleted',
        }),
      }
    }),
  },
])
