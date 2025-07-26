import { Binary, MongoClient, ObjectId, ServerApiVersion } from 'mongodb'
import { CONFIG } from '../utils'
import Anthropic from '@anthropic-ai/sdk'
import { GifApi, TranslateApi } from '../services'
import * as Schema from '../schemas'
import * as DB from '../models'
import { googleApiToTerm } from '../adapters'
import { RequestReBuildTerms } from '@repo/schemas'
import pLimit from 'p-limit'

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

type Result = {
  message: string
  list: Schema.Term[]
}

export async function reBuildTermsController(
  body: RequestReBuildTerms.Body,
): Promise<Result> {
  const collection = await clientDB
    .db(CONFIG.dbName)
    .collection<DB.Term>(CONFIG.cl.terms)

  // Create batch limiter for 25 concurrent operations
  const limit = pLimit(25)
  const updatedTerms: Schema.Term[] = []

  // Process terms in batches of 25
  const batchSize = 25
  const batches = []

  for (let i = 0; i < body.terms.length; i += batchSize) {
    batches.push(body.terms.slice(i, i + batchSize))
  }

  for (const batch of batches) {
    // Fetch existing terms from database
    const termIds = batch.map((term) => new ObjectId(term.id))
    const existingTerms = await collection
      .find({ _id: { $in: termIds } })
      .toArray()

    // Create mapping of id to existing term
    const existingTermsMap = new Map<string, DB.Term>()
    existingTerms.forEach((term) => {
      existingTermsMap.set(term._id.toString(), term)
    })

    // Separate terms that need IA processing
    const termsNeedingIA: {
      term: RequestReBuildTerms.Term
      existingTerm: DB.Term
      needsFields: ('pronunciation' | 'examples' | 'types' | 'level')[]
    }[] = []

    const directUpdates: {
      term: RequestReBuildTerms.Term
      existingTerm: DB.Term
    }[] = []

    // Analyze each term to determine processing needs
    for (const term of batch) {
      // for each 25 terms
      const existingTerm = existingTermsMap.get(term.id)
      if (!existingTerm) {
        console.warn(`Term with id ${term.id} not found in database`)
        continue
      }

      const needsFields: ('pronunciation' | 'examples' | 'types' | 'level')[] =
        []

      // Check which fields need IA processing
      if (term.pronunciation?.automatic) needsFields.push('pronunciation')
      if (term.examples?.automatic) needsFields.push('examples')
      if (term.types?.automatic) needsFields.push('types')
      if (term.level?.automatic) needsFields.push('level')

      if (needsFields.length > 0) {
        termsNeedingIA.push({ term, existingTerm, needsFields })
      } else {
        directUpdates.push({ term, existingTerm })
      }
    }

    // Process IA requests in batch if needed
    let iaResults: Map<string, IATranslationResponse> = new Map()

    if (termsNeedingIA.length > 0) {
      try {
        iaResults = await fetchBatchIA(
          termsNeedingIA.map((item) => ({
            id: item.term.id,
            term: item.existingTerm.term,
            needsFields: item.needsFields,
          })),
        )
      } catch (error) {
        console.error('Error processing IA batch:', error)
        // Continue with available data, skip IA updates for failed batch
      }
    }

    // Process all updates in parallel with limit
    const batchPromises = batch.map((term) =>
      limit(async () => {
        const existingTerm = existingTermsMap.get(term.id)
        if (!existingTerm) return null

        try {
          const updatedTerm = await processTermUpdate(
            term,
            existingTerm,
            iaResults.get(term.id),
            collection,
          )
          return updatedTerm
        } catch (error) {
          console.error(`Error updating term ${term.id}:`, error)
          return null
        }
      }),
    )

    const batchResults = await Promise.all(batchPromises)
    const validResults = batchResults.filter(Boolean) as Schema.Term[]
    updatedTerms.push(...validResults)
  }

  return {
    message: `Successfully updated ${updatedTerms.length} terms`,
    list: updatedTerms,
  }
}

async function fetchBatchIA(
  terms: {
    id: RequestReBuildTerms.Term['id']
    term: DB.Term['term']
    needsFields: ('pronunciation' | 'examples' | 'types' | 'level')[]
  }[],
): Promise<Map<string, IATranslationResponse>> {
  const termsData = terms.map((t) => ({
    id: t.id,
    term: t.term,
    fields: t.needsFields,
  }))

  const toLang = 'Spanish'
  const srcLang = 'English'

  const prompt = `Process the following terms and provide ONLY a valid JSON object with the specified fields for each term.

Terms to process:
${termsData.map((t) => `- ID: ${t.id}, Term: "${t.term}", Fields needed: ${t.fields.join(', ')}`).join('\n')}

Respond with a JSON object where each key is the term ID and the value contains only the requested fields:

{
  "term_id_1": {
    "pronunciationPhonetic": "IPA symbols if pronunciation requested",
    "pronunciationNativePhonetic": "${toLang} phonetic guide if pronunciation requested", 
    "pronunciationNativePhoneticDetails": "Detailed ${toLang} explanation if pronunciation requested",
    "exampleSentence": "${srcLang} example with <strong class='term'>term</strong> if examples requested",
    "exampleSentenceNative": "${toLang} translation with <strong class='term'>term</strong> if examples requested",
    "type": ["array", "of", "types"] if types requested, this should Array of types identify word type, if is phrase verb, grammar, grammar time, etc. etc. e.g. ["verb", "noun", "phrasal verb", "past participle", "irregular", ...]
    "level": "a1|a2|b1|b2|c1|c2" if level requested (CEFR level)
  }
}

Only include fields that were specifically requested for each term. Ensure all requested fields are properly filled.`

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 4000,
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

    const contentBlock = response.content?.[0]
    const textContent =
      contentBlock && contentBlock.type === 'text'
        ? (contentBlock as { type: 'text'; text: string }).text
        : ''

    const jsonMatch = textContent.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No valid JSON found in IA response:', textContent)
      throw new Error('No valid JSON found in IA response')
    }

    const parsedResponse = JSON.parse(jsonMatch[0])
    const resultMap = new Map<string, IATranslationResponse>()

    for (const [termId, data] of Object.entries(parsedResponse)) {
      resultMap.set(termId, data as IATranslationResponse)
    }

    return resultMap
  } catch (error) {
    console.error(`${CONFIG.keyAlarm} fetchBatchIA error:`, error)
    throw error
  }
}

