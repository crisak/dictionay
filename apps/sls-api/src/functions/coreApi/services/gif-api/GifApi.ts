import axios from 'axios'
import { CONFIG } from '../../utils' // Asegúrate de tener esta configuración para las constantes

export class GifApi {
  /**
   * Fetch a GIF URL based on a search term
   * @param {string} term - The search term for the GIF
   * @param {string} lang - The language of the search term
   * @returns {Promise<string | null>} - The URL of the GIF or null if not found
   */
  static async fetchSearchGif(term: string, lang?: string) {
    const splitWordsBySpace = term.split(/\s+/) || []
    if (!term || splitWordsBySpace.length > 4) {
      return null
    }

    const filterTerm = term.trim().toLowerCase()
    const endpoint = `${CONFIG.gifEndpoint}/v1/gifs/search`

    try {
      const response = await axios.get(endpoint, {
        params: {
          api_key: CONFIG.gifApiKey,
          q: filterTerm,
          limit: 1,
          rating: 'g',
          lang: lang || 'en',
        },
      })

      const gifs = response?.data?.data || []
      if (gifs.length > 0) {
        const url =
          gifs[0].images.preview_gif.url ||
          gifs[0].images.preview_webp.url ||
          gifs[0].images.downsized_medium.url ||
          gifs[0].images.preview.mp4 ||
          gifs[0].images.downsized_small.mp4

        console.debug('GIF URL:', url)
        return url
      } else {
        console.debug('No se encontraron GIFs.')
        return null
      }
    } catch (error) {
      console.error(`${CONFIG.keyAlarm} fetchSearchGif: `, error)
      return null
    }
  }

  /**
   * Download a GIF from a given URL
   * @param {string} url - The URL of the GIF to download
   * @returns {Promise<Buffer | null>} - A buffer of the GIF data or null if failed
   */
  static async downloadGif(url: string): Promise<Buffer | null> {
    try {
      const response = await axios.get(url, {
        responseType: 'arraybuffer',
        maxBodyLength: Infinity,
      })

      if (response?.data) {
        console.debug(
          'Base64 GIF:',
          Buffer.from(response.data).toString('base64'),
        )
        return Buffer.from(response.data, 'binary')
      } else {
        console.error('No se pudo descargar el GIF, respuesta vacía.')
        return null
      }
    } catch (error) {
      console.error(`${CONFIG.keyAlarm} downloadGif: `, error)
      return null
    }
  }
}
