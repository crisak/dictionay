import { StateStorage } from 'zustand/middleware'

const createChromeStorageAdapter = () => {
  return {
    getItem: async (name: string) => {
      console.debug('getItem', name)
      return new Promise((resolve) => {
        chrome?.storage?.local?.get(name, (result) => {
          resolve(result[name] || null)
        })
      })
    },

    setItem: async (name: string, value: string) => {
      console.debug('setItem', name, value)
      return new Promise<void>((resolve) => {
        const item = { [name]: value }
        chrome?.storage?.local?.set(item, () => {
          resolve()
        })
      })
    },

    removeItem: async (name: string) => {
      console.debug('removeItem', name)
      return new Promise<void>((resolve) => {
        chrome?.storage?.local?.remove(name, () => {
          resolve()
        })
      })
    },
  } as StateStorage
}

export default createChromeStorageAdapter
