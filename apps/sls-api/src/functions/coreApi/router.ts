import middy from '@middy/core'
import httpRouterHandler from '@middy/http-router'
import {
  createTermController,
  deleteTermController,
  getTermsController,
  translateAudioController,
  translateController,
  reBuildTermsController,
  healthController,
} from './controllers'
import { APIGatewayEvent, APIGatewayProxyResult } from 'aws-lambda'
import { Term } from './schemas'
import { CreateTermDto } from './dtos'
import { RequestReBuildTerms } from '@repo/schemas'

const headers = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE',
}

type EventGW<Body = string> = Omit<APIGatewayEvent, 'body'> & {
  body: Body
}

type PostTranslateTerm = {
  text: string
  source: string
  to: string
}

const translateHandler = middy<
  EventGW<PostTranslateTerm>,
  APIGatewayProxyResult
>().handler(async (event) => {
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
      headers,
      statusCode: 400,
      body: JSON.stringify({
        message: 'Text is required',
      }),
    }
  }

  const response = await translateController(body)

  return {
    headers,
    statusCode: 200,
    body: JSON.stringify(response),
  }
})

const translateAudioHandler = middy<
  EventGW<PostTranslateTerm>,
  APIGatewayProxyResult
>().handler(async (event) => {
  console.debug('Start POST /translate-audio')

  const bodyDirty = event.body

  const body = {
    text: (bodyDirty.text || '').trim().toLowerCase(),
    source: bodyDirty.source || 'en',
  } as const

  const audioBase64 = await translateAudioController(body)

  return {
    headers,
    statusCode: 200,
    body: JSON.stringify({
      audio: audioBase64,
    }),
  }
})

const createTermHandler = middy<EventGW<Term>, APIGatewayProxyResult>().handler(
  async (event) => {
    console.debug('Start POST /terms')

    const body = event.body

    const cleanBody: CreateTermDto = {
      ...body,
      tags: body.tags || [],
      srcLanguage: body.srcLanguage.toLowerCase().trim() || 'en',
      toLanguage: body.toLanguage.toLowerCase().trim() || 'es',
      term: body.term.toLowerCase().trim(),
    }

    const response = await createTermController(cleanBody)

    return {
      headers,
      statusCode: 200,
      body: JSON.stringify(response),
    }
  },
)

const reBuildTermsHandler = middy<
  EventGW<RequestReBuildTerms.Body>,
  APIGatewayProxyResult
>().handler(async (event) => {
  console.debug('Start PATCH /v1/terms/re-build')

  const response = await reBuildTermsController(event.body)

  return {
    headers,
    statusCode: 200,
    body: JSON.stringify(response),
  }
})

const getTermsHandler = middy<EventGW, APIGatewayProxyResult>().handler(
  async (event) => {
    const auth = global.dictionary.auth

    const page = parseInt(event.queryStringParameters?.page || '') || 1
    const limit = parseInt(event.queryStringParameters?.limit || '') || 20

    const { list, total } = await getTermsController(auth.id, page, limit)

    const responseSize = Buffer.byteLength(JSON.stringify(list))
    console.debug(`Response size: ${responseSize} bytes`)

    return {
      headers,
      statusCode: 200,
      body: JSON.stringify({
        list,
        total,
        page,
        limit,
      }),
    }
  },
)

const deleteTermHandler = middy<EventGW, APIGatewayProxyResult>().handler(
  async (event) => {
    const auth = global.dictionary.auth

    await deleteTermController(auth.id, event.pathParameters?.id || '')

    return {
      headers,
      statusCode: 200,
      body: JSON.stringify({
        message: 'Term deleted',
      }),
    }
  },
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const routers = httpRouterHandler<EventGW<any>>([
  {
    method: 'POST',
    path: '/v1/translate',
    handler: translateHandler,
  },
  {
    method: 'POST',
    path: '/v1/translate-audio',
    handler: translateAudioHandler,
  },
  {
    method: 'POST',
    path: '/v1/terms',
    handler: createTermHandler,
  },
  {
    method: 'PATCH',
    path: '/v1/terms/re-build',
    handler: reBuildTermsHandler,
  },
  {
    method: 'GET',
    path: '/v1/terms',
    handler: getTermsHandler,
  },
  {
    method: 'DELETE',
    path: '/v1/terms/:id',
    handler: deleteTermHandler,
  },
  {
    method: 'GET',
    path: '/v1/health',
    handler: healthController,
  },
])
