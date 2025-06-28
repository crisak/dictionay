import { SETTINGS } from '../../config'
import { CardVocabulary } from '../../types'
import { Text } from '../../utils'
// import templatesMd from './../../anki-template/templates.md?raw'
// import backTemplate from '@repo/anki-templates/normal/back.template.anki'
// import frontTemplate from '@repo/anki-templates/normal/front.template.anki'
// import cssTemplate from '@repo/anki-templates/normal/style.css'
import type {
  AnkiConnectResponse,
  ExtractedTemplates,
  Fields,
  ModelStructure,
  ModelTemplate,
  ResultNoteInfo,
} from './AnkiTypes'

const cls = (str: string) => {
  /**
   * - Volver el string en minúsculas
   * - Reemplazar los espacios por guiones
   */
  if (!str) return ''

  return str.toLowerCase().trim().replace(/\s/g, '-')
}

/**
 * @link https://foosoft.net/projects/anki-connect/index.html#card-actions
 */
export default class AnkiService {
  static DECK_NAME = 'Dictionary'
  static MODEL_NAME = 'Basic + Dictionary'
  static ENDPOINT = SETTINGS.API_ANKI.URL

  static async findNotes(defaultDeck = AnkiService.DECK_NAME) {
    try {
      const myHeaders = new Headers()
      myHeaders.append('Content-Type', 'application/json')

      const raw = JSON.stringify({
        action: 'findNotes',
        version: 6,
        params: {
          query: `deck:${defaultDeck}`,
        },
      })

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      } as RequestInit

      const { result, error } = await fetch(
        AnkiService.ENDPOINT,
        requestOptions,
      ).then((response) => response.json())

      if (error) {
        throw error
      }

      /**
       * Return list of card ids
       */
      return result as Array<number>
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  static async notesInfo(ids: Array<number>) {
    try {
      const myHeaders = new Headers()
      myHeaders.append('Content-Type', 'application/json')

      const raw = JSON.stringify({
        action: 'notesInfo',
        version: 6,
        params: {
          notes: ids,
        },
      })

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      } as RequestInit

      const { result, error } = await fetch(
        AnkiService.ENDPOINT,
        requestOptions,
      ).then((response) => response.json())

      if (error) {
        throw error
      }

      const list = (result || []) as Array<ResultNoteInfo>

      /**
       *       'Front',
               'Back',
               'AlternativesNative',
               'Image',
               'Audio',
               'Example',
               'ExampleNative',
               'Phonetic',
               'PhoneticNative',
               'PhoneticNativeDetails',
               'Type',
       */

      return list.map<CardVocabulary>((card) => ({
        id: String(card.noteId),
        term: card.fields.Front.value || '',
        nativeTranslation: card.fields.Back.value || '',
        nativeTranslationAlternatives:
          card.fields.AlternativesNative.value?.split('\n') || [],
        phoneticSymbols: card.fields.Phonetic.value || '',
        nativePronunciationGuide: card.fields.PhoneticNative.value || '',
        exampleSentence: card.fields.Example.value || '',
        exampleSentenceTranslation: card.fields.ExampleNative.value || '',
        detail: '',
        image: card.fields.Image.value || '',
        audio: card.fields.Audio.value || '',
        type: card.fields.Type.value?.split(', ') || [],

        tags: card.tags.map((tag) => tag.replace(/-/g, ' ')),
        sync: true,
      }))
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  static async addNote(note: CardVocabulary) {
    try {
      const myHeaders = new Headers()
      myHeaders.append('Content-Type', 'application/json')

      const filterNote: CardVocabulary = {
        ...note,
        term: Text.capitalize(note.term),
        nativeTranslation: Text.capitalize(note.nativeTranslation),
      }

      const [shortPhoneticNative, longPhoneticNative] =
        filterNote?.nativePronunciationGuide?.split('/ ') || []

      const raw = JSON.stringify({
        action: 'addNote',
        version: 6,
        params: {
          note: {
            deckName: AnkiService.DECK_NAME,
            modelName: AnkiService.MODEL_NAME,
            fields: {
              Front: filterNote.term, // text lowercase
              Back: filterNote.nativeTranslation, // text
              AlternativesNative:
                filterNote.nativeTranslationAlternatives.join('\n'), // <div class="container_type">...</div>\n<div class="container_type">...</div>\n
              Image: filterNote.image, // base64, ege: aywlkajsdh...
              Audio: filterNote.audio, // base64, ege: aywlkajsdh...
              Example: filterNote.exampleSentence, // html
              ExampleNative: filterNote.exampleSentenceTranslation, // html
              Phonetic: filterNote.phoneticSymbols, // text
              PhoneticNative: shortPhoneticNative
                ? `${shortPhoneticNative}/`
                : '', // text
              PhoneticNativeDetails: longPhoneticNative || '', // text
              Type: filterNote.type?.join(', ') || '', // text, ege: noun, verb, adjetive
            } as Record<keyof Fields, string>,
            options: {
              allowDuplicate: false,
              duplicateScope: 'deck',
              duplicateScopeOptions: {
                deckName: 'Default',
                checkChildren: false,
                checkAllModels: false,
              },
            },
            tags: (() => {
              const originalTags =
                filterNote.tags?.map(cls).filter(Boolean) || []
              const types = filterNote.type?.map(cls).filter(Boolean) || []

              const tags = Array.from(new Set([...originalTags, ...types]))
              return tags
            })(),

            audio: [],
            video: [],
            picture: [],
          },
        },
      })

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      } as RequestInit

      const { result, error } = await fetch(
        AnkiService.ENDPOINT,
        requestOptions,
      ).then((response) => response.json())

      if (error) {
        throw error
      }

      return {
        ...filterNote,
        id: result,
      } as CardVocabulary
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  static async addNotes(notes: Array<CardVocabulary>) {
    try {
      const myHeaders = new Headers()
      myHeaders.append('Content-Type', 'application/json')

      const filterNotes = notes.map((note) => ({
        ...note,
        term: Text.capitalize(note.term),
        nativeTranslation: Text.capitalize(note.nativeTranslation),
      }))

      const raw = JSON.stringify({
        action: 'addNotes',
        version: 6,
        params: {
          notes: filterNotes.map((filterNote) => {
            // Obtener los valores de pronunciación nativa
            const [shortPhoneticNative, longPhoneticNative] =
              filterNote?.nativePronunciationGuide?.split('/ ') || []

            return {
              deckName: AnkiService.DECK_NAME,
              modelName: AnkiService.MODEL_NAME,
              fields: {
                Front: filterNote.term,
                Back: filterNote.nativeTranslation,
                AlternativesNative:
                  filterNote.nativeTranslationAlternatives.join('\n'),
                Image: filterNote.image,
                Audio: filterNote.audio,
                Example: filterNote.exampleSentence,
                ExampleNative: filterNote.exampleSentenceTranslation,
                Phonetic: filterNote.phoneticSymbols,
                PhoneticNative: shortPhoneticNative
                  ? `${shortPhoneticNative}/`
                  : '',
                PhoneticNativeDetails: longPhoneticNative || '',
                Type: filterNote.type?.join(', ') || '',
              },
              options: {
                allowDuplicate: false,
                duplicateScope: 'deck',
                duplicateScopeOptions: {
                  deckName: 'Default',
                  checkChildren: false,
                  checkAllModels: false,
                },
              },
              tags: (() => {
                const originalTags =
                  filterNote.tags?.map(cls).filter(Boolean) || []
                const types = filterNote.type?.map(cls).filter(Boolean) || []

                const tags = Array.from(new Set([...originalTags, ...types]))
                return tags
              })(),
              audio: [],
              video: [],
              picture: [],
            }
          }),
        },
      })

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      } as RequestInit

      const { result, error } = await fetch(
        AnkiService.ENDPOINT,
        requestOptions,
      ).then((response) => response.json())

      if (error) {
        throw error
      }

      return result as Array<number>
    } catch (error) {
      console.error(error)
      throw error
    }
  }
  static async removeNotes(ids: Array<number>) {
    try {
      const myHeaders = new Headers()
      myHeaders.append('Content-Type', 'application/json')

      const raw = JSON.stringify({
        action: 'deleteNotes',
        version: 6,
        params: {
          notes: ids,
        },
      })

      const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow',
      } as RequestInit

      const { result, error } = await fetch(
        AnkiService.ENDPOINT,
        requestOptions,
      ).then((response) => response.json())

      if (error) {
        throw error
      }

      return result as Array<number>
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  static async setupDeckAndNoteType(
    deckName: string = AnkiService.DECK_NAME,
    modelName: string = AnkiService.MODEL_NAME,
  ): Promise<boolean> {
    try {
      const decks: string[] = await AnkiService.getDeckNames()
      if (!decks.includes(deckName)) {
        await AnkiService.createDeck(deckName)
      }

      const models: string[] = await AnkiService.getModelNames()
      const modelExists: boolean = models.includes(modelName)

      const templates = await AnkiService.loadTemplates()

      console.debug(...Object.values(templates))

      const modelStructure: ModelStructure = {
        modelName: modelName,
        inOrderFields: [
          'Front',
          'Back',
          'AlternativesNative',
          'Image',
          'Audio',
          'Example',
          'ExampleNative',
          'Phonetic',
          'PhoneticNative',
          'PhoneticNativeDetails',
          'Type',
        ],
        css: templates.css,
        cardTemplates: [
          {
            Name: 'Card 1',
            Front: templates.front,
            Back: templates.back,
          },
        ],
      }

      if (!modelExists) {
        await AnkiService.createModel(modelStructure)
      } else {
        await AnkiService.updateModelTemplates(
          modelName,
          modelStructure.cardTemplates[0],
        )
        await AnkiService.updateModelStyling(modelName, modelStructure.css)

        const existingFields: string[] =
          await AnkiService.modelFieldNames(modelName)
        const missingFields: string[] = modelStructure.inOrderFields.filter(
          (field) => !existingFields.includes(field),
        )

        for (const field of missingFields) {
          await AnkiService.modelFieldAdd(modelName, field)
        }
      }

      return true
    } catch (error) {
      console.error('Error setting up deck and note type:', error)
      throw error
    }
  }

  private static async getDeckNames(): Promise<string[]> {
    const response = await fetch(AnkiService.ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'deckNames',
        version: 6,
      }),
    })
    const { result }: AnkiConnectResponse<string[]> = await response.json()
    return result
  }

