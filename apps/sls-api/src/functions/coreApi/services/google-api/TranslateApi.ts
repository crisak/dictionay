import axios from 'axios'
import { CONFIG } from '../../utils'
import { TranslateResultDto } from './type'

export default class TranslateApi {
  static async text({
    sourceLanguage = 'en',
    toLanguage = 'es',
    text,
  }: {
    sourceLanguage?: string
    toLanguage?: string
    text: string
  }) {
    const queryParams = {
      'params.client': 'gtx',
      'query.source_language': sourceLanguage,
      'query.target_language': toLanguage,
      'query.display_language': 'en-US',
      'query.text': text,
      key: CONFIG.googleApiKey,
      /**
       * DOC:
       * 'data_types': ['TRANSLATION', 'SENTENCE_SPLITS', 'BILINGUAL_DICTIONARY_FULL']
       */
      data_types: ['TRANSLATION', 'BILINGUAL_DICTIONARY_FULL'],
    }

    const baseUrl = 'https://translate-pa.googleapis.com/v1/translate'
    const searchParams = new URLSearchParams()

    // Agregar los parámetros
    Object.entries(queryParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Si el valor es un array, agregar múltiples entradas
        value.forEach((item) => searchParams.append(key, item))
      } else {
        searchParams.append(key, value || '')
      }
    })

    const config = {
      method: 'get',
      url: `${baseUrl}?${searchParams.toString()}`,
    }

    const data = await axios
      .request(config)
      .then((httpResult) => {
        if (httpResult?.data?.translation) {
          /**
           * Audio in base64
           */
          return httpResult.data as TranslateResultDto
        }

        return Promise.reject(httpResult)
      })
      .catch((error) => {
        let bodyResponse = error
        let statusResponse = 0
        let headersResonse = {}

        if (axios.isAxiosError(error)) {
          bodyResponse = error.response?.data || error
          statusResponse = error.response?.status || 0
          headersResonse = error.response?.headers || {}
        }

        console.error(
          `${CONFIG.keyAlarm} fetchApiTranslateText: `,
          JSON.stringify(
            {
              request: config,
              bodyResponse,
              statusResponse,
              headersResonse,
            },
            null,
            2,
          ),
        )

        throw new Error(error?.message || 'Error translate text')
      })

    console.debug(
      `fetchApiTranslateText: `,
      JSON.stringify(
        {
          body: config,
          response: data,
        },
        null,
        2,
      ),
    )

    return data
  }

  /**
   *
   * @param {*} param0
   * @returns {string}
   */
  static async audio({
    sourceLanguage = 'en',
    voiceSpeed = 1,
    text,
  }: {
    sourceLanguage?: string
    voiceSpeed?: number
    text: string
  }): Promise<string> {
    const queryParams = {
      client: 'gtx',
      language: sourceLanguage,
      text: text,
      voice_speed: voiceSpeed,
      key: 'AIzaSyDLEeFI5OtFBwYBIoK_jj5m32rZK5CkCXA',
    }

    const baseUrl = 'https://translate-pa.googleapis.com/v1/textToSpeech'

    const searchParams = TranslateApi.buildQueryStrings(queryParams)

    const config = {
      method: 'get',
      url: `${baseUrl}?${searchParams}`,
    }

    const audioBase64 = await axios
      .request(config)
      .then((httpResult) => {
        if (httpResult?.data?.audioContent) {
          /**
           * Audio in base64
           */
          return httpResult.data.audioContent as string
        }

        return Promise.reject(httpResult)
      })
      .catch((error) => {
        let bodyResponse = error
        let statusResponse = 0
        let headersResonse = {}

        if (axios.isAxiosError(error)) {
          bodyResponse = error.response?.data || error
          statusResponse = error.response?.status || 0
          headersResonse = error.response?.headers || {}
        }

        console.error(
          `${CONFIG.keyAlarm} fetchApiTranslateAudio: `,
          JSON.stringify(
            {
              request: config,
              bodyResponse,
              statusResponse,
              headersResonse,
            },
            null,
            2,
          ),
        )

        throw new Error(error?.message || 'Error translate audio text')
      })

    /**
     * Audio in base64
     */
    return audioBase64
  }

  static ping() {
    const current = new Date()
    // Locale string with timezone COL
    const colombiaTime = current.toLocaleString('en-US', {
      timeZone: 'America/Bogota',
    })
    return `${colombiaTime} Pong`
  }

  static buildQueryStrings(
    params: Record<
      string,
      string | number | boolean | Array<string | number | boolean>
    >,
  ) {
    const searchParams = new URLSearchParams()

    // Agregar los parámetros
    Object.entries(params).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        // Si el valor es un array, agregar múltiples entradas
        value.forEach((item) => searchParams.append(key, String(item)))
      } else {
        searchParams.append(key, String(value))
      }
    })

    return searchParams.toString()
  }
}
