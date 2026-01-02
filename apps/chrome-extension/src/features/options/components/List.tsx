/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react-hooks/exhaustive-deps */
import { toast } from 'sonner'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Search,
  Check,
  RefreshCcw,
  TrashIcon,
  RefreshCwIcon,
  Wrench,
  Cog,
} from 'lucide-react'
import { Avatar, Button, Input, MultiSelect } from '../../../components/ui'
import { useFetchTerms } from '../../../hooks'
import { Text } from '../../../utils'
import { CardVocabulary } from '../../../types'
import Pagination from '../../../components/Pagination'
import { useFetchTags } from '../../../hooks/useFetchTags'
import TagOption from './TagOption'

export default function List() {
  const tabs = ['Both', 'Anki', 'Dictionary'] as const

  // Read initial values from URL params (memoized to avoid re-reading on every render)
  const initialParams = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search)
    return {
      search: urlParams.get('search') || '',
      tags: urlParams.get('tags')?.split(',').filter(Boolean) || [],
      page: parseInt(urlParams.get('page') || '1') || 1,
    }
  }, [])

  const [searchTerm, setSearchTerm] = useState(initialParams.search)
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Both')
  const [showUnsync, setShowUnsync] = useState(false)
  const [filterTags, setFilterTags] = useState<string[]>(initialParams.tags)
  const req = useFetchTerms()
  const reqTags = useFetchTags()
  const isInitialMount = useRef(true)

  // Function to update URL params
  const updateURLParams = (params: {
    search?: string
    tags?: string[]
    page?: number
  }) => {
    const urlParams = new URLSearchParams(window.location.search)

    if (params?.search !== undefined) {
      if (params.search) {
        urlParams.set('search', params.search)
      } else {
        urlParams.delete('search')
      }
    }

    if (params.tags !== undefined) {
      if (params.tags.length > 0) {
        urlParams.set('tags', params.tags.join(','))
      } else {
        urlParams.delete('tags')
      }
    }

    if (params.page !== undefined) {
      if (params.page > 1) {
        urlParams.set('page', params.page.toString())
      } else {
        urlParams.delete('page')
      }
    }

    const newUrl = `${window.location.pathname}${urlParams.toString() ? '?' + urlParams.toString() : ''}`
    window.history.pushState({}, '', newUrl)
  }

  const handlePageChange = async (page: number, limit?: number) => {
    updateURLParams({ page })
    await req.fetchTerms(page, limit, {
      tags: filterTags,
      search: searchTerm,
    })
  }

  const tags = useMemo(() => {
    const tags = reqTags.tags.map((item) => item.tag).filter(Boolean)

    return tags
  }, [reqTags.tags])

  const filteredItems = useMemo(() => {
    let itemsFilter = req.cards

    if (Text.cls(activeTab) === Text.cls('Anki')) {
      itemsFilter = req.cardsAnki
    }

    if (Text.cls(activeTab) === Text.cls('Dictionary')) {
      itemsFilter = req.cardsDictionary
    }

    if (showUnsync) {
      itemsFilter = itemsFilter.filter((item_) => !item_.sync)
    }

    return itemsFilter
  }, [req.cards, activeTab, showUnsync])

  useEffect(() => {
    if (isInitialMount.current) {
      req.fetchTerms(initialParams.page, undefined, {
        tags: initialParams.tags,
        search: initialParams.search,
      })

      reqTags.fetch()
      isInitialMount.current = false
    }
  }, [initialParams, req, reqTags])

  useEffect(() => {
    if (req.error?.description) {
      toast.error(req.error.title, {
        description: req.error.description,
      })
    }

    if (reqTags.error?.description) {
      toast.error(reqTags.error.title, {
        description: reqTags.error.description,
      })
    }
  }, [req.error, reqTags.error])

  return (
    <>
      <div className="container mx-auto px-6 pt-8 max-w-4xl sticky top-0 bg-[#0b1006] backdrop-blur-xl z-10 flex flex-col gap-5">
        <div className="info">
          <fieldset className="border border-primary/20 p-4 rounded-lg">
            <legend className="text-primary">Information</legend>
            <div className="flex justify-between text-sm">
              <ul className="text-third flex items-center gap-4">
                <li>
                  <span>Dictionary:</span>
                  <span className="text-primary ml-1">
                    {req.cardsDictionary.length}
                  </span>
                </li>
                <li>
                  <span>Anki:</span>
                  <span className="text-primary ml-1">
                    {req.cardsAnki.length}
                  </span>
                </li>

                <li>
                  <span>Pending sync:</span>
                  <span className="text-primary ml-1">
                    {filteredItems.filter((item) => !item.sync).length}
                  </span>
                </li>
              </ul>

              <div className="flex gap-2">
                <Button
                  size="small"
                  variant="solid"
                  onClick={() => {
                    toast.promise(req.syncConfigToAnki(), {
                      loading: 'Cargando...',
                      error: (error) => {
                        return (
                          <div>
                            <strong>{error.title}: </strong> {error.description}
                            <details>
                              <summary>Ver detalle</summary>

                              <div className="overflow-x-auto bg-red-500/10 p-2 rounded-lg">
                                <pre>
                                  <code>{error.details}</code>
                                </pre>
                              </div>
                            </details>
                          </div>
                        )
                      },
                      success: () => {
                        return 'The configuration has been synchronized with Anki'
                      },
                    })
                  }}
                  className="group"
                >
                  <Cog className="w-[18px] h-[18px] group-hover:animate-spin duration-500" />
                </Button>

                <Button
                  size="small"
                  variant="solid"
                  onClick={() => {
                    req.fetchTerms(undefined, undefined, {
                      tags: filterTags,
                      search: searchTerm,
                    })

                    reqTags.fetch()
                  }}
                  className="group"
                >
                  <RefreshCwIcon className="w-[18px] h-[18px] group-hover:animate-spin duration-500" />
                </Button>

                <Button
                  size="small"
                  variant="solid"
                  disabled={(() => {
                    if (activeTab !== 'Both') {
                      return true
                    }

                    const termWithoutSync = filteredItems.filter(
                      (item) => !item.sync,
                    )

                    return termWithoutSync.length === 0
                  })()}
                  onClick={(event) => {
                    const termWithoutSync = filteredItems.filter(
                      (item) => !item.sync,
                    )

                    //@ts-ignore
                    event.target['disabled'] = true

                    toast.promise(req.addTermsToAnki(termWithoutSync), {
                      loading: 'Cargando...',
                      error: (error) => {
                        return (
                          <div>
                            <strong>{error.title}: </strong> {error.description}
                            <details>
                              <summary>Ver detalle</summary>

                              <div className="overflow-x-auto bg-red-500/10 p-2 rounded-lg">
                                <pre>
                                  <code>{error.details}</code>
                                </pre>
                              </div>
                            </details>
                          </div>
                        )
                      },
                      success: () => {
                        return (
                          <>
                            Se han sincronizado{' '}
                            <strong>{termWithoutSync.length} términos</strong>{' '}
                            con Anki
                          </>
                        )
                      },
                      finally: () => {
                        //@ts-ignore
                        event.target['disabled'] = false
                      },
                    })
                  }}
                >
                  Sincronizar todo
                </Button>
              </div>
            </div>
          </fieldset>
        </div>

        <details className="info">
          <summary className="text-primary text-lg hover:cursor-pointer">
            Filtros
          </summary>
          <section className="filters mt-4 flex flex-col gap-6 border border-primary/20 px-5 py-7 rounded-md bg-card">
            <div className="relative">
              <Input
                type="text"
                size="small"
                placeholder="Buscar término o respuesta..."
                className="pl-10 pr-4 py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={20}
              />
            </div>

            <MultiSelect
              options={tags}
              values={filterTags}
              onChange={(selectedTags) => {
                setFilterTags(selectedTags)
              }}
            />

            <div className="flex items-center">
              <input
                type="checkbox"
                id="showUnsync"
                className="w-5 h-5 text-primary rounded-lg focus:ring-primary ring-secondary focus:ring-2 border-primary accent-primary"
                checked={showUnsync}
                onChange={() => setShowUnsync(!showUnsync)}
              />
              <label htmlFor="showUnsync" className="text-sm text-third ml-3">
                Show values not sync
              </label>
            </div>
            <div className="flex justify-end">
              <Button
                size="small"
                variant="solid"
                onClick={() => {
                  updateURLParams({
                    search: searchTerm,
                    tags: filterTags,
                    page: 1,
                  })
                  req.fetchTerms(1, undefined, {
                    tags: filterTags,
                    search: searchTerm,
                  })
                }}
              >
                Apply changes
              </Button>
            </div>
          </section>
        </details>

        <div className="flex justify-between flex-wrap items-center border-b border-b-primary/20">
          <div>
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`px-4 py-2 ${
                  activeTab === tab
                    ? 'border-b-2 border-primary text-primary'
                    : 'text-white/70'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
          {/* call component Pagination */}
          {(activeTab === 'Dictionary' || activeTab === 'Both') && (
            <Pagination
              pagination={req.pagination}
              onPageChange={handlePageChange}
            />
          )}
        </div>
      </div>

      <ul className="text-third shadow rounded-lg divide-y z-0">
        {(req.loading.ankiTerms || req.loading.dictionaryTerms) && (
          <div className="animate-pulse h-1 bg-primary/100 rounded"></div>
        )}
        {filteredItems.map((item) => {
          return (
            <li
              key={item.id}
              className={`py-2 px-5 flex items-center gap-4 ${
                !item.sync && activeTab === 'Both'
                  ? 'bg-red-500/10 border-red-500/50'
                  : 'border-none'
              }`}
            >
              <Avatar src={item.image} alt={item.term} />

              <div className="flex-grow">
                <h4>{Text.capitalize(item.term)}</h4>

                <p className="text-third/60 text-xs">
                  {Text.capitalize(item.nativeTranslation)}
                  <span className="ml-2 tags">
                    {item.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="bg-primary/10 tex-white/60 rounded-full px-2 py-[2px] text-xs ml-1"
                      >
                        {tag}
                      </span>
                    ))}
                  </span>
                  {/* separator */}

                  {/* <span className="ml-2 separator text-primary/20 font-bold">
                    |
                  </span> */}

                  {/* <span className="ml-2 types">
                    {!hasExampleSentence && (
                      <span className="bg-red-600/40 tex-white/60 rounded-full px-1 py-[2px] text-xs ml-1">
                        Without example
                      </span>
                    )}
                  </span> */}
                </p>
              </div>

              {activeTab === 'Anki' && (
                <div className="flex gap-2">
                  <button
                    className="border border-red-500/20 rounded-md p-2 hover:bg-red-500/10 dark:hover:bg-red-500/20 group"
                    onClick={(eventButton) => {
                      //@ts-ignore
                      eventButton.target['disabled'] = true

                      toast.promise(req.removeTermToAnki(item.id, item.term), {
                        loading: 'Cargado...',
                        error: (error) => {
                          //@ts-ignore
                          eventButton.target['disabled'] = false

                          return (
                            <div>
                              <strong>{error.title}: </strong>{' '}
                              {error.description}
                              <details>
                                <summary>Ver detalle</summary>

                                <div className="overflow-x-auto bg-red-500/10 p-2 rounded-lg">
                                  <pre>
                                    <code>{error.details}</code>
                                  </pre>
                                </div>
                              </details>
                            </div>
                          )
                        },
                        success: () => {
                          return (
                            <>
                              <strong>{Text.capitalize(item.term)}</strong> ha
                              sido eliminado
                            </>
                          )
                        },
                      })
                    }}
                  >
                    <TrashIcon
                      className="text-red-500 group-hover:animate-pulse duration-500"
                      size={18}
                    />
                  </button>
                </div>
              )}

              {activeTab === 'Both' &&
                (item.sync ? (
                  <Check className="text-primary" size={18} />
                ) : (
                  <button
                    className="border border-blue-500/20 rounded-md p-2 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 group"
                    onClick={(eventButton) => {
                      const body: CardVocabulary = {
                        id: item.id,
                        term: item.term,
                        nativeTranslation: item.nativeTranslation,
                        image: item.image,
                        audio: item.audio,
                        tags: item.tags || [],
                        sync: true,
                        detail: '',
                        exampleSentence: item.exampleSentence || '',
                        exampleSentenceTranslation:
                          item.exampleSentenceTranslation || '',
                        nativePronunciationGuide:
                          item.nativePronunciationGuide || '',
                        nativeTranslationAlternatives:
                          item.nativeTranslationAlternatives || [],
                        phoneticSymbols: item.phoneticSymbols || '',
                        type: item.type || [],
                      }

                      //@ts-ignore
                      eventButton.target['disabled'] = true

                      toast.promise(req.addTermToAnki(body), {
                        loading: 'Cargado...',
                        error: (error) => {
                          //@ts-ignore
                          eventButton.target['disabled'] = false

                          return (
                            <div>
                              <strong>{error.title}: </strong>{' '}
                              {error.description}
                              <details>
                                <summary>Ver detalle</summary>

                                <div className="overflow-x-auto bg-red-500/10 p-2 rounded-lg">
                                  <pre>
                                    <code>{error.details}</code>
                                  </pre>
                                </div>
                              </details>
                            </div>
                          )
                        },
                        success: () => {
                          return (
                            <>
                              <strong>{Text.capitalize(body.term)}</strong> ha
                              sido sincronizado con Anki
                            </>
                          )
                        },
                      })
                    }}
                  >
                    <RefreshCcw
                      className="text-blue-500 group-hover:animate-spin duration-500"
                      size={18}
                    />
                  </button>
                ))}
              {/* !item?.exampleSentence */}
              {activeTab === 'Dictionary' && (
                <div className="flex items-center gap-1">
                  <div className="flex gap-1 w-[170px] h-[20px]">
                    <TagOption
                      show={!item?.exampleSentence}
                      title="example sentence"
                    >
                      ex
                    </TagOption>
                    <TagOption
                      show={!item?.nativePronunciationGuide}
                      title="native pronunciation guide"
                    >
                      pr
                    </TagOption>
                    <TagOption
                      show={!item?.phoneticSymbols}
                      title="phonetic symbols"
                    >
                      ph
                    </TagOption>
                    <TagOption show={!item?.type?.length} title="type">
                      ty
                    </TagOption>
                  </div>
                  <button
                    className="border border-blue-500/20 rounded-md p-2 hover:bg-blue-500/10 dark:hover:bg-blue-500/20 group ml-1"
                    onClick={(eventButton) => {
                      //@ts-ignore
                      eventButton.target['disabled'] = true

                      toast.promise(req.fetchRebuildTerm(item.id, item.term), {
                        loading: 'Cargado...',
                        error: (error) => {
                          //@ts-ignore
                          eventButton.target['disabled'] = false

                          return (
                            <div>
                              <strong>{error.title}: </strong>{' '}
                              {error.description}
                              <details>
                                <summary>See details</summary>

                                <div className="overflow-x-auto bg-red-500/10 p-2 rounded-lg">
                                  <pre>
                                    <code>{error.details}</code>
                                  </pre>
                                </div>
                              </details>
                            </div>
                          )
                        },
                        success: () => {
                          //@ts-ignore
                          eventButton.target['disabled'] = false

                          req.fetchTerms(undefined, undefined, {
                            tags: filterTags,
                            search: searchTerm,
                          })

                          return (
                            <>
                              <strong>{Text.capitalize(item.term)}</strong> has
                              been updated
                            </>
                          )
                        },
                      })
                    }}
                  >
                    <Wrench
                      className="text-blue-500 group-hover:animate-pulse duration-500"
                      size={18}
                    />
                  </button>
                  <button
                    className="border border-red-500/20 rounded-md p-2 hover:bg-red-500/10 dark:hover:bg-red-500/20 group ml-1"
                    onClick={(eventButton) => {
                      //@ts-ignore
                      eventButton.target['disabled'] = true

                      toast.promise(req.removeTermApi(item.id, item.term), {
                        loading: 'Cargado...',
                        error: (error) => {
                          //@ts-ignore
                          eventButton.target['disabled'] = false

                          return (
                            <div>
                              <strong>{error.title}: </strong>{' '}
                              {error.description}
                              <details>
                                <summary>Ver detalle</summary>

                                <div className="overflow-x-auto bg-red-500/10 p-2 rounded-lg">
                                  <pre>
                                    <code>{error.details}</code>
                                  </pre>
                                </div>
                              </details>
                            </div>
                          )
                        },
                        success: () => {
                          return (
                            <>
                              <strong>{Text.capitalize(item.term)}</strong> ha
                              sido eliminado
                            </>
                          )
                        },
                      })
                    }}
                  >
                    <TrashIcon
                      className="text-red-500 group-hover:animate-pulse duration-500"
                      size={18}
                    />
                  </button>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}
