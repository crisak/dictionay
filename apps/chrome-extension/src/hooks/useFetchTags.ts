/**
 * Fetching data with API of Anki "./../services/AnkiService.ts"
 */
import { useEffect, useState } from 'react'
import { DictionaryApi } from '../services'
import { Tag } from '../types'
import { useGlobalStore } from '../store/global'

export const useFetchTags = () => {
  const [tags, setTags] = useState<Tag[]>([])
  const auth = useGlobalStore((state) => state.auth)
  const [loading, setLoading] = useState(false)

  const [error, setError] = useState<{
    title: string
    description: string
    details: string | React.ReactNode | null
  } | null>(null)

  const fetch = async (): Promise<Array<Tag>> => {
    try {
      setLoading(true)

      const result = await DictionaryApi.getTags()

      setTags(result)
      return result
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
      setLoading(false)
    }
  }

  useEffect(() => {
    if (auth.apiKey) {
      DictionaryApi.setApiKey(auth.apiKey)
    }
  }, [auth.apiKey])

  return {
    tags,
    loading,
    error,
    fetch,
  }
}
