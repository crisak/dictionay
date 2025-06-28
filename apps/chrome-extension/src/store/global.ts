import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import createChromeStorageAdapter from './chrome-storage-adapter'

export type StateAuth = {
  apiKey: string | null
  isAuthenticated: boolean
}

export type State = {
  tags: string[] | null
  listTags: string[] | null
  auth: StateAuth
}

// const setStorage = (key: string, value: State) => {
//   return new Promise((resolve) => {
//     chrome?.storage?.local?.set({ [key]: value }, () => {
//       resolve(value)
//     })
//   })
// }

type Actions = {
  //   increment: (qty: number) => void
  //   decrement: (qty: number) => void
  setAuth: (auth: StateAuth) => void
  setTags: (tags: string[] | null) => void
  setListTags: (listTags: string[] | null) => void
  setStore: (store: State) => void
  clearStore: () => void
}

export const useGlobalStore = create<State & Actions>()(
  persist(
    (set) => ({
      tags: null,
      listTags: null,
      auth: {
        apiKey: null,
        isAuthenticated: false,
      },
      setAuth: (auth) =>
        set((state) => {
          //   setStorage('vocabulary', { ...state, auth })
          return { ...state, auth }
        }),
      setTags: (tags) => set((state) => ({ ...state, tags })),
      setListTags: (listTags) => set((state) => ({ ...state, listTags })),
      clearStore: () =>
        set(() => ({
          tags: null,
          listTags: null,
          auth: {
            apiKey: null,
            isAuthenticated: false,
          },
        })),
      setStore: (store) =>
        set(() => ({
          tags: store.tags,
          listTags: store.listTags,
          auth: {
            apiKey: store.auth.apiKey,
            isAuthenticated: store.auth.isAuthenticated,
          },
        })),
    }),
    {
      name: 'global-storage',
      storage: createJSONStorage(() => createChromeStorageAdapter()),
      // Importante: chrome.storage.local trabaja con async
      // así que necesitamos indicar que usamos storage asíncrono
      onRehydrateStorage: () => {
        // Opcional: callback cuando el estado se restaura
        return (restoredState, error) => {
          if (error) {
            console.error('Error al restaurar el estado:', error)
          } else {
            console.debug('Estado restaurado correctamente:', restoredState)
          }
        }
      },
    },
  ),
)

// const Component = () => {
//   const count = useCountStore((state) => state.count)
//   const increment = useCountStore((state) => state.increment)
//   const decrement = useCountStore((state) => state.decrement)
//   // ...
// }
