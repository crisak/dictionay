import * as Schema from '../schemas'

export type RequireFields = 'srcLanguage' | 'toLanguage' | 'term'

export type CreateTermDto = Partial<Omit<Schema.Term, RequireFields>> &
  Pick<Schema.Term, RequireFields>
