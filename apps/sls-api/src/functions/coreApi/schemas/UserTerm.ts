import { z } from 'zod'

export const UserTermSchema = z.object({
  _id: z.string(),
  userId: z.string(),
  termId: z.string(),
  addedDate: z.string(),
  lastReviewed: z.string(),
  nextReview: z.string(),
  easeFactor: z.number().nullable(),
  interval: z.number(),
  reviewHistory: z.array(z.any()), // Puedes definir una estructura específica si conoces el formato
  tags: z.array(z.string()),
  isLearned: z.boolean(),
})

// Tipo inferido del esquema
type UserTerm = z.infer<typeof UserTermSchema>

export type { UserTerm }
