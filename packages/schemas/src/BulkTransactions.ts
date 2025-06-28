import { z } from 'zod'

const TransactionTypeSchema = z.enum(['income', 'expense'])

const TransactionSchema = z.object({
  amount: z.number().positive(),
  date: z.string(),
  description: z.string().min(1).optional(),
  type: TransactionTypeSchema,
  categoryId: z.string(),
  paymentMethodId: z.string(),
})

const BulkTransactionsSchema = z.array(TransactionSchema).min(1).max(100)

type Transaction = z.infer<typeof TransactionSchema>

type BulkTransactions = z.infer<typeof BulkTransactionsSchema>

export {
  TransactionSchema,
  BulkTransactionsSchema,
  TransactionTypeSchema,
  type Transaction,
  type BulkTransactions,
}

