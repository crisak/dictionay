/* eslint-disable @typescript-eslint/no-explicit-any */
declare const chrome: {
  storage: {
    local: {
      get: (
        key: string | string[] | object,
        callback: (items: { [key: string]: any }) => void,
      ) => void
      set: (items: object, callback?: () => void) => void
      remove: (keys: string | string[], callback?: () => void) => void
    }
  }
}
