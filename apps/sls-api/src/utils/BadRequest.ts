/* eslint-disable @typescript-eslint/ban-ts-comment */
// import { ErrorCodes, StatusCodes } from '../enums'

export const ErrorCodes = {
  INVALID_ID: 'TMU0001B',
  INVALID_NAME: 'TMU0002B',
  INTERNAL_SERVER_ERROR: 'TMU0003B',
  TMU0004B: 'TMU0004B',
  TMU0005B: 'TMU0005B',
  TMU0006B: 'TMU0006B',
} as const

export const StatusCodes = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const

type ToJSON = BadRequestProps &
  Pick<Error, 'stack'> & { requestId?: string; date?: string }

/**
 * @docs https://www.ibm.com/docs/es/ibm-mq/9.1?topic=api-rest-error-handling
 */
export class BadRequest<T = unknown> extends Error implements BadRequestProps {
  public type?: TypeError

  public code?: string | typeof ErrorCodes | null

  public data?: T | null

  public requestId?: string

  public statusCode?: number

  public date?: string

  constructor({
    type,
    code,
    message,
    data,
    statusCode,
  }: Partial<BadRequestProps<T>>) {
    super(message || 'Error internal server')
    this.type = type || 'exception'
    this.code = code || null
    this.data = data || null
    this.statusCode = statusCode || StatusCodes.BAD_REQUEST
    //@ts-ignore
    this.requestId = global?.AWSData?.requestId || ''
    this.date = new Date().toISOString()
    this.name = 'BadRequest'
  }

  /**
   * This allows to convert the object to JSON when it is called by
   * JSON.stringify
   */
  toJSON(): ToJSON {
    const jsonObject: ToJSON = {
      type: this.type,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      stack: this.stack,
      date: this.date,
      requestId: this.requestId,
    }

    if (this.data) {
      jsonObject.data = this.data
    }

    return jsonObject
  }

  static getStacks(
    error: unknown | Error | BadRequest,
    options?: { maxLevel?: number; includeTitleError?: boolean },
  ): Array<string> {
    if (error instanceof Error) {
      let stacks = error?.stack?.split('\n') || []

      if (!stacks.length) {
        return []
      }

      if (typeof options?.maxLevel === 'number') {
        stacks = stacks.slice(0, options.maxLevel)
      }

      if (options?.includeTitleError === false) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const [_, ...restStacks] = stacks
        return restStacks
      }
    }

    return []
  }
}

export type TypeError =
  | 'exception'
  | 'business'
  | 'sqs'
  | 'dynamodb'
  | 'elasticsearch'
  | 'cognito'

export interface BadRequestProps<T = unknown> {
  type?: TypeError
  /**
   * @docs
   * code = MODnnnnX
   *  MOD
   *   Module prefix that shows that the message has originated in the REST API
   *  nnnn
   *   Exclusive number that identifies the message
   *  X
   *   Unique letter that indicates the severity of the message:
   *   - E If the message is a exception.
   *   - B If the message is a error business.
   * @example
   * TMU = tracking-mensajeros-urbanos
   * TMU0001B
   */
  code?: string | typeof ErrorCodes | null
  message?: string
  data?: T | null
  statusCode?: number
}