async function processTermUpdate(
  termUpdate: RequestReBuildTerms.Term,
  existingTerm: DB.Term,
  iaResult?: IATranslationResponse,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  collection?: any,
): Promise<Schema.Term> {
  const updates: Partial<DB.Term> = {}

  // Process types
  if (termUpdate.types?.automatic && iaResult?.type) {
    updates.types = iaResult.type
  } else if (termUpdate.types?.value) {
    updates.types = termUpdate.types.value
  }

  // Process term
  if (termUpdate.term?.value) {
    updates.term = termUpdate.term.value
  }

  const newTerm = termUpdate.term?.value || existingTerm.term

  // Process translation
  if (termUpdate.translation?.automatic) {
    try {
      const translateResult = await TranslateApi.text({
        sourceLanguage: existingTerm.srcLanguage || 'en',
        toLanguage: existingTerm.toLanguage || 'es',
        text: newTerm,
      })
      const translateTerm = googleApiToTerm(translateResult)
      if (translateTerm.translation) {
        updates.translation = translateTerm.translation
      }
    } catch (error) {
      console.error('Translation API error:', error)
    }
  } else if (termUpdate.translation?.value) {
    updates.translation = termUpdate.translation.value
  }

  // Process image
  if (termUpdate.image?.automatic) {
    try {
      // TODO, Validate if always the same gif is used or i take develop random gif
      const urlImage = await GifApi.fetchSearchGif(
        newTerm,
        existingTerm.toLanguage || 'es',
      )

      if (urlImage) {
        const imageBuffer = await GifApi.downloadGif(urlImage)
        if (imageBuffer) {
          updates.image = new Binary(imageBuffer)
        }
      }
    } catch (error) {
      console.error('Image generation error:', error)
    }
  } else if (termUpdate.image?.value) {
    const imageBuffer = Buffer.from(termUpdate.image.value, 'base64')
    updates.image = new Binary(imageBuffer)
  }

  // Process pronunciation
  if (termUpdate.pronunciation?.automatic && iaResult) {
    updates.pronunciation = {
      phonetic: iaResult.pronunciationPhonetic || '',
      nativePhonetic: iaResult.pronunciationNativePhonetic || '',
      nativePhoneticDetails: iaResult.pronunciationNativePhoneticDetails || '',
    }
  } else if (termUpdate.pronunciation?.value) {
    updates.pronunciation = termUpdate.pronunciation.value
  }

  // Process examples
  if (termUpdate.examples?.automatic && iaResult) {
    if (iaResult.exampleSentence && iaResult.exampleSentenceNative) {
      updates.examples = [
        {
          sentence: iaResult.exampleSentence,
          sentenceNative: iaResult.exampleSentenceNative,
        },
      ]
    }
  } else if (termUpdate.examples?.value) {
    updates.examples = termUpdate.examples.value
  }

  // Process tags
  if (termUpdate.tags?.value) {
    updates.tags = termUpdate.tags.value
  }

  // Process dictionary
  if (termUpdate.dictionary?.value) {
    updates.dictionary = termUpdate.dictionary.value
  }

  // Process level
  if (termUpdate.level?.automatic && iaResult?.level) {
    updates.level = iaResult.level
  } else if (termUpdate.level?.value) {
    updates.level = termUpdate.level.value
  }

  // Add updatedAt timestamp
  updates.updatedAt = new Date()

  // Update in database if there are changes
  if (Object.keys(updates).length > 0 && collection) {
    await collection.updateOne(
      { _id: new ObjectId(termUpdate.id) },
      { $set: updates },
    )
  }

  // Return updated term
  const updatedTerm = { ...existingTerm, ...updates }

  // Convert to Schema.Term format (remove MongoDB specific fields and convert types)
  return {
    _id: updatedTerm._id.toString(),
    term: updatedTerm.term,
    translation: updatedTerm.translation,
    srcLanguage: updatedTerm.srcLanguage,
    toLanguage: updatedTerm.toLanguage,
    types: updatedTerm.types || [],
    isSentence: updatedTerm.isSentence || false,
    pronunciation: updatedTerm.pronunciation || {
      phonetic: '',
      nativePhonetic: '',
      nativePhoneticDetails: 'Pronunciation not available',
    },
    examples: updatedTerm.examples || [],
    tags: updatedTerm.tags || [],
    dictionary: updatedTerm.dictionary || [],
    level: updatedTerm.level || 'a1',
    image: updatedTerm.image ? updatedTerm.image.toString('base64') : undefined,
    audio: updatedTerm.audio ? updatedTerm.audio.toString('base64') : undefined,
    createdAt: updatedTerm.createdAt.toISOString(),
    updatedAt: updatedTerm.updatedAt.toISOString(),
  } as Schema.Term
}