  private static async createDeck(deckName: string): Promise<void> {
    const response = await fetch(AnkiService.ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createDeck',
        version: 6,
        params: {
          deck: deckName,
        },
      }),
    })
    const { error }: AnkiConnectResponse<number> = await response.json()
    if (error) throw new Error(error)
  }

  private static async getModelNames(): Promise<string[]> {
    const response = await fetch(AnkiService.ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'modelNames',
        version: 6,
      }),
    })
    const { result }: AnkiConnectResponse<string[]> = await response.json()
    return result
  }

  private static async createModel(modelConfig: ModelStructure): Promise<void> {
    const response = await fetch(AnkiService.ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'createModel',
        version: 6,
        params: modelConfig,
      }),
    })
    const { error }: AnkiConnectResponse<null> = await response.json()
    if (error) throw new Error(error)
  }

  private static async modelFieldNames(modelName: string): Promise<string[]> {
    const response = await fetch(AnkiService.ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'modelFieldNames',
        version: 6,
        params: {
          modelName,
        },
      }),
    })
    const { result }: AnkiConnectResponse<string[]> = await response.json()
    return result
  }

  private static async modelFieldAdd(
    modelName: string,
    fieldName: string,
  ): Promise<void> {
    const response = await fetch(AnkiService.ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'modelFieldAdd',
        version: 6,
        params: {
          modelName,
          fieldName,
        },
      }),
    })
    const { error }: AnkiConnectResponse<null> = await response.json()
    if (error) throw new Error(error)
  }

  private static async updateModelTemplates(
    modelName: string,
    template: ModelTemplate,
  ): Promise<void> {
    const response = await fetch(AnkiService.ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateModelTemplates',
        version: 6,
        params: {
          model: {
            name: modelName,
            templates: {
              'Card 1': {
                Front: template.Front,
                Back: template.Back,
              },
            },
          },
        },
      }),
    })
    const { error }: AnkiConnectResponse<null> = await response.json()
    if (error) throw new Error(error)
  }

  private static async updateModelStyling(
    modelName: string,
    css: string,
  ): Promise<void> {
    const response = await fetch(AnkiService.ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateModelStyling',
        version: 6,
        params: {
          model: {
            name: modelName,
            css,
          },
        },
      }),
    })
    const { error }: AnkiConnectResponse<null> = await response.json()
    if (error) throw new Error(error)
  }

  static loadTemplates() {
    try {
      return AnkiService.extractTemplates()
    } catch (error) {
      console.error('Error loading templates:', error)
      throw error
    }
  }

  static async extractTemplates(): Promise<ExtractedTemplates> {
    const [fromTemplate, backTemplate, cssTemplate] = await Promise.all([
      import('@repo/anki-templates/normal/front.template.anki?raw').then(
        (module) => module.default,
      ),
      import('@repo/anki-templates/normal/back.template.anki?raw').then(
        (module) => module.default,
      ),
      import('@repo/anki-templates/normal/style.css?raw').then(
        (module) => module.default,
      ),
    ])

    return {
      front: fromTemplate,
      back: backTemplate,
      css: cssTemplate,
    }
  }
}
