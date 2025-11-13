export interface ResponseRebuildTerms {
  message: string
  list: Term[]
}

export interface Term {
  _id: string
  term: string
  translation: string
  srcLanguage: string
  toLanguage: string
  types: string[]
  isSentence: boolean
  pronunciation: Pronunciation
  examples: Example[]
  tags: string[]
  dictionary: Dictionary[]
  level: string
  image: string
  audio: string
  createdAt: Date
  updatedAt: Date
}

interface Dictionary {
  type: string
  baseTerm: string
  entries: Entry[]
}

interface Entry {
  translation: string
  reverseTranslation: string[]
}

interface Example {
  sentence: string
  sentenceNative: string
}

interface Pronunciation {
  phonetic: string
  nativePhonetic: string
  nativePhoneticDetails: string
}
