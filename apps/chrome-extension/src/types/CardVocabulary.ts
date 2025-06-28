export interface CardVocabulary {
  id: string
  term: string
  nativeTranslation: string
  nativeTranslationAlternatives: string[]
  phoneticSymbols: string
  nativePronunciationGuide: string
  exampleSentence: string
  exampleSentenceTranslation: string
  detail: string
  image: string
  audio: string
  sync: boolean
  tags: string[]
  type: string[]
}

// nativeTranslation: ''|
// nativeTranslationAlternatives: [],
// phoneticSymbols: '',
// nativePronunciationGuide: '',
// exampleSentence: '',
// exampleSentenceTranslation: '',
// type: [],
// detail: '',
