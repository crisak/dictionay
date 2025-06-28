/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import axios from 'axios'
import { Binary, MongoClient, ObjectId, ServerApiVersion } from 'mongodb'
import { CONFIG } from '../utils'
import Anthropic from '@anthropic-ai/sdk'
import { GifApi, TranslateApi } from '../services'
import * as Schema from '../schemas'
import * as DB from '../models'
import { googleApiToTerm } from '../adapters'

const uriDB = `mongodb+srv://${CONFIG.dbUsername}:${CONFIG.dbPassword}@production.h5yse.mongodb.net/?retryWrites=true&w=majority&appName=production`

// Tipo para la respuesta esperada
interface IATranslationResponse {
  pronunciationPhonetic: string
  pronunciationNativePhonetic: string
  pronunciationNativePhoneticDetails: string
  exampleSentence: string
  exampleSentenceNative: string
  type: string[]
  level: Schema.Term['level']
}

type RequireFields = 'srcLanguage' | 'toLanguage' | 'term'

type CreateTermDto = Partial<Omit<Schema.Term, RequireFields>> &
  Pick<Schema.Term, RequireFields>

const clientDB = new MongoClient(uriDB, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

const anthropic = new Anthropic({
  apiKey: CONFIG.iaApiKey,
})

/**
 * {
    "_id": { "$oid": "60a3e5b9c7d4e12345678902" },
    "term": "sell",
    "nativeTranslation": "vender",
    "phoneticSymbols": "sɛl",
    "nativePronunciationGuide": "sel",
    "exampleSentence": "We need to sell more products this quarter.",
    "exampleSentenceTranslation": "Necesitamos vender más productos este trimestre.",
    "imageUrl": "https://example.com/images/sell.jpg",
    "audioUrl": "https://example.com/audio/sell.mp3",
    "type": ["verb", "irregular"],
    "tags": ["ecommerce", "business"]
  }
  */
export async function createTermController(body: CreateTermDto) {
  /**
   * Search term
   */
  const collection = await clientDB
    .db(CONFIG.dbName)
    .collection<DB.Term>(CONFIG.cl.terms)

  let termExist: DB.Term | null = null

  if (body._id) {
    termExist = await collection.findOne({ term: body._id })
  }

  if (termExist) {
    console.warn('Term already exists', termExist)

    throw {
      httpStatusCode: 409,
      message: 'Term already exists',
    }
  }

  const resultTranslateApi = await TranslateApi.text({
    sourceLanguage: body.srcLanguage || 'en',
    toLanguage: body.toLanguage || 'es',
    text: body.term,
  })

  const translateTerm = googleApiToTerm(resultTranslateApi)

  console.debug('Before request insert one: ', body)

  const isNotSentence = !body.isSentence

  let imageBuffer: Buffer | null = null
  if (isNotSentence && !body.image) {
    /** Image */
    const urlImage = await GifApi.fetchSearchGif(
      body.term,
      body.toLanguage || 'es',
    )

    if (urlImage) {
      imageBuffer = await GifApi.downloadGif(urlImage)
    }
  } else if (body?.image) {
    /**
     * body.image is a base64 image
     * Convert base64 to Buffer
     */
    imageBuffer = Buffer.from(body.image, 'base64')
  }

  let audioBuffer: Buffer | null = null
  if (isNotSentence && !body?.audio) {
    /** Audio */
    const audioBase64 = await TranslateApi.audio({
      sourceLanguage: body.srcLanguage,
      text: body.term,
    })

    if (audioBase64) {
      audioBuffer = Buffer.from(audioBase64, 'base64')
    }
  } else if (body?.audio) {
    /**
     * body.audio is a base64 audio
     * Convert base64 to Buffer
     */
    audioBuffer = Buffer.from(body.audio, 'base64')
  }

  let defaultResultIA: IATranslationResponse = {
    pronunciationPhonetic: '',
    pronunciationNativePhonetic: '',
    pronunciationNativePhoneticDetails: '',
    exampleSentence: '',
    exampleSentenceNative: '',
    type: [],
    level: 'a1',
  }
  if (isNotSentence) {
    defaultResultIA = await fetchAPIIntelligentAssistant(
      body.term,
      'en',
      'es',
    ).catch(() => {
      return defaultResultIA
    })

    console.debug('After get base64 audio: ', audioBuffer)
  }

  const mergeTypes = (() => {
    const bodyTypes = body.types || []
    const defaultTypes = defaultResultIA.type || []
    const translateTypes = translateTerm?.dictionary?.map((d) => d.type) || []

    const types = [...bodyTypes, ...defaultTypes, ...translateTypes].filter(
      Boolean,
    )

    return Array.from(new Set(types))
  })()

  const newTerm: DB.Term = {
    _id: new ObjectId(),
    term: body.term || '',
    level: defaultResultIA.level,
    types: mergeTypes,
    pronunciation: {
      phonetic: defaultResultIA.pronunciationPhonetic,
      nativePhonetic: defaultResultIA.pronunciationNativePhonetic,
      nativePhoneticDetails: defaultResultIA.pronunciationNativePhoneticDetails,
    },
    examples: [
      {
        sentence: defaultResultIA.exampleSentence,
        sentenceNative: defaultResultIA.exampleSentenceNative,
      },
    ],
    tags: body.tags || [],

    image: imageBuffer ? new Binary(imageBuffer) : null,
    audio: audioBuffer ? new Binary(audioBuffer) : null,

    createdAt: new Date(),
    updatedAt: new Date(),

    ...translateTerm,
    srcLanguage: body.srcLanguage || translateTerm.srcLanguage,
    toLanguage: body.toLanguage || 'es',
  }

  console.debug('Before event MDB: ', newTerm, audioBuffer)

  const resultNewTerm = await collection.insertOne(newTerm)

  /** Relacionar el termino con el usuario */
  const collectionUserTerms = await clientDB
    .db(CONFIG.dbName)
    .collection(CONFIG.cl.userTerms)

  // @ts-ignore
  const auth = global.dictionary.auth

  const userTerm: DB.UserTerm = {
    _id: new ObjectId(),
    userId: new ObjectId(String(auth.id)),
    termId: new ObjectId(resultNewTerm.insertedId),
    addedDate: new Date(),
    lastReviewed: null,
    nextReview: null,
    easeFactor: null,
    interval: 3,
    reviewHistory: [],
    tags: body.tags || [],
    isLearned: false,
  }

  const myTerm = await collectionUserTerms.insertOne(userTerm)

  return {
    ...newTerm,
    _id: resultNewTerm.insertedId,
    userTerm: {
      ...userTerm,
      _id: myTerm.insertedId,
    },
  }
}

async function fetchAPIIntelligentAssistant(
  term: string,
  srcLang: string,
  toLang: string,
): Promise<IATranslationResponse> {
  const prompt = `Translate "${term}" from ${srcLang} to ${toLang}. Respond ONLY with a valid JSON object in this exact format: 
{"pronunciationPhonetic": "","pronunciationNativePhonetic": "","pronunciationNativePhoneticDetails": "","exampleSentence": "","exampleSentenceNative": "", "type": [""]}
  
Fill the JSON as follows:
- pronunciationPhonetic: IPA phonetic symbols for "${term}" in ${srcLang}
- pronunciationNativePhonetic: Guide to pronounce "${term}" using ${toLang} phonetics
- pronunciationNativePhoneticDetails: Detailed explanation in ${toLang} about how to pronounce "${term}"
- exampleSentence: Example sentence in ${srcLang} using "${term}, wrap the exact term in <strong class="term"></strong>"
- exampleSentenceNative: Translation of the example sentence to ${toLang}, wrap the exact term in <strong class="term"></strong>"
- type: Array of types for "${term}" identify word type, if is phrase verb, grammar, grammar time, etc. etc. e.g. ["verb", "noun", "phrasal verb", "past participle", "irregular", ...]
- level: CEFR level of the term, e.g. a1, a2, b1, b2, c1, c2

Ensure all fields are filled correctly and provide natural, contextual examples.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1000,
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
    })

    console.debug(
      'Request IA:',
      JSON.stringify(
        {
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 1000,
          temperature: 0,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt,
                },
              ],
            },
          ],
          response,
        },
        null,
        2,
      ),
    )

    // Extraer y validar el JSON de la respuesta
    const jsonMatch = (response.content?.[0] as any)?.text?.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response')
    }

    const parsedResponse = JSON.parse(jsonMatch[0]) as IATranslationResponse

    // Validar que todos los campos requeridos estén presentes
    const requiredFields: (keyof IATranslationResponse)[] = [
      'pronunciationPhonetic',
      'pronunciationNativePhonetic',
      'pronunciationNativePhoneticDetails',
      'exampleSentence',
      'exampleSentenceNative',
      'type',
      'level',
    ]

    const missingFields = requiredFields.filter(
      (field) => !parsedResponse[field],
    )
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`)
    }

    return parsedResponse
  } catch (error) {
    console.error(`${CONFIG.keyAlarm} fetchAPIIntelligentAssistant: `, error)
    throw error
  }
}

