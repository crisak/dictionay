export interface ResultGetTerm {
  _id: string

  // Información de idiomas
  srcLanguage: LanguageCode
  toLanguage: LanguageCode

  types: string[]
  level: 'a1' | 'a2' | 'b1' | 'b2' | 'c1' | 'c2'

  // Indicador de oración
  isSentence: boolean

  // Términos principales
  term: string
  translation: string

  // Contenido multimedia opcional
  audio?: string // Base64
  image?: string // Base64

  // Pronunciación
  pronunciation: Pronunciation

  // Ejemplos de uso
  examples: Example[]

  // Etiquetas
  tags: string[]

  // Entradas de diccionario
  dictionary: Dictionary[]

  // Campos de metadata opcionales
  createdAt?: Date
  updatedAt?: Date
}

// Tipos básicos
type LanguageCode = string // Código de 2 letras en minúsculas

// Interfaz para pronunciación
interface Pronunciation {
  phonetic: string
  nativePhonetic: string
  nativePhoneticDetails: string
}

// Interfaz para ejemplos
interface Example {
  sentence: string
  sentenceNative: string
}

// Interfaces para diccionario
interface DictionaryEntry {
  translation: string
  reverseTranslation: string[]
}

interface Dictionary {
  type: string
  baseTerm: string
  entries: DictionaryEntry[]
}

export type CreateTermDto = Pick<
  ResultGetTerm,
  'term' | 'srcLanguage' | 'toLanguage'
> &
  Partial<Pick<ResultGetTerm, 'audio' | 'image' | '_id' | 'tags'>>

export type ResultAudioDto = {
  /**
   * Audio in base64 format
   */
  audio: string
}
