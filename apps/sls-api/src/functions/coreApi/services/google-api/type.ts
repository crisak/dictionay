export interface TranslateResultDto {
  translation: string
  sentences: SentenceDto[]
  bilingualDictionary: BilingualDictionaryDto[]
  detectedLanguages: DetectedLanguagesDto
  sourceLanguage: string
}

export interface BilingualDictionaryDto {
  pos: string
  entry: Entry[]
  baseForm: string
  posEnum: number
}

export interface Entry {
  word: string
  reverseTranslation: string[]
  score: number
}

export interface DetectedLanguagesDto {
  srclangs: string[]
  srclangsConfidences: number[]
  extendedSrclangs: string[]
}

export interface SentenceDto {
  trans: string
  orig: string
  backend: string
}
