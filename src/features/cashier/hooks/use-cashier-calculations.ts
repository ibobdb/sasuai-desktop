import { useMemo } from 'react'
import { Discount, CashierCalculations } from '@/types/cashier'

export function useCashierCalculations(
  cartSubtotal: number,
  productDiscountsTotal: number,
  selectedMemberDiscount: Discount | null,
  selectedTierDiscount: Discount | null,
  globalDiscount: Discount | null
): CashierCalculations {
  return useMemo(() => {
    const memberDiscountAmount = selectedMemberDiscount
      ? selectedMemberDiscount.type === 'PERCENTAGE'
        ? (cartSubtotal - productDiscountsTotal) * (selectedMemberDiscount.value / 100)
        : Math.min(selectedMemberDiscount.value, cartSubtotal - productDiscountsTotal)
      : 0

    const tierDiscountAmount = selectedTierDiscount
      ? selectedTierDiscount.type === 'PERCENTAGE'
        ? (cartSubtotal - productDiscountsTotal) * (selectedTierDiscount.value / 100)
        : Math.min(selectedTierDiscount.value, cartSubtotal - productDiscountsTotal)
      : 0

    const globalDiscountAmount = globalDiscount
      ? globalDiscount.type === 'PERCENTAGE'
        ? (cartSubtotal - productDiscountsTotal) * (globalDiscount.value / 100)
        : Math.min(globalDiscount.value, cartSubtotal - productDiscountsTotal)
      : 0

    const totalGeneralDiscount =
      memberDiscountAmount > 0
        ? memberDiscountAmount
        : tierDiscountAmount > 0
          ? tierDiscountAmount
          : globalDiscountAmount

    const totalDiscount = productDiscountsTotal + totalGeneralDiscount
    const tax = 0
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
  }, [
    cartSubtotal,
    productDiscountsTotal,
    selectedMemberDiscount,
    selectedTierDiscount,
    globalDiscount
  ])
}
