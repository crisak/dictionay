export interface ResultNoteInfo {
  noteId: number
  profile: string
  tags: string[]
  fields: Fields
  modelName: string
  mod: number
  cards: number[]
}

export interface Fields {
  Front: FieldValue
  Image: FieldValue
  Back: FieldValue
  Example: FieldValue
  Audio: FieldValue
  ExampleNative: FieldValue
  Phonetic: FieldValue
  PhoneticNative: FieldValue
  PhoneticNativeDetails: FieldValue
  AlternativesNative: FieldValue
  Type: FieldValue
}

export interface FieldValue {
  value: string
  order: number
}

// Nuevas interfaces para tipado
export interface ModelTemplate {
  Name: string
  Front: string
  Back: string
}

export interface ModelStructure {
  modelName: string
  inOrderFields: string[]
  css: string
  cardTemplates: ModelTemplate[]
}

export interface AnkiConnectResponse<T> {
  result: T
  error: string | null
}

export interface ExtractedTemplates {
  front: string
  back: string
  css: string
}
