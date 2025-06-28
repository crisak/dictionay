export default class Text {
  /**
   * Funcion para limpiar los caracteres especiales de un string
   * - Espacios o saltos de linea
   * - Caracteres especiales y acentos
   * - Convertir a minusculas
   */
  static cls(
    str: string | undefined | null,
    optInput?: {
      spaces?: boolean
      accents?: boolean
    },
  ) {
    const opt = {
      spaces: optInput?.spaces ?? true,
      accents: optInput?.accents ?? true,
    }

    if (!str) return ''

    let cleanStr = str

    if (opt.spaces) {
      cleanStr = cleanStr.replace(/[\s\n]/g, '')
    }

    if (opt.accents) {
      cleanStr = cleanStr.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    }

    return cleanStr.toLowerCase().trim()
  }

  static isBase64(src: string) {
    if (src.includes('http') || src.includes('https')) return false
    if (src.includes('src=')) return false
    if (src.length < 50) return false
    return true
  }

  /**
   * Función que permite colocar la primera letra de un string en mayúscula
   */
  static capitalize(str: string) {
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  static strImgToHtml(image: string) {
    if (!image) {
      return ''
    }

    const hasHtmlFormat = image.includes('<img')

    if (hasHtmlFormat) {
      return image
    }

    if (Text.isBase64(image)) {
      /**
       * Generar <img> con el src en base64
       */
      const base64 = `data:image/png;base64,${image}`
      return `<img src="${base64}" class="drawing">`
    }

    const isHttp = image.includes('http') || image.includes('https')

    if (isHttp) {
      return `<img src="${image}" class="drawing">`
    }

    return image
  }
}
