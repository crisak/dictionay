/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react'
import { Text } from '../../../utils'
import { DictionaryApi, ResultGetTerm } from '../../../services'
import { usePopup } from './Popup'
import { useGlobalStore } from '../../../store/global'
import { useShallow } from 'zustand/shallow'
import Tags from './Tags'
import {
  BookCheckIcon,
  BookPlusIcon,
  LoaderIcon,
  SpeakerIcon,
} from 'lucide-react'

type TranslationResult = Partial<
  Pick<ResultGetTerm, 'audio' | 'image' | 'pronunciation'>
> & {
  _id: ResultGetTerm['_id']
  text: ResultGetTerm['translation']
  alternative: string[]
  type: string[]
}

interface PopupContentProps {
  word: string
}

/**
 * Colors
 * primary: #98ca3f
 * secondary: #6b7280
 * background: #070c00cc
 */
// Estilos base
const styles = {
  headerContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
  },
  audioButton: {
    marginRight: '8px',
    color: '#98ca3f',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordText: {
    color: '#98ca3f',
  },
  contentContainer: {
    minHeight: '60px',
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '4px',
  },
  loadingDot: (delay: number) => ({
    width: '6px',
    height: '6px',
    backgroundColor: '#98ca3f',
    borderRadius: '50%',
    animation: 'bounce 1s infinite',
    animationDelay: `${delay * 0.1}s`,
  }),
  translationText: {
    marginBottom: '4px',
  },
  phoneticText: {
    color: '#9ca3af',
    fontSize: '12px',
  },
  typeText: {
    color: '#9ca3af',
    fontSize: '14px',
    fontStyle: 'italic',
  },
  alternativesContainer: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '8px',
    marginTop: '4px',
  },
  alternativeTag: {
    backgroundColor: '#1c2b01d1',
    padding: '2px 8px',
    borderRadius: '4px',
    border: '1px solid #364e0bd1',
  },
  containerButtonSave: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',

    marginTop: '16px',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    border: '1px solid #98ca3f',
    color: '#98ca3f',
    padding: '2px 12px',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
} as const

export const PopupContent: React.FC<PopupContentProps> = ({ word }) => {
  const [translation, setTranslation] =
    React.useState<TranslationResult | null>(null)

  const [loading, setLoading] = React.useState({
    translation: true,
    save: false,
    audio: true,
  })

  const [auth, tags] = useGlobalStore(
    useShallow((state) => [state.auth, state.tags]),
  )

  // eslint-disable-next-line no-console
  console.count('Render <PopupContent />')

  const { onClose } = usePopup()

  const handlePlayAudio = async () => {
    // Audio functionality commented out as in original
    let baseAudio = translation?.audio

    if (!baseAudio) {
      setLoading({ ...loading, audio: true })

      baseAudio = await DictionaryApi.getAudio(word).finally(() => {
        setLoading({ ...loading, audio: false })
      })

      if (!baseAudio) return

      //@ts-ignore
      setTranslation((prev) => ({
        ...prev,
        audio: baseAudio || '',
      }))
    }

    const audio = new Audio(`data:audio/mpeg;base64,${baseAudio}`)
    audio.play()
  }

  const handleSaveTerm = async () => {
    setLoading({ ...loading, save: true })

    if (!translation) return

    await DictionaryApi.saveTerm({
      srcLanguage: 'en',
      toLanguage: 'es',
      term: Text.capitalize(word),
      tags: tags || [],
      audio: translation.audio || '',
      image: '',
    })
      .finally(() => {
        setLoading({ ...loading, save: false })
      })
      .then(() => {
        onClose()
      })
  }

  React.useEffect(() => {
    useGlobalStore.persist.rehydrate()
  }, [])

  React.useEffect(() => {
    if (auth?.apiKey) {
      DictionaryApi.setApiKey(auth.apiKey)
    }
  }, [auth?.apiKey])

  React.useEffect(() => {
    const fetchTranslation = async () => {
      if (!word || !word?.trim()) return

      try {
        const [result, audioBase64] = await Promise.all([
          DictionaryApi.translateText(word.trim()),
          DictionaryApi.getAudio(word.trim()),
        ]).finally(() => {
          setLoading({ ...loading, translation: false, audio: false })
        })

        if (!result) {
          setTranslation(null)
          return
        }

        const MAX_ALTERNATIVES = 10

        const alternative = result.dictionary
          .map(({ entries }) =>
            entries.map(({ translation }) => translation || ''),
          )
          .flat()
          .filter(Boolean)
          .slice(0, MAX_ALTERNATIVES)

        const types = result.dictionary.map(({ type }) => type).filter(Boolean)

        setTranslation({
          _id: result._id || '',
          text: result.translation,
          alternative: [...new Set(alternative)],
          type: [...new Set(types)],
          audio: result.audio || audioBase64 || '',
          image: result.image || '',
          pronunciation: result.pronunciation,
        })
      } catch (error) {
        console.error('Translation error:', error)
      }
    }

    fetchTranslation()
  }, [word])

  return (
    <div className="popup-content">
      <div style={styles.headerContainer}>
        <button
          type="button"
          style={styles.audioButton}
          onClick={handlePlayAudio}
        >
          {loading.audio && <LoaderIcon width={20} />}
          {!loading.audio && <SpeakerIcon width={20} />}
        </button>
        <span style={styles.wordText}>{word}</span>
      </div>

      <div style={styles.contentContainer}>
        {loading.translation ? (
          <div style={styles.loadingContainer}>
            {[0, 1, 2].map((i) => (
              <div key={i} style={styles.loadingDot(i)} />
            ))}
          </div>
        ) : (
          translation && (
            <div>
              {translation.pronunciation?.nativePhonetic && (
                <div style={styles.phoneticText}>
                  {`/${translation.pronunciation?.phonetic}/ ${translation.pronunciation?.nativePhonetic}`}
                </div>
              )}

              <div style={styles.translationText}>{translation.text}</div>
              <div style={styles.typeText}>
                {translation.type.slice(0, 2).join(', ')}
                <div style={styles.alternativesContainer}>
                  {translation.alternative.slice(0, 3).map((alt, i) => (
                    <span key={i} style={styles.alternativeTag}>
                      {alt.trim()}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )
        )}
      </div>

      <div style={styles.containerButtonSave}>
        <Tags />
        <div>
          <button
            disabled={loading.save || Boolean(translation?._id)}
            onClick={handleSaveTerm}
            style={styles.addButton}
          >
            {loading.save && <div style={styles.loadingDot(0)} />}

            {!loading.save && translation?._id ? (
              <BookCheckIcon width={20} />
            ) : (
              <BookPlusIcon width={20} />
            )}

            <span> {translation?._id ? 'Added' : 'Add'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}
