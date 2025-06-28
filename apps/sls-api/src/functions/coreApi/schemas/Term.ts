import { z } from 'zod'

// Definición de subschemas reutilizables
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

// Tipo inferido de Zod
export type Term = z.infer<typeof termSchema>

const exampleTerm: Term = {
  _id: '60f4b6c3c9e6d4e5c4a9e7d1',
  srcLanguage: 'en',
  types: ['verb'],
  level: 'a1',
  toLanguage: 'es',
  isSentence: false,
  term: 'get',
  translation: 'conseguir',
  pronunciation: {
    phonetic: 'gɛt',
    nativePhonetic: 'guet',
    nativePhoneticDetails:
      "Para ser más específico: La 'g' es suave como en \"gato\", la 'e' es corta como en \"mesa\", la 't' final es una t suave, casi sin soltar el aire.",
  },
  examples: [
    {
      sentence: 'We need to get some beer somewhere.',
      sentenceNative: 'Tenemos que conseguir cerveza en alguna parte.',
    },
  ],
  tags: ['verb', 'common', 'irregular'],

  image: '',
  audio: '',

  dictionary: [
    {
      type: 'verb',
      baseTerm: 'get',
      entries: [
        {
          translation: 'obtener',
          reverseTranslation: ['get', 'obtain', 'earn', 'secure'],
        },
      ],
    },
  ],

  createdAt: new Date('2021-07-19T00:00:00Z').toISOString(),
  updatedAt: new Date('2021-07-19T00:00:00Z').toISOString(),
}
