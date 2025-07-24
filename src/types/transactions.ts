import { PaymentMethod } from '@/lib/payment-methods'

export interface Entity {
  id: string
  name: string
}

export interface ItemDiscount {
  id?: string
  type: string
  name: string
  valueType: string
  value: number
  amount: number
  discountedAmount: number
}

export interface MemberDiscount {
  id?: string
  type: string
  name: string
  valueType: string
  value: number
  amount: number
}

export interface Discounts {
  member: MemberDiscount | null
  products: number
  total: number
}

export interface Pricing {
  originalAmount: number
  memberDiscount: number
  productDiscounts: number
  totalDiscount: number
  finalAmount: number
  // Legacy support for nested discounts structure
  discounts?: {
    total: number
    product?: number
    member?: {
      id: string
      name: string
      amount: number
    }
    tier?: {
      id: string
      name: string
      amount: number
    }
    global?: {
      code: string
      name: string
      amount: number
    }
  }
}

export interface Payment {
  method: string
  amount: number
  change: number
}

// Transaction list type
export interface Transaction {
  id: string
  tranId: string
  cashier: Entity
  member: Entity | null
  pricing: Pricing
  payment: Payment
  itemCount: number
  pointsEarned: number
  createdAt: string | Date // API returns string, but can be Date after parsing
}

// Transaction detail types
export interface Product {
  name: string
  brand: string
  category: string
  price: number
  unit: string
}

export interface TransactionItem {
  id: string
  product: Product
  quantity: number
  originalAmount: number
  discountApplied: ItemDiscount | null
}

export interface DetailedMember {
  id: string
  name: string
  tier: string
  pointsEarned: number
}

export interface DetailedCashier {
  id: string
  name: string
  email: string
}

export interface TransactionDetail {
  id: string
  tranId: string | null
  cashier: DetailedCashier
  member: DetailedMember | null
  pricing: {
    originalAmount: number
    finalAmount: number
    discounts: {
      total: number
      products?: number // Changed from 'product' to 'products'
      member?: {
        id?: string
        type?: string
        name: string
        valueType?: string
        value?: number
        amount: number
      }
      tier?: {
        id: string
        name: string
        amount: number
      }
      global?: {
        code: string
        name: string
        amount: number
      }
    }
  }
  payment: Payment
  paymentMethod?: PaymentMethod
  items: TransactionItem[]
  pointsEarned: number
  createdAt: Date
}

// Filter types for transactions
export interface TransactionFilterParams {
  page: number
  pageSize: number
  sortField: string
  sortDirection: 'asc' | 'desc'
  search?: string
  cashierId?: string
  memberId?: string
  paymentMethod?: string
  startDate?: Date
  endDate?: Date
  minAmount?: number
  maxAmount?: number
}

export interface TransactionFilterUIState {
  startDate?: Date
  endDate?: Date
  minAmount: string
  maxAmount: string
  search: string
  paymentMethods: string[]
}

export type TransactionsDialogType = 'view'

// Backend transaction response structure
export interface TransactionListResponse {
  success: boolean
  data: {
    transactions: Transaction[]
    pagination: {
      totalCount: number
      totalPages: number
      currentPage: number
      pageSize: number
    }
  }
}

// API response structure for single transaction
export interface TransactionDetailResponse {
  success: boolean
  data: {
    transactionDetails: TransactionDetail
  }
}
