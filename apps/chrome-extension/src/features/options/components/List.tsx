/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react-hooks/exhaustive-deps */
import { toast } from 'sonner'

import { useEffect, useMemo, useState } from 'react'
import {
  Search,
  Check,
  RefreshCcw,
  TrashIcon,
  RefreshCwIcon,
  Cog,
} from 'lucide-react'
import { Avatar, Button, Input, MultiSelect } from '../../../components/ui'
import { useFetchTerms } from '../../../hooks'
import { Text } from '../../../utils'
import { CardVocabulary } from '../../../types'
import Pagination from '../../../components/Pagination'

export default function List() {
  const tabs = ['Both', 'Anki', 'Dictionary'] as const

  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Both')
  const [showUnsync, setShowUnsync] = useState(false)
  const [filterTags, setFilterTags] = useState<string[]>([])
  const req = useFetchTerms()

  const handlePageChange = async (page: number, limit?: number) => {
    await req.fetchTerms(page, limit, {
      tags: filterTags,
    })
  }

  const tags = useMemo(() => {
    /**
     * Filtrar los tags en un solo array y por cada tag debe devolver el total de veces que se repite
     */
    const tags = req.cards
      .map((card) => card.tags || [])
      .flat()
      .filter(Boolean)
      .reduce(
        (acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

    return Object.entries(tags).map(([tag]) => tag)
  }, [req.cards])

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

    if (filterTags.length) {
      itemsFilter = itemsFilter.filter((item_) =>
        item_.tags?.some((tag) => filterTags.includes(tag)),
      )
    }

    return itemsFilter.filter((item_) => {
      const termino = Text.cls(item_.term, {
        spaces: false,
      })

      const search = Text.cls(searchTerm, {
        spaces: false,
      })

      return termino.includes(search)
    })
  }, [req.cards, searchTerm, activeTab, showUnsync, filterTags])

  useEffect(() => {
    console.debug('options > <List /> useEffect[]')
    req.fetchTerms(undefined, undefined, {
      tags: filterTags,
    })
  }, [])

  useEffect(() => {
    if (req.error?.description) {
      toast.error(req.error.title, {
        description: req.error.description,
      })
    }
  }, [req.error])

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
                  onClick={() =>
                    req.fetchTerms(undefined, undefined, {
                      tags: filterTags,
                    })
                  }
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
                Mostrar valores no sincronizados
              </label>
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
          const invalidFields = [
            {
              label: 'Without example',
              condition: Boolean(item?.exampleSentence?.trim()),
            },
            {
              label: 'Without phonetic symbols',
              condition: Boolean(item?.phoneticSymbols?.trim()),
            },
            { label: 'Without type', condition: Boolean(item?.type?.length) },
          ].filter((field) => !field.condition)

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
                  {invalidFields.length > 0 && (
                    <span className="ml-2 separator text-primary/20 font-bold">
                      |
                    </span>
                  )}
                  <span className="ml-2 invalid-fields">
                    {invalidFields.map((field) => (
                      <span
                        key={field.label}
                        className="bg-red-600/40 tex-white/60 rounded-full px-1 py-[2px] text-xs ml-1"
                      >
                        {field.label}
                      </span>
                    ))}
                  </span>
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

              {activeTab === 'Dictionary' && (
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
              )}
            </li>
          )
        })}
      </ul>
    </>
  )
}
