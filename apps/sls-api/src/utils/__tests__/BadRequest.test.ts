import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { BadRequest, ErrorCodes, StatusCodes } from '../BadRequest'

describe('BadRequest', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('constructor', () => {
    it('should create BadRequest with default values', () => {
      const error = new BadRequest({})

      expect(error.message).toBe('Error internal server')
      expect(error.type).toBe('exception')
      expect(error.code).toBe(null)
      expect(error.data).toBe(null)
      expect(error.statusCode).toBe(StatusCodes.BAD_REQUEST)
      expect(error.requestId).toBe('')
      expect(error.name).toBe('BadRequest')
      expect(error.date).toBeDefined()
    })

    it('should create BadRequest with custom values', () => {
      const customData = { userId: 123, action: 'create' }
      const error = new BadRequest({
        type: 'business',
        code: ErrorCodes.INVALID_ID,
        message: 'Invalid user ID provided',
        data: customData,
        statusCode: StatusCodes.NOT_FOUND,
      })

      expect(error.message).toBe('Invalid user ID provided')
      expect(error.type).toBe('business')
      expect(error.code).toBe(ErrorCodes.INVALID_ID)
      expect(error.data).toEqual(customData)
      expect(error.statusCode).toBe(StatusCodes.NOT_FOUND)
    })

    it('should create BadRequest with partial values', () => {
      const error = new BadRequest({
        message: 'Custom error message',
        statusCode: StatusCodes.FORBIDDEN,
      })

      expect(error.message).toBe('Custom error message')
      expect(error.type).toBe('exception')
      expect(error.code).toBe(null)
      expect(error.data).toBe(null)
      expect(error.statusCode).toBe(StatusCodes.FORBIDDEN)
    })
  })

  describe('toJSON', () => {
    it('should return JSON representation without data when data is null', () => {
      const error = new BadRequest({
        type: 'business',
        code: ErrorCodes.INVALID_NAME,
        message: 'Invalid name',
        statusCode: StatusCodes.BAD_REQUEST,
      })

      const json = error.toJSON()

      expect(json).toEqual({
        type: 'business',
        code: ErrorCodes.INVALID_NAME,
        message: 'Invalid name',
        statusCode: StatusCodes.BAD_REQUEST,
        stack: error.stack,
        date: error.date,
        requestId: error.requestId,
      })
      expect(json.data).toBeUndefined()
    })

    it('should return JSON representation with data when data is provided', () => {
      const customData = { field: 'username', value: 'invalid_user' }
      const error = new BadRequest({
        type: 'business',
        code: ErrorCodes.INVALID_ID,
        message: 'Validation failed',
        data: customData,
        statusCode: StatusCodes.BAD_REQUEST,
      })

      const json = error.toJSON()

      expect(json).toEqual({
        type: 'business',
        code: ErrorCodes.INVALID_ID,
        message: 'Validation failed',
        statusCode: StatusCodes.BAD_REQUEST,
        stack: error.stack,
        date: error.date,
        requestId: error.requestId,
        data: customData,
      })
    })

    it('should be JSON serializable', () => {
      const error = new BadRequest({
        message: 'Test error',
        data: { test: true },
      })

      expect(() => JSON.stringify(error)).not.toThrow()

      const serialized = JSON.parse(JSON.stringify(error))
      expect(serialized.message).toBe('Test error')
      expect(serialized.data).toEqual({ test: true })
    })
  })

  describe('getStacks', () => {
    it('should return empty array for non-Error objects', () => {
      const result = BadRequest.getStacks('not an error')

      expect(result).toEqual([])
    })

    it('should return empty array for Error without stack', () => {
      const error = new Error('Test error')
      error.stack = undefined

      const result = BadRequest.getStacks(error)

      expect(result).toEqual([])
    })

    it('should return full stack trace by default', () => {
      const error = new Error('Test error')
      // Mock stack trace
      error.stack =
        'Error: Test error\n    at line1\n    at line2\n    at line3'

      const result = BadRequest.getStacks(error)

      expect(result).toEqual([
        'Error: Test error',
        '    at line1',
        '    at line2',
        '    at line3',
      ])
    })

    it('should limit stack trace when maxLevel is provided', () => {
      const error = new Error('Test error')
      error.stack =
        'Error: Test error\n    at line1\n    at line2\n    at line3'

      const result = BadRequest.getStacks(error, { maxLevel: 2 })

      expect(result).toEqual(['Error: Test error', '    at line1'])
    })

    it('should exclude title error when includeTitleError is false', () => {
      const error = new Error('Test error')
      error.stack =
        'Error: Test error\n    at line1\n    at line2\n    at line3'

      const result = BadRequest.getStacks(error, { includeTitleError: false })

      expect(result).toEqual(['    at line1', '    at line2', '    at line3'])
    })

    it('should combine maxLevel and includeTitleError options', () => {
      const error = new Error('Test error')
      error.stack =
        'Error: Test error\n    at line1\n    at line2\n    at line3'

      const result = BadRequest.getStacks(error, {
        maxLevel: 2,
        includeTitleError: false,
      })

      expect(result).toEqual(['    at line1'])
    })

    it('should work with BadRequest instances', () => {
      const badRequest = new BadRequest({ message: 'Test bad request' })

      const result = BadRequest.getStacks(badRequest, {
        includeTitleError: false,
      })

      expect(result.length).toBeGreaterThan(0)
      expect(result[0]).toMatch(/^\s+at/)
    })
  })

  describe('ErrorCodes', () => {
    it('should have all expected error codes', () => {
      expect(ErrorCodes.INVALID_ID).toBe('TMU0001B')
      expect(ErrorCodes.INVALID_NAME).toBe('TMU0002B')
      expect(ErrorCodes.INTERNAL_SERVER_ERROR).toBe('TMU0003B')
      expect(ErrorCodes.TMU0004B).toBe('TMU0004B')
      expect(ErrorCodes.TMU0005B).toBe('TMU0005B')
      expect(ErrorCodes.TMU0006B).toBe('TMU0006B')
    })
  })

  describe('StatusCodes', () => {
    it('should have all expected status codes', () => {
      expect(StatusCodes.BAD_REQUEST).toBe(400)
      expect(StatusCodes.UNAUTHORIZED).toBe(401)
      expect(StatusCodes.FORBIDDEN).toBe(403)
      expect(StatusCodes.NOT_FOUND).toBe(404)
      expect(StatusCodes.INTERNAL_SERVER_ERROR).toBe(500)
    })
  })
})
