import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import TranslateApi from './TranslateApi'
import type { TranslateResultDto } from './type'

// Mock axios
vi.mock('axios', () => ({
  default: {
    request: vi.fn(),
    isAxiosError: vi.fn(),
  },
}))

// Mock CONFIG
vi.mock('../../utils', () => ({
  CONFIG: {
    googleApiKey: 'test-google-api-key',
    keyAlarm: 'TEST_ALARM',
  },
}))

// Type the mocked axios correctly
const mockAxios = axios as unknown as {
  request: ReturnType<typeof vi.fn>
  isAxiosError: ReturnType<typeof vi.fn>
}

describe('TranslateApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset console.log, console.error, console.debug mocks
    vi.spyOn(console, 'debug').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('text()', () => {
    const mockTranslateResponse: TranslateResultDto = {
      translation: 'hola',
      sentences: [
        {
          trans: 'hola',
          orig: 'hello',
          backend: 'google',
        },
      ],
      bilingualDictionary: [
        {
          pos: 'interjection',
          entry: [
            {
              word: 'hola',
              reverseTranslation: ['hello', 'hi'],
              score: 0.9,
            },
          ],
          baseForm: 'hello',
          posEnum: 1,
        },
      ],
      detectedLanguages: {
        srclangs: ['en'],
        srclangsConfidences: [0.95],
        extendedSrclangs: ['en-US'],
      },
      sourceLanguage: 'en',
    }

    it('should translate text with default parameters', async () => {
      const mockResponse = {
        data: mockTranslateResponse,
      }
      mockAxios.request.mockResolvedValue(mockResponse)

      const result = await TranslateApi.text({ text: 'hello' })

      expect(result).toEqual(mockTranslateResponse)
      expect(mockAxios.request).toHaveBeenCalledWith({
        method: 'get',
        url: expect.stringContaining(
          'https://translate-pa.googleapis.com/v1/translate',
        ),
      })

      // Verify the URL contains the expected parameters
      const callArgs = mockAxios.request.mock.calls[0]?.[0]
      const url = new URL(callArgs.url)
      expect(url.searchParams.get('params.client')).toBe('gtx')
      expect(url.searchParams.get('query.source_language')).toBe('en')
      expect(url.searchParams.get('query.target_language')).toBe('es')
      expect(url.searchParams.get('query.text')).toBe('hello')
      expect(url.searchParams.get('key')).toBe('test-google-api-key')
    })

    it('should translate text with custom parameters', async () => {
      const mockResponse = {
        data: mockTranslateResponse,
      }
      mockAxios.request.mockResolvedValue(mockResponse)

      const result = await TranslateApi.text({
        text: 'hello world',
        sourceLanguage: 'fr',
        toLanguage: 'de',
      })

      expect(result).toEqual(mockTranslateResponse)

      const callArgs = mockAxios.request.mock.calls[0]?.[0]
      const url = new URL(callArgs.url)
      expect(url.searchParams.get('query.source_language')).toBe('fr')
      expect(url.searchParams.get('query.target_language')).toBe('de')
      expect(url.searchParams.get('query.text')).toBe('hello world')
    })

    it('should include data_types parameter as array', async () => {
      const mockResponse = {
        data: mockTranslateResponse,
      }
      mockAxios.request.mockResolvedValue(mockResponse)

      await TranslateApi.text({ text: 'hello' })

      const callArgs = mockAxios.request.mock.calls[0]?.[0]
      const url = new URL(callArgs.url)
      const dataTypes = url.searchParams.getAll('data_types')
      expect(dataTypes).toEqual(['TRANSLATION', 'BILINGUAL_DICTIONARY_FULL'])
    })

    it('should reject when response does not contain translation', async () => {
      const mockResponse = {
        data: { someOtherData: 'value' },
      }
      mockAxios.request.mockResolvedValue(mockResponse)

      await expect(TranslateApi.text({ text: 'hello' })).rejects.toThrow(
        'Error translate text',
      )
    })

    it('should handle axios errors and log them', async () => {
      const axiosError = {
        message: 'Network Error',
        response: {
          data: { error: 'API Error' },
          status: 500,
          headers: { 'content-type': 'application/json' },
        },
      }
      mockAxios.isAxiosError.mockReturnValue(true)
      mockAxios.request.mockRejectedValue(axiosError)

      await expect(TranslateApi.text({ text: 'hello' })).rejects.toThrow(
        'Network Error',
      )

      expect(console.error).toHaveBeenCalledWith(
        'TEST_ALARM fetchApiTranslateText: ',
        expect.stringContaining('"statusResponse": 500'),
      )
    })

    it('should handle non-axios errors', async () => {
      const genericError = new Error('Generic error')
      mockAxios.isAxiosError.mockReturnValue(false)
      mockAxios.request.mockRejectedValue(genericError)

      await expect(TranslateApi.text({ text: 'hello' })).rejects.toThrow(
        'Generic error',
      )

      expect(console.error).toHaveBeenCalledWith(
        'TEST_ALARM fetchApiTranslateText: ',
        expect.stringContaining('"statusResponse": 0'),
      )
    })

    it('should log debug information on successful response', async () => {
      const mockResponse = {
        data: mockTranslateResponse,
      }
      mockAxios.request.mockResolvedValue(mockResponse)

      await TranslateApi.text({ text: 'hello' })

      expect(console.debug).toHaveBeenCalledWith(
        'fetchApiTranslateText: ',
        expect.stringContaining('"response"'),
      )
    })
  })

  describe('audio()', () => {
    it('should get audio with default parameters', async () => {
      const mockAudioContent = 'base64-encoded-audio-content'
      const mockResponse = {
        data: { audioContent: mockAudioContent },
      }
      mockAxios.request.mockResolvedValue(mockResponse)

      const result = await TranslateApi.audio({ text: 'hello' })

      expect(result).toBe(mockAudioContent)
      expect(mockAxios.request).toHaveBeenCalledWith({
        method: 'get',
        url: expect.stringContaining(
          'https://translate-pa.googleapis.com/v1/textToSpeech',
        ),
      })

      const callArgs = mockAxios.request.mock.calls[0]?.[0]
      const url = new URL(callArgs.url)
      expect(url.searchParams.get('client')).toBe('gtx')
      expect(url.searchParams.get('language')).toBe('en')
      expect(url.searchParams.get('text')).toBe('hello')
      expect(url.searchParams.get('voice_speed')).toBe('1')
    })

    it('should get audio with custom parameters', async () => {
      const mockAudioContent = 'base64-encoded-audio-content'
      const mockResponse = {
        data: { audioContent: mockAudioContent },
      }
      mockAxios.request.mockResolvedValue(mockResponse)

      const result = await TranslateApi.audio({
        text: 'bonjour',
        sourceLanguage: 'fr',
        voiceSpeed: 1.5,
      })

      expect(result).toBe(mockAudioContent)

      const callArgs = mockAxios.request.mock.calls[0]?.[0]
      const url = new URL(callArgs.url)
      expect(url.searchParams.get('language')).toBe('fr')
      expect(url.searchParams.get('text')).toBe('bonjour')
      expect(url.searchParams.get('voice_speed')).toBe('1.5')
    })

    it('should reject when response does not contain audioContent', async () => {
      const mockResponse = {
        data: { someOtherData: 'value' },
      }
      mockAxios.request.mockResolvedValue(mockResponse)

      await expect(TranslateApi.audio({ text: 'hello' })).rejects.toThrow(
        'Error translate audio text',
      )
    })

    it('should handle axios errors and log them', async () => {
      const axiosError = {
        message: 'API Rate Limit',
        response: {
          data: { error: 'Rate limit exceeded' },
          status: 429,
          headers: { 'retry-after': '60' },
        },
      }
      mockAxios.isAxiosError.mockReturnValue(true)
      mockAxios.request.mockRejectedValue(axiosError)

      await expect(TranslateApi.audio({ text: 'hello' })).rejects.toThrow(
        'API Rate Limit',
      )

      expect(console.error).toHaveBeenCalledWith(
        'TEST_ALARM fetchApiTranslateAudio: ',
        expect.stringContaining('"statusResponse": 429'),
      )
    })

    it('should handle non-axios errors', async () => {
      const genericError = new Error('Network timeout')
      mockAxios.isAxiosError.mockReturnValue(false)
      mockAxios.request.mockRejectedValue(genericError)

      await expect(TranslateApi.audio({ text: 'hello' })).rejects.toThrow(
        'Network timeout',
      )

      expect(console.error).toHaveBeenCalledWith(
        'TEST_ALARM fetchApiTranslateAudio: ',
        expect.stringContaining('"statusResponse": 0'),
      )
    })

    it('should throw default error message when error has no message', async () => {
      const errorWithoutMessage = {}
      mockAxios.isAxiosError.mockReturnValue(false)
      mockAxios.request.mockRejectedValue(errorWithoutMessage)

      await expect(TranslateApi.audio({ text: 'hello' })).rejects.toThrow(
        'Error translate audio text',
      )
    })
  })

  describe('ping()', () => {
    it('should return current time in Colombia timezone', () => {
      // Mock Date to have consistent test results
      const mockDate = new Date('2023-07-26T15:30:00Z')
      vi.spyOn(global, 'Date').mockImplementation(() => mockDate)

      const result = TranslateApi.ping()

      expect(result).toMatch(
        /\d{1,2}\/\d{1,2}\/\d{4}, \d{1,2}:\d{2}:\d{2} [AP]M Pong/,
      )
      expect(result).toContain('Pong')
    })

    it('should include current date and time', () => {
      const result = TranslateApi.ping()

      // Should contain date/time pattern and end with "Pong"
      expect(result).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}.*Pong$/)
    })
  })

  describe('buildQueryStrings()', () => {
    it('should build query string with simple key-value pairs', () => {
      const params = {
        key1: 'value1',
        key2: 'value2',
        num: 123,
        bool: true,
      }

      const result = TranslateApi.buildQueryStrings(params)

      expect(result).toBe('key1=value1&key2=value2&num=123&bool=true')
    })

    it('should handle array values by creating multiple entries', () => {
      const params = {
        singleValue: 'test',
        arrayValue: ['item1', 'item2', 'item3'],
        mixedArray: [1, 'two', true],
      }

      const result = TranslateApi.buildQueryStrings(params)

      expect(result).toContain('singleValue=test')
      expect(result).toContain('arrayValue=item1')
      expect(result).toContain('arrayValue=item2')
      expect(result).toContain('arrayValue=item3')
      expect(result).toContain('mixedArray=1')
      expect(result).toContain('mixedArray=two')
      expect(result).toContain('mixedArray=true')
    })

    it('should handle empty object', () => {
      const result = TranslateApi.buildQueryStrings({})
      expect(result).toBe('')
    })

    it('should handle special characters by URL encoding', () => {
      const params = {
        special: 'hello world!',
        encoded: 'test@example.com',
      }

      const result = TranslateApi.buildQueryStrings(params)

      expect(result).toContain('special=hello+world%21')
      expect(result).toContain('encoded=test%40example.com')
    })

    it('should convert all values to strings', () => {
      const params = {
        number: 42,
        boolean: false,
        string: 'text',
        zero: 0,
      }

      const result = TranslateApi.buildQueryStrings(params)

      expect(result).toContain('number=42')
      expect(result).toContain('boolean=false')
      expect(result).toContain('string=text')
      expect(result).toContain('zero=0')
    })

    it('should handle empty arrays', () => {
      const params = {
        normalValue: 'test',
        emptyArray: [],
        otherValue: 'test2',
      }

      const result = TranslateApi.buildQueryStrings(params)

      expect(result).toContain('normalValue=test')
      expect(result).toContain('otherValue=test2')
      expect(result).not.toContain('emptyArray')
    })
  })

  describe('integration scenarios', () => {
    it('should handle complete text translation workflow', async () => {
      const mockResponse = {
        data: {
          translation: 'Hola mundo',
          sentences: [
            {
              trans: 'Hola mundo',
              orig: 'Hello world',
              backend: 'google',
            },
          ],
          bilingualDictionary: [],
          detectedLanguages: {
            srclangs: ['en'],
            srclangsConfidences: [1.0],
            extendedSrclangs: ['en-US'],
          },
          sourceLanguage: 'en',
        },
      }
      mockAxios.request.mockResolvedValue(mockResponse)

      const result = await TranslateApi.text({
        text: 'Hello world',
        sourceLanguage: 'en',
        toLanguage: 'es',
      })

      expect(result.translation).toBe('Hola mundo')
      expect(result.sentences).toHaveLength(1)
      expect(result.sentences?.[0]?.orig).toBe('Hello world')
      expect(console.debug).toHaveBeenCalled()
    })

    it('should handle complete audio generation workflow', async () => {
      const mockAudioContent = 'UklGRiQAAABXQVZFZm10IBAAAAABAAEA'
      const mockResponse = {
        data: { audioContent: mockAudioContent },
      }
      mockAxios.request.mockResolvedValue(mockResponse)

      const result = await TranslateApi.audio({
        text: 'Hello world',
        sourceLanguage: 'en',
        voiceSpeed: 0.8,
      })

      expect(result).toBe(mockAudioContent)
      expect(typeof result).toBe('string')
    })

    it('should handle network errors gracefully', async () => {
      const networkError = new Error('Network Error') as Error & {
        code?: string
      }
      networkError.code = 'ENOTFOUND'
      mockAxios.isAxiosError.mockReturnValue(false)
      mockAxios.request.mockRejectedValue(networkError)

      await expect(TranslateApi.text({ text: 'hello' })).rejects.toThrow(
        'Network Error',
      )
      await expect(TranslateApi.audio({ text: 'hello' })).rejects.toThrow(
        'Network Error',
      )

      expect(console.error).toHaveBeenCalledTimes(2)
    })
  })
})
