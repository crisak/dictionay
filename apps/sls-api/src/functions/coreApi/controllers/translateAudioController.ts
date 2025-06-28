import { TranslateApi } from '../services'

type TranslateAudioControllerBody = {
  source: string
  text: string
}

/**
 *
 * @param {*} body
 * @returns {Promise<{ text: string, alternative: string[], type: string[], audio: string }>}
 */
export function translateAudioController(body: TranslateAudioControllerBody) {
  return TranslateApi.audio({
    sourceLanguage: body.source,
    text: body.text,
  })
}
