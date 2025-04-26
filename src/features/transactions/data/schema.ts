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

const entitySchema = z.object({
  id: z.string(),
  name: z.string()
})

// Updated for the new structure
const itemDiscountSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  name: z.string(),
  valueType: z.string(),
  value: z.number(),
  amount: z.number(),
  discountedAmount: z.number()
})

const memberDiscountSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  name: z.string(),
  valueType: z.string(),
  value: z.number(),
  amount: z.number()
})

const discountsSchema = z.object({
  member: memberDiscountSchema.nullable(),
  products: z.number(),
  total: z.number()
})

const pricingSchema = z.object({
  originalAmount: z.number(),
  discounts: discountsSchema,
  finalAmount: z.number()
})

const transactionSchema = z.object({
  id: z.string(),
  cashier: entitySchema,
  member: entitySchema.nullable(),
  pricing: pricingSchema,
  paymentMethod: transactionPaymentMethodSchema,
  itemCount: z.number(),
  pointsEarned: z.number(),
  createdAt: z.coerce.date()
})
export type Transaction = z.infer<typeof transactionSchema>

export const paginationSchema = z.object({
  totalCount: z.number(),
  totalPages: z.number(),
  currentPage: z.number(),
  pageSize: z.number()
})
export type Pagination = z.infer<typeof paginationSchema>

export const transactionResponseSchema = z.object({
  transactions: z.array(transactionSchema),
  pagination: paginationSchema
})
export type TransactionResponse = z.infer<typeof transactionResponseSchema>

export const transactionListSchema = z.array(transactionSchema)

// Transaction Detail specific schemas
const productSchema = z.object({
  name: z.string(),
  brand: z.string(),
  category: z.string(),
  price: z.number(),
  unit: z.string()
})

const transactionItemSchema = z.object({
  id: z.string(),
  product: productSchema,
  quantity: z.number(),
  originalAmount: z.number(),
  discountApplied: itemDiscountSchema.nullable()
})

const detailedMemberSchema = z.object({
  id: z.string(),
  name: z.string(),
  tier: z.string(),
  pointsEarned: z.number()
})

const detailedCashierSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string()
})

const transactionDetailSchema = z.object({
  id: z.string(),
  cashier: detailedCashierSchema,
  member: detailedMemberSchema.nullable(),
  pricing: pricingSchema,
  paymentMethod: transactionPaymentMethodSchema,
  items: z.array(transactionItemSchema),
  pointsEarned: z.number(),
  createdAt: z.coerce.date()
})
export type TransactionDetail = z.infer<typeof transactionDetailSchema>

export const transactionDetailResponseSchema = z.object({
  transactionDetails: transactionDetailSchema
})
export type TransactionDetailResponse = z.infer<typeof transactionDetailResponseSchema>
