/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react'
import { Button, Input, MultiSelect } from '../components/ui'
import { Languages, BookAIcon, Volume2Icon, BookCheckIcon } from 'lucide-react'
import { DictionaryApi, ResultGetTerm } from '../services'
import { Text } from '../utils'
import { AuthProvider } from '../features/authentication/componentes'
import { useGlobalStore } from '../store/global'
import { useShallow } from 'zustand/shallow'

type TranslateDetail = Partial<
  Pick<ResultGetTerm, 'audio' | 'image' | 'pronunciation'>
> & {
  _id: ResultGetTerm['_id']
  text: ResultGetTerm['translation']
  alternative: string[]
  type: string[]
}

const DEFAULT_TAGS = [
  'cmx1',
  'cmx2',
  'cmx3',
  'finance & accounting',
  'sales & merchandising',
  'supply chain & operations',
  'technology & data',
  'digital marketing',
  'a2 unit1',
  'a2 unit2',
  'a2 unit3',
  'a2 unit4',
  'a2 unit5',
  'a2 unit6',
  'a2 unit7',
  'a2 unit8',
  'a2 unit9',
  'a2 unit10',
]

export default function TopPopupPage() {
  const [textToTranslate, setTextToTranslate] = useState('')
  const refAudio = useRef<HTMLAudioElement>(null)
  const [translateDetail, setTranslateDetail] = useState<TranslateDetail>({
    _id: '',
    text: '',
    alternative: [],
    type: [],
    audio: '',
    image: '',
  })
  const [loading, setLoading] = useState(false)
  const store = useGlobalStore(
    useShallow((state) => ({
      auth: state.auth,
      tags: state.tags,
      listTags: state.listTags,
      setTags: state.setTags,
      setListTags: state.setListTags,
    })),
  )

  const fetchTranslate = async (text: string) => {
    setLoading(true)

    const result = await DictionaryApi.translateText(text).finally(() => {
      setLoading(false)
    })

    if (!result) {
      setTranslateDetail({
        _id: '',
        text: '',
        alternative: [],
        type: [],
        audio: '',
        image: '',
      })
      return
    }

    const MAX_ALTERNATIVES = 10

    const alternative = result.dictionary
      .map(({ entries }) => entries.map(({ translation }) => translation || ''))
      .flat()
      .filter(Boolean)
      .slice(0, MAX_ALTERNATIVES)

    const types = result.dictionary.map(({ type }) => type).filter(Boolean)

    const textTranslated = Text.capitalize(result?.translation || '')

    setTranslateDetail({
      _id: result._id || '',
      text: textTranslated,
      alternative: [...new Set(alternative)],
      type: [...new Set(types)],
      audio: result.audio || '',
      image: result.image || '',
      pronunciation: result.pronunciation,
    })
  }

  const handleTranslate = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!textToTranslate) return

    await fetchTranslate(textToTranslate)
  }

  useEffect(() => {
    if (store.auth?.apiKey) {
      DictionaryApi.setApiKey(store.auth.apiKey)
    }
  }, [store.auth?.apiKey])

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    const handleChange = () => {
      if (mediaQuery.matches) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    const translateSelectedText = async () => {
      // Query the active tab when component mounts
      ;(chrome as any)?.tabs?.query(
        { active: true, currentWindow: true },
        (tabs: any) => {
          ;(chrome as any).tabs.sendMessage(
            tabs[0].id,
            { action: 'getSelectedText' },
            (response: any) => {
              if (response && response.selectedText) {
                setTextToTranslate(response.selectedText)
                fetchTranslate(response.selectedText)
              }
            },
          )
        },
      )
    }

    handleChange()
    mediaQuery.addListener(handleChange)
    translateSelectedText()

    return () => mediaQuery.removeListener(handleChange)
  }, [])

  return (
    <div className="w-[400px] bg-card/20 p-4 shadow-lg rounded-lg border border-green-950">
      <AuthProvider>
        <div>
          <form onSubmit={handleTranslate} className="flex flex-col space-y-3">
            <div className="flex items-center space-x-4">
              <div className="relative flex-grow">
                <Input
                  type="text"
                  placeholder="Ingrese texto"
                  size="xs"
                  value={textToTranslate}
                  onChange={(e) => setTextToTranslate(e.target.value)}
                  icon={
                    translateDetail?.text ? (
                      <span>
                        <audio
                          ref={refAudio}
                          className="hidden"
                          controls
                          src={`data:audio/mp3;base64,${translateDetail.audio}`}
                        />

                        <Button
                          type="button"
                          size="medium"
                          variant="ghost"
                          className="mr-2 text-green-400 hover:bg-green-400/10 border border-green-950 w-[20px] h-[20px] flex items-center justify-center !py-0 !px-0"
                          onClick={async () => {
                            if (!textToTranslate) return

                            /**
                             * validate if the value is already in the store
                             */

                            const textAudio = Text.capitalize(textToTranslate)

                            if (
                              textAudio ===
                                Text.capitalize(translateDetail.text) &&
                              translateDetail.audio
                            ) {
                              refAudio.current?.play()
                              return
                            }

                            const audioBase64 =
                              await DictionaryApi.getAudio(textAudio)

                            setTranslateDetail((prev) => ({
                              ...prev,
                              audio: audioBase64 || '',
                            }))

                            setTimeout(() => {
                              refAudio.current?.play()
                            }, 100)
                          }}
                        >
                          <Volume2Icon size={20} />
                        </Button>
                      </span>
                    ) : (
                      <Languages className="text-primary" size={20} />
                    )
                  }
                  autoFocus
                />
              </div>
              <Button
                isLoading={loading}
                type="submit"
                disabled={!textToTranslate}
                size="small"
              >
                Traducir
              </Button>
            </div>

            {translateDetail?.text && (
              <>
                <div className="bg-green-950/50 p-3 rounded-md text-sm text-gray-200 flex  justify-between">
                  {/* <div className="flex items-center">
              </div> */}

                  {translateDetail.pronunciation?.phonetic && (
                    <p className="text-gray-400">
                      <span
                        title={
                          translateDetail.pronunciation?.nativePhoneticDetails
                        }
                      >
                        {`/${translateDetail.pronunciation?.phonetic}/ ${translateDetail.pronunciation?.nativePhonetic}`}
                      </span>
                    </p>
                  )}

                  <p>{translateDetail?.text}</p>
                  <Button
                    title={
                      translateDetail._id ? 'Term already saved' : 'Save term'
                    }
                    isLoading={loading}
                    disabled={Boolean(translateDetail?._id)}
                    type="button"
                    size="medium"
                    variant="ghost"
                    className="ml-2 text-green-400 hover:bg-green-400/10 border border-green-950"
                    onClick={async () => {
                      if (!textToTranslate) return

                      setLoading(true)

                      await DictionaryApi.saveTerm({
                        _id: translateDetail._id,
                        srcLanguage: 'en',
                        toLanguage: 'es',
                        term: Text.capitalize(textToTranslate),
                        tags: store.tags || [],
                        audio: translateDetail.audio || '',
                        image: translateDetail.image || '',
                      }).finally(() => {
                        setLoading(false)
                        // window.close();
                      })

                      setTextToTranslate('')
                      setTranslateDetail({
                        _id: '',
                        alternative: [],
                        audio: '',
                        text: '',
                        type: [],
                        image: '',
                      })
                    }}
                  >
                    {translateDetail._id ? (
                      <BookCheckIcon size={16} />
                    ) : (
                      <BookAIcon size={16} />
                    )}
                  </Button>
                </div>

                {translateDetail.type.length > 0 && (
                  <div className="text-sm mt-4">
                    <span className="text-gray-200">
                      {translateDetail.type.join('/')}:{' '}
                    </span>

                    <span className="text-gray-400">
                      {translateDetail.alternative.join(', ')}
                    </span>
                  </div>
                )}
              </>
            )}

            <details className="my-4 text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
              <summary>
                Tags{' '}
                {(store.tags?.length
                  ? `(${store.tags?.length})`
                  : ''
                ).toString()}
              </summary>
              <div className="pt-3">
                <MultiSelect
                  options={
                    store?.listTags?.length ? store.listTags : DEFAULT_TAGS
                  }
                  values={store?.tags || []}
                  onChange={(selected) => {
                    console.debug('Selected tags:', selected)
                    store.setTags(selected)
                    store.setListTags(
                      (() => {
                        /**
                         * Validates if there are new tags to add to the store list
                         * if not, return the current list
                         * 1. Clearify the selected tags
                         * 2. Filter the selected tags that are not in the store
                         * 3. If there are new tags, add them to the store
                         */

                        const mergeTags = [
                          ...new Set([
                            ...(DEFAULT_TAGS || []),
                            ...(store.listTags || []).filter(Boolean),
                          ]),
                        ]

                        const clearText = (text: string) =>
                          text.trim().toLowerCase()

                        const selectedTags = selected
                          .map(clearText)
                          .filter(Boolean)

                        const newTags = selectedTags.filter(
                          (tag) => !mergeTags?.includes(tag),
                        )

                        if (newTags.length === 0) return mergeTags

                        return [...mergeTags, ...newTags]
                      })(),
                    )
                  }}
                />
              </div>
            </details>
          </form>

          <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>
              © 2024 Crisak -{' '}
              <a
                className="text-primary hover:underline underline"
                onClick={() => {
                  //@ts-ignore
                  chrome.tabs.create({
                    //@ts-ignore
                    url: chrome.runtime.getURL('app/options.html'),
                  })
                }}
              >
                Opciones de extensión
              </a>{' '}
              -{' '}
              <a href="#" className="text-primary hover:underline">
                Crisak Translate
              </a>
            </p>
          </div>
        </div>
      </AuthProvider>
    </div>
  )
}
