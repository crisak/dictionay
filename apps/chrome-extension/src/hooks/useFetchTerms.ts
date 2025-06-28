/**
 * Fetching data with API of Anki "./../services/AnkiService.ts"
 */
import { useEffect, useState } from 'react'
import { AnkiService, DictionaryApi } from '../services'
import { CardVocabulary } from '../types'
import { Text } from '../utils'
import { useGlobalStore } from '../store/global'

const cls = (s?: string) => (s || '').toLowerCase().replace(/\s/g, '').trim()

export type Pagination = {
  page: number
  totalPages: number
  total: number
  limit: number
}

export const useFetchTerms = () => {
  const [cards, setCards] = useState<CardVocabulary[]>([])
  const [cardsAnki, setCardsAnki] = useState<CardVocabulary[]>([])
  const [cardsDictionary, setCardsDictionary] = useState<CardVocabulary[]>([])
  const auth = useGlobalStore((state) => state.auth)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20,
  })

  const [loading, setLoading] = useState({
    ankiTerms: false,
    dictionaryTerms: false,
    addTerm: false,
    removeTerm: false,
  })

  const [error, setError] = useState<{
    title: string
    description: string
    details: string | React.ReactNode | null
  } | null>(null)

  const fetchCardAnki = async () => {
    try {
      setLoading((prev) => ({ ...prev, ankiTerms: true }))

      const cardIds = await AnkiService.findNotes()
      const cardsInfo = await AnkiService.notesInfo(cardIds)

      return cardsInfo
    } catch (error) {
      const messageError =
        (error as Error).message ||
        'An error occurred while fetching the Anki cards'

      setError({
        title: 'Error',
        description: messageError,
        details: (error as Error).message ? '' : JSON.stringify(error),
      })

      return []
    } finally {
      setLoading((prev) => ({ ...prev, ankiTerms: false }))
    }
  }

  const fetchTermsApi = async (page?: number, limit?: number) => {
    try {
      setLoading((prev) => ({ ...prev, dictionaryTerms: true }))

      const result = await DictionaryApi.getTerms({
        limit: limit ?? pagination.limit,
        page: page ?? pagination.page,
      })

      const totalRecords = result.total || 0

      setPagination({
        page: result.page || 1,
        totalPages: Math.ceil(totalRecords / (result.limit || 20)),
        total: totalRecords,
        limit: result.limit || 20,
      })

      return result?.list || []
    } catch (error) {
      const messageError =
        (error as Error).message ||
        'An error occurred while fetching the dictionary terms'

      setError({
        title: 'Error',
        description: messageError,
        details: (error as Error).message ? '' : JSON.stringify(error),
      })

      return []
    } finally {
      setLoading((prev) => ({ ...prev, dictionaryTerms: false }))
    }
  }

  const fetchTerms = async (page?: number, limit?: number) => {
    const [listTermsAnki, listTermsApi] = await Promise.all([
      fetchCardAnki(),
      fetchTermsApi(page, limit),
    ])

    setCardsAnki(listTermsAnki)
    setCardsDictionary(listTermsApi)

    /**
     * Se debe identificar cuales terminos no se encuentran en la lista de Anki
     * que se encuentran en la lista de la API de diccionario, si se encuentran la propiedad `sync` debe ser `true` de lo contrario `false`
     */
    const cards = listTermsApi.map((term) => {
      const found = listTermsAnki.find(
        (card) => Text.cls(card.term) === Text.cls(term.term),
      )

      return {
        ...term,
        sync: !!found,
      }
    })

    setCards(cards)
  }

  const addTermToAnki = async (term: CardVocabulary) => {
    try {
      setLoading((prev) => ({ ...prev, addTerm: true }))

      const newCard = await AnkiService.addNote({
        ...term,
        sync: true,
      })

      setCards(
        cards.map((card) =>
          card.id === term.id
            ? {
                ...card,
                sync: true,
              }
            : card,
        ),
      )

      setCardsAnki([...cardsAnki, newCard])
    } catch (error) {
      throw {
        title: 'Error',
        description: 'An error occurred while adding the term',
        details: (error as Error).message ? '' : JSON.stringify(error),
      }
    } finally {
      setLoading((prev) => ({ ...prev, addTerm: false }))
    }
  }

  const addTermsToAnki = async (terms: CardVocabulary[]) => {
    try {
      setLoading((prev) => ({ ...prev, addTerm: true }))

      const mapTerms = terms.map((term) => ({
        ...term,
        sync: true,
      }))

      await AnkiService.addNotes(mapTerms)
      await fetchTerms()
    } catch (error) {
      throw {
        title: 'Error',
        description: 'An error occurred while adding the terms',
        details: (error as Error).message ? '' : JSON.stringify(error),
      }
    } finally {
      setLoading((prev) => ({ ...prev, addTerm: false }))
    }
  }

  /**
   * Remove from API and Anki
   */
  const removeTermApi = async (id: CardVocabulary['id'], term: string) => {
    try {
      setLoading((prev) => ({ ...prev, removeTerm: true }))

      await DictionaryApi.removeTerm(id).finally(() => {
        setLoading((prev) => ({ ...prev, removeTerm: false }))
      })

      /**
       * Handler card from anki and main cards
       */
      setCardsDictionary(cardsDictionary.filter((card) => card.id !== id))

      const existeTermInAnki = cardsAnki.find(
        (card) => cls(card.term) === cls(term),
      )

      if (existeTermInAnki) {
        await AnkiService.removeNotes([Number(id)])
        setCardsAnki(cardsAnki.filter((card) => card.id !== id))
      }

      setCards(cards.filter((card) => card.id !== id))

      return true
    } catch (error) {
      throw {
        title: 'Error',
        description: 'An error occurred while removing the term',
        details: (error as Error).message ? '' : JSON.stringify(error),
      }
    }
  }

  const removeTermToAnki = async (id: CardVocabulary['id'], term: string) => {
    try {
      setLoading((prev) => ({ ...prev, removeTerm: true }))

      await AnkiService.removeNotes([Number(id)])

      /**
       * Handler card from anki and main cards
       */
      setCardsAnki(cardsAnki.filter((card) => card.id !== id))

      const existeTermInDictionary = cardsDictionary.find(
        (card) => cls(card.term) === cls(term),
      )

      console.debug('existeTermInDictionary', existeTermInDictionary)

      setCards(
        cards.filter((card) => {
          const match = cls(card.term) === cls(term)
          if (existeTermInDictionary && match) {
            console.debug('setCards.match', match)
            return {
              ...card,
              sync: false,
            }
          }

          if (match) {
            console.debug('setCards.match', match)
            return false
          }

          return true
        }),
      )

      return true
    } catch (error) {
      throw {
        title: 'Error',
        description: 'An error occurred while removing the term',
        details: (error as Error).message ? '' : JSON.stringify(error),
      }
    } finally {
      setLoading((prev) => ({ ...prev, removeTerm: false }))
    }
  }

  const syncConfigToAnki = async () => {
    await AnkiService.setupDeckAndNoteType()
    await fetchTerms()
  }

  useEffect(() => {
    console.debug('useFetchTerms useEffect[]', auth.apiKey)
    if (auth.apiKey) {
      DictionaryApi.setApiKey(auth.apiKey)
    }
  }, [auth.apiKey])

  return {
    cards,
    cardsAnki,
    cardsDictionary,
    loading,
    error,
    pagination,
    syncConfigToAnki,
    fetchTerms,
    removeTermApi,
    addTermToAnki,
    addTermsToAnki,
    removeTermToAnki,
  }
}
