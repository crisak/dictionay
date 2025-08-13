import { SETTINGS } from '../../config'
import { CardVocabulary } from '../../types'
import {
  CreateTermDto,
  GetTermsFilters,
  ResultAudioDto,
  ResultGetTerm,
} from './DictionaryApiTypes'

/**
 * TODO: Remove this constant when the API is ready
 */
const SKIP_INVALID_KEY = true

export default class DictionaryApi {
  static ENDPOINT = SETTINGS.API_DICTIONARY.URL
  static API_KEY = ''

  static setApiKey(apiKey: string) {
    DictionaryApi.API_KEY = apiKey
  }

  static async validateApiKey(apiKey: string): Promise<boolean> {
    try {
      if (SKIP_INVALID_KEY) {
        return true
      }

      const myHeaders = new Headers()
      myHeaders.append('Content-Type', 'application/json')

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        redirect: 'follow',
        body: JSON.stringify({ key: apiKey }),
      } as RequestInit

      const response = await fetch(
        `${DictionaryApi.ENDPOINT}/v1/validate-key`,
        requestOptions,
      )

      return response.ok
    } catch (error) {
      console.error('Error validating API key:', error)
      return false
    }
  }

  static async getTerms(
    pagination?: { page: number; limit: number },
    filters?: GetTermsFilters,
  ) {
    try {
      /**
       * Generar base64 para el siguiente objeto `{ id: '60a...901', username: 'opensource1998' }`
       * y enviarlo en el header Authorization
       */

      const user = {
        id: '60a3e5b9c7d4e12345678901',
        username: 'opensource1998',
      }

      const myHeaders = new Headers()
      myHeaders.append('Accept', 'application/json')
      myHeaders.append('Content-Type', 'application/json')
      myHeaders.append('Authorization', btoa(JSON.stringify(user)))
      myHeaders.append('X-Api-Key', DictionaryApi.API_KEY)

      const requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow',
      } as RequestInit

      let queryPagination = ''

      if (pagination) {
        queryPagination = `?page=${pagination.page}&limit=${pagination.limit}`
      }

      // crear query de filtros
      if (filters && filters.tags && filters.tags.length > 0) {
        const tagsQuery = filters.tags.join(',')
        queryPagination += `${queryPagination ? '&' : '?'}tags=${encodeURIComponent(tagsQuery)}`
      }

      const result: {
        list: Array<ResultGetTerm>
        page: number
        limit: number
        total: number
      } = await fetch(
        `${DictionaryApi.ENDPOINT}/v1/terms${queryPagination}`,
        requestOptions,
      ).then((response) => response.json())

      if (!Array.isArray(result?.list)) {
        throw result
      }

      return {
        list: result?.list?.map<CardVocabulary>((term) => ({
          id: String(term._id),
          term: term.term || '',
          nativeTranslation: term.translation || '',
          nativeTranslationAlternatives:
            /**
             * Example
             * ```
             * [
             *  '<div class="container_type"><i class="container_type-type">noun: </i><span container_type-alternatives>perro, can</span></div>',
             * '<div class="container_type"><i class="container_type-type">verb: </i><span container_type-alternatives>correr, trotar</span></div>'
             * ]
             */
            (term.dictionary || [])
              ?.map((entry) => {
                let templateHtml = `<div class="container_type"><i class="container_type-type">${entry.type}: </i><span container_type-alternatives>`
                entry.entries?.forEach((e, index) => {
                  const translation = e.translation || ''
                  const isLastItem = index === entry.entries.length - 1
                  const separator = isLastItem ? '' : ', '
                  templateHtml += `${translation}${separator}`
                })

                templateHtml += '</span></div>'

                return templateHtml
              })
              .flat() || [],
          phoneticSymbols: term?.pronunciation?.phonetic || '',
          nativePronunciationGuide: term?.pronunciation?.nativePhonetic
            ? `/${term.pronunciation.nativePhonetic}/ ${term.pronunciation.nativePhoneticDetails}`
            : '',
          exampleSentence: term.examples?.[0]?.sentence || '',
          exampleSentenceTranslation: term.examples?.[0]?.sentenceNative || '',
          detail: '',
          image: term.image || '',
          audio: term.audio || '',
          tags: Array.isArray(term.tags)
            ? term.tags.flat().filter(Boolean)
            : [],
          sync: false,
          type: [...(term?.types || []), ...[term.level].filter(Boolean)],
        })),
        page: result.page || 1,
        limit: result.limit || 20,
        total: result.total || 0,
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  static async translateText(text: string): Promise<ResultGetTerm | null> {
    try {
      if (!text) {
        return null
      }

      const mockAuth = {
        id: '60a3e5b9c7d4e12345678901',
        username: 'opensource1998',
      }

      const myHeaders = new Headers()
      myHeaders.append('Content-Type', 'application/json')
      myHeaders.append('Authorization', btoa(JSON.stringify(mockAuth)))
      myHeaders.append('X-Api-Key', DictionaryApi.API_KEY)

      const raw = JSON.stringify({
        text: text,
        to: 'es',
      })

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      } as RequestInit

      const response = await fetch(
        `${DictionaryApi.ENDPOINT}/v1/translate`,
        requestOptions,
      )

      if (!response.ok) {
        const error = await response.json()
        throw error
      }

      const result = await response.json()

      return result as ResultGetTerm
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  }

  static async saveTerm(body: CreateTermDto) {
    try {
      const mockAuth = {
        id: '60a3e5b9c7d4e12345678901',
        username: 'opensource1998',
      }

      const myHeaders = new Headers()
      myHeaders.append('Content-Type', 'application/json')
      myHeaders.append('Authorization', btoa(JSON.stringify(mockAuth)))
      myHeaders.append('X-Api-Key', DictionaryApi.API_KEY)

      const raw = JSON.stringify(body)

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      } as RequestInit

      const response = await fetch(
        `${DictionaryApi.ENDPOINT}/v1/terms`,
        requestOptions,
      )

      if (!response.ok) {
        const error = await response.json()
        throw error
      }

      const result = await response.json()

      return result.term
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  }

  static async getAudio(text: string, opt?: { lang: string }): Promise<string> {
    try {
      const language = opt?.lang || 'en'

      const mockAuth = {
        id: '60a3e5b9c7d4e12345678901',
        username: 'opensource1998',
      }

      const myHeaders = new Headers()
      myHeaders.append('Content-Type', 'application/json')
      myHeaders.append('Authorization', btoa(JSON.stringify(mockAuth)))
      myHeaders.append('X-Api-Key', DictionaryApi.API_KEY)

      const raw = JSON.stringify({
        source: language,
        text,
      })

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      } as RequestInit

      const response = await fetch(
        `${DictionaryApi.ENDPOINT}/v1/translate-audio`,
        requestOptions,
      )

      if (!response.ok) {
        const error = await response.json()
        throw error
      }

      const result = (await response.json()) as ResultAudioDto

      return result.audio
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  }

  static async removeTerm(id: CreateTermDto['_id']) {
    try {
      const mockAuth = {
        id: '60a3e5b9c7d4e12345678901',
        username: 'opensource1998',
      }

      const myHeaders = new Headers()
      myHeaders.append('Content-Type', 'application/json')
      myHeaders.append('Authorization', btoa(JSON.stringify(mockAuth)))
      myHeaders.append('X-Api-Key', DictionaryApi.API_KEY)

      const requestOptions = {
        method: 'DELETE',
        headers: myHeaders,
        redirect: 'follow',
      } as RequestInit

      const response = await fetch(
        `${DictionaryApi.ENDPOINT}/v1/terms/${id}`,
        requestOptions,
      )

      if (!response.ok) {
        const error = await response.json()
        throw error
      }

      const result = await response.json()

      return result
    } catch (error) {
      console.error('Error:', error)
      throw error
    }
  }
}
