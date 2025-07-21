import { z } from 'zod'

export const TermSchema = z.object({
  // Object ID
  id: z.string(),
  types: z
    .object({
      automatic: z.boolean().optional(),
      value: z.array(z.string()).min(1).max(10).optional(),
    })
    .optional(),

  term: z
    .object({
      automatic: z.boolean().optional(),
      value: z.string().min(1).optional(),
    })
    .optional(),

  translation: z
    .object({
      automatic: z.boolean().optional(),
      value: z.string().min(1).optional(),
    })
    .optional(),

  /** File in base 64 */
  image: z
    .object({
      automatic: z.boolean().optional(),
      value: z.string().optional(),
    })
    .optional(),

  pronunciation: z
    .object({
      automatic: z.boolean().optional(),
      value: z
        .object({
          phonetic: z.string(),
          nativePhonetic: z.string(),
          nativePhoneticDetails: z.string().min(10),
        })
        .optional(),
    })
    .optional(),

  examples: z
    .object({
      automatic: z.boolean().optional(),
      value: z.array(
        z.object({
          sentence: z.string().min(1),
          sentenceNative: z.string().min(1),
        }),
      ),
    })
    .optional(),

  tags: z
    .object({
      automatic: z.boolean().optional(),
      value: z.array(z.string()).optional(),
    })
    .optional(),

  dictionary: z
    .object({
      automatic: z.boolean().optional(),
      value: z
        .array(
          z.object({
            type: z.string().min(1),
            baseTerm: z.string().min(1),
            entries: z.array(
              z.object({
                translation: z.string().min(1),
                reverseTranslation: z.array(z.string().min(1)),
              }),
            ),
          }),
        )
        .optional(),
    })
    .optional(),

  level: z.object({
    automatic: z.boolean().optional(),
    value: z.enum(['a1', 'a2', 'b1', 'b2', 'c1', 'c2']).optional(),
  }),
})

export const BodySchema = z.object({
  terms: z.array(TermSchema).min(1).max(200),
})

export type Term = z.infer<typeof TermSchema>
export type Body = z.infer<typeof BodySchema>
