import { z } from 'zod'

const languageCodeSchema = z.string().length(2).toLowerCase()

const pronunciationSchema = z.object({
  phonetic: z.string(),
  nativePhonetic: z.string(),
  nativePhoneticDetails: z.string().min(10),
})

const exampleSchema = z.object({
  sentence: z.string().min(1),
  sentenceNative: z.string().min(1),
})

const dictionaryEntrySchema = z.object({
  translation: z.string().min(1),
  reverseTranslation: z.array(z.string().min(1)),
})

const dictionarySchema = z.object({
  type: z.string().min(1),
  baseTerm: z.string().min(1),
  entries: z.array(dictionaryEntrySchema),
})

// Esquema principal del término
export const termSchema = z.object({
  _id: z.string(),
  // Información básica
  srcLanguage: languageCodeSchema,
  toLanguage: languageCodeSchema,
  types: z.array(z.string()),
  // is a sentence
  isSentence: z.boolean(),

  term: z.string().min(1),
  translation: z.string().min(1),

  // Contenido multimedia (opcional)
  audio: z.string().optional(), // Base64
  image: z.string().optional(), // Base64

  // Pronunciación
  pronunciation: pronunciationSchema,

  // Ejemplos de uso
  examples: z.array(exampleSchema).min(1),

  // Etiquetas y metadata
  tags: z.array(z.string()),

  // Entradas de diccionario
  dictionary: z.array(dictionarySchema),
  // a1, a2, b1, b2, c1, c2
  level: z.enum(['a1', 'a2', 'b1', 'b2', 'c1', 'c2']),

  // Campos de metadata opcionales
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type Term = z.infer<typeof termSchema>
