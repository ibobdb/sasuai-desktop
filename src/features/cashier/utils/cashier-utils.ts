import { Discount, CartItem, Product } from '@/types/cashier'

export const isDiscountValid = (discount: Discount, ignoreUsageLimit = false): boolean => {
  if (!discount.isActive) {
    return false
  }

  if (!ignoreUsageLimit && discount.maxUses !== null && discount.maxUses !== undefined) {
    if (discount.usedCount !== undefined && discount.usedCount >= discount.maxUses) {
      return false
    }
  }

  const currentDate = new Date()
  const startDate = new Date(discount.startDate)
  const endDate = new Date(discount.endDate)

  if (currentDate < startDate || currentDate > endDate) {
    return false
  }

  return true
}

export const calculateDiscountAmount = (
  price: number,
  quantity: number,
  discount: Discount | null | undefined
): number => {
  if (!discount) return 0

  const itemTotal = price * quantity

  if (discount.type === 'PERCENTAGE') {
    return itemTotal * (discount.value / 100)
  } else {
    return Math.min(discount.value, itemTotal)
  }
}

export const calculateFinalPrice = (
  price: number,
  quantity: number,
  discount: Discount | null | undefined
): number => {
  const itemTotal = price * quantity
  const discountAmount = calculateDiscountAmount(price, quantity, discount)
  return itemTotal - discountAmount
}

export const formatDiscount = (discount: Discount): string => {
  return discount.type === 'PERCENTAGE'
    ? `${discount.value}%`
    : `Rp ${discount.value.toLocaleString()}`
}

export const isDiscountApplicable = (discount: Discount, subtotal: number): boolean => {
  return !discount.minPurchase || subtotal >= discount.minPurchase
}

export const getExpiryInfo = (product: Product) => {
  if (!product.batches || product.batches.length === 0) {
    return null
  }

  const sortedBatches = [...product.batches].sort(
    (a, b) => new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime()
  )

  const closestExpiry = sortedBatches[0]?.expiryDate
  if (!closestExpiry) return null

  const expiryDate = new Date(closestExpiry)
  const today = new Date()
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  )

  return {
    date: expiryDate,
    daysRemaining: daysUntilExpiry,
    isExpired: daysUntilExpiry < 0,
    isWarning: daysUntilExpiry >= 0 && daysUntilExpiry <= 30,
    formattedDate: expiryDate.toLocaleDateString()
  }
}

export const hasActiveDiscounts = (product: Product): boolean => {
  return (product.discounts || []).some((discount) => isDiscountValid(discount, false))
}

export const getBestDiscount = (product: Product): Discount | null => {
  const validDiscounts = (product.discounts || []).filter((discount) =>
    isDiscountValid(discount, false)
  )

  if (validDiscounts.length === 0) return null

  return validDiscounts.reduce((best, current) => {
    if (current.type === 'PERCENTAGE' && best.type === 'PERCENTAGE') {
      return current.value > best.value ? current : best
    } else if (current.type === 'FIXED_AMOUNT' && best.type === 'FIXED_AMOUNT') {
      return current.value > best.value ? current : best
    } else if (current.type === 'PERCENTAGE') {
      return current
    } else {
      return best
    }
  })
}

export const getStockStatus = (stock: number) => {
  if (stock <= 0) {
    return { status: 'out-of-stock', color: 'text-red-600', label: 'Out of Stock' }
  } else if (stock <= 10) {
    return { status: 'low-stock', color: 'text-yellow-600', label: 'Low Stock' }
  } else {
    return { status: 'in-stock', color: 'text-green-600', label: 'In Stock' }
  }
}

export const validateCartItemStock = (
  cartItems: CartItem[]
): { isValid: boolean; invalidItem?: CartItem } => {
  const invalidItem = cartItems.find((item) => item.quantity > (item.currentStock || 0))

  return {
    isValid: !invalidItem,
    invalidItem
  }
}

export const calculateCartTotals = (cartItems: CartItem[]) => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0)
  const productDiscountsTotal = cartItems.reduce((sum, item) => sum + item.discountAmount, 0)
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return {
    subtotal,
    productDiscountsTotal,
    totalItems
  }
}

export const validatePaymentAmount = (paymentAmount: number, total: number): boolean => {
  return paymentAmount >= total
}

export const validateDiscountMinimumPurchase = (discount: Discount, subtotal: number): boolean => {
  if (!discount.minPurchase) return true
  return subtotal >= discount.minPurchase
}

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value)
}

export const showValidationError = (message: string, description?: string) => {
  console.error('Validation Error:', { message, description })
}
