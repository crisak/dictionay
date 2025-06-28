/* eslint-disable no-console */
export const logger = () => ({
  before: (handler) => {
    const request = handler.event

    const ip = request?.requestContext?.identity?.sourceIp || null
    const user =
      request.requestContext?.authorizer?.claims?.sub ||
      request.requestContext?.identity?.cognitoIdentityPoolId ||
      'anonymous'
    const method = request?.httpMethod || null
    const url = request?.path || null
    const bodySize = JSON.stringify(request?.body || {}).length
    const agent = request?.requestContext?.identity?.userAgent || null

    console.info({
      ip,
      user,
      method,
      url,
      bodySize,
      agent,
    })
  },
  onError: (request) => {
    const req = request?.event
    const statusResponse = request?.response?.statusCode || null
    const ip = req?.requestContext?.identity?.sourceIp || null
    const user =
      req?.requestContext?.authorizer?.claims?.sub ||
      req?.requestContext?.identity?.cognitoIdentityPoolId ||
      'anonymous'
    const method = req?.httpMethod || null
    const url = req?.path || null
    const bodySize = JSON.stringify(req.body || {}).length
    const agent = req?.requestContext?.identity?.userAgent || null

    console.error(request.error, '\n\n', {
      ip,
      user,
      method,
      url,
      bodySize,
      statusResponse,
      agent,
    })
  },
})
