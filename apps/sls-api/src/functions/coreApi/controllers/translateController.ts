import { MongoClient, ServerApiVersion } from 'mongodb'
import { TranslateApi } from '../services'
import { CONFIG } from '../utils'
import * as DB from '../models'
import * as Schema from '../schemas'
import { googleApiToTerm } from '../adapters'

const uriDB = `mongodb+srv://${CONFIG.dbUsername}:${CONFIG.dbPassword}@production.h5yse.mongodb.net/?retryWrites=true&w=majority&appName=production`

const clientDB = new MongoClient(uriDB, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})

/**
 *
 * @param {{
 *  text: string,
 *  source: string,
 *  to: string,
 * }} param0
 * @returns {Promise<{ text: string, alternative: string[], type: string[], audio: string }>}
 */
export async function translateController({
  text,
  to,
  source,
}): Promise<Schema.Term> {
  /**
   * Validar si el texto es un termino en la base de datos
   */

  const collection = await clientDB
    .db(CONFIG.dbName)
    .collection<DB.Term>(CONFIG.cl.terms)

  const termDB = await collection.findOne({ term: text })

  if (termDB?._id) {
    return {
      ...termDB,
      _id: termDB._id.toString(),
      updatedAt: termDB.updatedAt.toString(),
      createdAt: termDB.createdAt.toString(),
      audio: termDB.audio ? termDB.audio.toJSON() : '',
      image: termDB.image ? termDB.image.toJSON() : '',
    }
  }

  const result = await TranslateApi.text({
    toLanguage: to,
    text: text,
  })

  const termParse = googleApiToTerm(result)

  const mergeTypes = Array.from(
    new Set(termParse.dictionary.map((d) => d.type)),
  )

  return {
    _id: '',
    toLanguage: to,

    term: text,
    pronunciation: {
      phonetic: '',
      nativePhonetic: '',
      nativePhoneticDetails: '',
    },
    examples: [],
    tags: [],
    audio: '',
    image: '',

    level: 'a1',
    types: mergeTypes,

    ...termParse,
    srcLanguage: source || termParse.srcLanguage,
    createdAt: new Date().toString(),
    updatedAt: new Date().toString(),
  }
}
