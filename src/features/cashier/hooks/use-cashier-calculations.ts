import { Discount, CashierCalculations } from '@/types/cashier'

export function useCashierCalculations(
  cartSubtotal: number,
  productDiscountsTotal: number,
  selectedMemberDiscount: Discount | null,
  selectedTierDiscount: Discount | null,
  globalDiscount: Discount | null
): CashierCalculations {
  // Calculate member discount amount if applicable
  const memberDiscountAmount = selectedMemberDiscount
    ? selectedMemberDiscount.type === 'PERCENTAGE'
      ? (cartSubtotal - productDiscountsTotal) * (selectedMemberDiscount.value / 100)
      : Math.min(selectedMemberDiscount.value, cartSubtotal - productDiscountsTotal)
    : 0

  // Calculate tier discount amount if applicable
  const tierDiscountAmount = selectedTierDiscount
    ? selectedTierDiscount.type === 'PERCENTAGE'
      ? (cartSubtotal - productDiscountsTotal) * (selectedTierDiscount.value / 100)
      : Math.min(selectedTierDiscount.value, cartSubtotal - productDiscountsTotal)
    : 0

  // Calculate global discount amount if applicable
  const globalDiscountAmount = globalDiscount
    ? globalDiscount.type === 'PERCENTAGE'
      ? (cartSubtotal - productDiscountsTotal) * (globalDiscount.value / 100)
      : Math.min(globalDiscount.value, cartSubtotal - productDiscountsTotal)
    : 0

  // Only apply one type of discount (member, tier, or global)
  const totalGeneralDiscount =
    memberDiscountAmount > 0
      ? memberDiscountAmount
      : tierDiscountAmount > 0
        ? tierDiscountAmount
        : globalDiscountAmount

  const totalDiscount = productDiscountsTotal + totalGeneralDiscount
  const tax = 0 // Implement tax calculation if needed
  const total = cartSubtotal - totalDiscount

  return {
    subtotal: cartSubtotal,
    productDiscountsTotal,
    memberDiscountAmount,
    tierDiscountAmount,
    globalDiscountAmount,
    totalGeneralDiscount,
    totalDiscount,
    tax,
    total
  }
}
