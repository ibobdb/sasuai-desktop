// Types for the cashier feature

// Common types
export type Discount = {
  id: string
  name: string
  valueType: 'percentage' | 'fixed'
  value: number
  discountType: 'product' | 'member'
  minPurchase: number
  startDate: string
  endDate: string
  isActive: boolean
}

// Product related types
export type ProductDiscount = {
  discountId: string
  productId: string
  discount: Discount
}

export type Product = {
  id: string
  name: string
  price: number
  barcode?: string
  currentStock: number
  skuCode?: string
  batches?: Array<{
    id: string
    buyPrice: number
    remainingQuantity: number
  }>
  discountRelationProduct?: ProductDiscount[]
}

export type ProductResponse = {
  data: Array<
    Product & {
      barcode: string | null
      skuCode: string | null
      [key: string]: any
    }
  >
  success: boolean
}

// Cart related types
export type CartItem = Product & {
  quantity: number
  subtotal: number
  batchId?: string
  selectedDiscount?: Discount | null
  discountAmount: number
  finalPrice: number
}

// Member related types
export type Member = {
  id: string
  name: string
  phone: string
  email: string | null
  tierId: string | null
  totalPoints: number
  totalPointsEarned: number
  joinDate: string
  tier: { name?: string; level?: string } | null
  cardId?: string | null
  discountRelationsMember?: MemberDiscount[]
}

export type MemberDiscount = {
  discountId: string
  memberId: string
  discount: Discount
}

export type MemberResponse = {
  data: {
    members: Member[]
    totalCount: number
    totalPages: number
    currentPage: number
  }
  success: boolean
}

// Payment related types
export type PaymentMethod = 'cash' | 'card' | 'e-wallet' | 'qris' | 'transfer' | 'other'

export type TransactionData = {
  cashierId: string
  memberId?: string | null
  items: Array<{
    productId: string
    quantity: number
    batchId?: string
    discountId?: string | null
  }>
  paymentMethod: PaymentMethod
  cashAmount?: number
  selectedMemberDiscountId?: string | null
}

// Component props types
export type TransactionSummaryProps = {
  itemCount: number
  subtotal: number
  productDiscounts: number
  memberDiscount: number
  tax: number
  total: number
  pointsToEarn?: number // Points that will be earned from this transaction
  memberTier?: {
    name: string
    multiplier: number
  } | null // Member tier information with multiplier
}

export type ProductSearchProps = {
  onProductSelect: (product: Product) => void
  autoFocus?: boolean
}

export type CartListProps = {
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
  onUpdateDiscount: (id: string, discount: Discount | null) => void
}

export type MemberSectionProps = {
  onMemberSelect?: (
    member: (Member & { discountRelationsMember?: MemberDiscount[] }) | null
  ) => void
  onMemberDiscountSelect?: (discount: Discount | null) => void
  selectedDiscount: Discount | null
  subtotal?: number
}

export type PaymentSectionProps = {
  total: number
  paymentMethod: PaymentMethod
  paymentAmount: number
  change: number
  onPaymentMethodChange: (method: PaymentMethod) => void
  onPaymentAmountChange: (amount: number) => void
}

export type ActionButtonsProps = {
  onPay: () => Promise<void>
  onClear: () => void
  onPrint: () => void
  isPayEnabled: boolean
  isPrintEnabled: boolean
}

export type CreateMemberDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (member: Member) => void
}