/**
 * @deprecated
 */
export async function fetchSearchImage(term: string) {
  const splitWordsBySpace = term.split(/\s+/) || []
  if (!term || splitWordsBySpace.length > 4) {
    return null
  }

  const filterTerm = term.trim().toLowerCase()

  const config = {
    method: 'get',
    url: `${CONFIG.imgEndpoint}/search/photos?query=${filterTerm}&per_page=1&color=green`,
    headers: {
      Authorization: `Client-ID ${CONFIG.imgAccessKey}`,
    },
  }

  return axios
    .request(config)
    .then((response) => {
      console.debug('Result Image: ', response?.data?.results)
      return response?.data?.results?.[0]?.urls?.thumb || null
    })
    .catch((error) => {
      console.error(`${CONFIG.keyAlarm} fetchSearchImage: `, error)
      return null
    })
}

/**
 * @param {string} url
 * @returns {Promise<Buffer | null>}
 * @deprecated
 */
export async function downloadImage(url: string) {
  return axios
    .request({
      method: 'get',
      url,
      responseType: 'arraybuffer',
      maxBodyLength: Infinity,
    })
    .then((response) => {
      try {
        if (!response.data) {
          return null
        }

        return Buffer.from(response?.data, 'binary') || ''
      } catch (error) {
        console.error(
          'Error decode image:',
          error,
          'Result fetch image',
          response,
        )
        return null
      }
    })
    .catch((error) => {
      console.error('Error fetch image:', error)
      return Promise.resolve(null)
    })
}
