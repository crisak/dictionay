import { Term } from '../schemas'
import { TranslateResultDto } from '../services/google-api/type'

export const googleApiToTerm = (
  result: TranslateResultDto,
): Pick<Term, 'srcLanguage' | 'isSentence' | 'translation' | 'dictionary'> => {
  const isSentence =
    !result?.bilingualDictionary || result?.bilingualDictionary?.length === 0

  return {
    srcLanguage: result?.detectedLanguages?.srclangs?.[0] || '',
    isSentence,
    translation: result.translation || '',
    dictionary: (result?.bilingualDictionary || []).map((entry) => ({
      type: entry.pos || '',
      baseTerm: entry.baseForm,
      entries: entry.entry.map((item) => ({
        translation: item.word || '',
        reverseTranslation: item.reverseTranslation || [],
      })),
    })),
  }
}
