import { TransactionDetail } from '@/types/transactions'

// Store info constants to avoid duplication
const DEFAULT_STORE_INFO = {
  name: 'Sasuai Store',
  address: 'Jl. Contoh No. 123, Jakarta',
  phone: '021-12345678'
}

// Helper function to format payment method
function formatPaymentMethod(paymentMethod?: string): string {
  if (!paymentMethod) return 'Cash'
  return paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1).replace(/[_-]/g, ' ')
}

export interface ReceiptData {
  storeInfo: {
    name: string
    address?: string
    phone?: string
  }
  transaction: {
    id: string
    date: string
    cashier: string
    customer: string
    customerTier?: string
  }
  items: Array<{
    name: string
    price: number
    quantity: number
    total: number
    discount?: {
      name: string
      amount: number
    }
  }>
  pricing: {
    subtotal: number
    productDiscounts: number
    memberDiscount: number
    totalDiscount: number
    finalAmount: number
    paymentAmount: number
    change: number
  }
  payment: {
    method: string
  }
  pointsEarned?: number
}

export function generateReceiptData(transactionDetail: TransactionDetail): ReceiptData {
  const { pricing, cashier, member, items = [], payment } = transactionDetail
  const paymentMethod = payment?.method || transactionDetail.paymentMethod

  const date = new Date(transactionDetail.createdAt)
  const formattedDate = date.toLocaleDateString('id-ID', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  // Store info - you may want to get this from settings
  const storeInfo = DEFAULT_STORE_INFO

  // Items
  const receiptItems = items.map((item) => ({
    name: item.product?.name || 'Unknown Item',
    price: item.product?.price || 0,
    quantity: item.quantity || 0,
    total: item.originalAmount || 0,
    discount: item.discountApplied
      ? {
          name: item.discountApplied.name,
          amount: item.discountApplied.amount
        }
      : undefined
  }))

  // Pricing
  const receiptPricing = {
    subtotal: pricing?.originalAmount || 0,
    productDiscounts: Number(pricing?.discounts?.products || 0),
    memberDiscount: Number(pricing?.discounts?.member?.amount || 0),
    totalDiscount: Number(pricing?.discounts?.total || 0),
    finalAmount: Math.abs(pricing?.finalAmount || 0),
    paymentAmount: Number(payment?.amount || 0),
    change: Number(payment?.change || 0)
  }

  // Payment
  const receiptPayment = {
    method: formatPaymentMethod(paymentMethod)
  }

  return {
    storeInfo,
    transaction: {
      id: transactionDetail.tranId || 'NO-TRANS',
      date: formattedDate,
      cashier: cashier.name,
      customer: member ? member.name : 'Guest',
      customerTier: member?.tier
    },
    items: receiptItems,
    pricing: receiptPricing,
    payment: receiptPayment,
    pointsEarned: transactionDetail.pointsEarned
  }
}
