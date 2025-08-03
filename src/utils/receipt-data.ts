import { TransactionDetail } from '@/types/transactions'
import { StoreInfo } from '@/types/settings'

// Helper function to format payment method
function formatPaymentMethod(paymentMethod?: string): string {
  if (!paymentMethod) return 'Cash'
  return paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1).replace(/[_-]/g, ' ')
}

export interface ReceiptData {
  storeInfo: StoreInfo
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
    discounts: {
      product: number
      member: number
      tier: number
      global: number
      total: number
    }
    finalAmount: number
    paymentAmount: number
    change: number
  }
  payment: {
    method: string
  }
  pointsEarned?: number
}

export function generateReceiptData(
  transactionDetail: TransactionDetail,
  storeInfo?: StoreInfo
): ReceiptData {
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

  // Use provided store info or default
  const receiptStoreInfo: StoreInfo = storeInfo || {
    name: 'Sasuai Store',
    address: 'Jl. Contoh No. 123, Jakarta',
    phone: '021-12345678'
  }

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

  // Pricing - Calculate different discount types
  const calculateDiscounts = () => {
    // Calculate product discounts from items
    const productDiscount = items.reduce((sum, item) => {
      return sum + (item.discountApplied?.amount || 0)
    }, 0)

    // Get transaction-level discount
    const transactionDiscount = pricing?.discounts

    let memberDiscount = 0
    let tierDiscount = 0
    let globalDiscount = 0

    if (transactionDiscount) {
      if (transactionDiscount.isGlobal) {
        globalDiscount = transactionDiscount.amount || 0
      } else if (transactionDiscount.applyTo === 'SPECIFIC_MEMBERS') {
        memberDiscount = transactionDiscount.amount || 0
      } else if (transactionDiscount.applyTo === 'SPECIFIC_MEMBER_TIERS') {
        tierDiscount = transactionDiscount.amount || 0
      }
    }

    const totalDiscount = productDiscount + memberDiscount + tierDiscount + globalDiscount

    return {
      product: productDiscount,
      member: memberDiscount,
      tier: tierDiscount,
      global: globalDiscount,
      total: totalDiscount
    }
  }

  const receiptPricing = {
    subtotal: pricing?.originalAmount || 0,
    discounts: calculateDiscounts(),
    finalAmount: Math.abs(pricing?.finalAmount || 0),
    paymentAmount: Number(payment?.amount || 0),
    change: Number(payment?.change || 0)
  }

  // Payment
  const receiptPayment = {
    method: formatPaymentMethod(paymentMethod)
  }

  return {
    storeInfo: receiptStoreInfo,
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
