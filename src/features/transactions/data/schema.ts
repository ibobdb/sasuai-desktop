import { z } from 'zod'

const transactionPaymentMethodSchema = z.union([
  z.literal('cash'),
  z.literal('card'),
  z.literal('e-wallet'),
  z.literal('qris'),
  z.literal('transfer'),
  z.literal('other'),
  z.literal('debit')
])
export type TransactionPaymentMethod = z.infer<typeof transactionPaymentMethodSchema>

const transactionSchema = z.object({
  id: z.string(),
  cashierName: z.string(),
  memberName: z.string().nullable(),
  totalAmount: z.number(),
  totalDiscountAmount: z.number(),
  finalAmount: z.number(),
  paymentMethod: transactionPaymentMethodSchema,
  itemCount: z.number(),
  pointsEarned: z.number(),
  createdAt: z.coerce.date()
})
export type Transaction = z.infer<typeof transactionSchema>

export const transactionListSchema = z.array(transactionSchema)
