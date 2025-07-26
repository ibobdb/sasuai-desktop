import { useState, useCallback } from 'react'
import { Member, Discount, UseMemberDiscountsReturn } from '@/types/cashier'
import { isDiscountValid } from '../utils/cashier-utils'

export function useMemberDiscounts(): UseMemberDiscountsReturn {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [selectedMemberDiscount, setSelectedMemberDiscount] = useState<Discount | null>(null)
  const [selectedTierDiscount, setSelectedTierDiscount] = useState<Discount | null>(null)

  const handleMemberSelect = useCallback((member: Member | null) => {
    setSelectedMember(member)

    setSelectedMemberDiscount(null)
    setSelectedTierDiscount(null)
  }, [])

  const handleMemberDiscountSelect = useCallback(
    (discount: Discount | null) => {
      if (!selectedMember) return

      const isTierDiscount = selectedMember.tier?.discounts?.some((d) => d.id === discount?.id)

      if (isTierDiscount) {
        setSelectedTierDiscount(discount)
        setSelectedMemberDiscount(null)
      } else {
        setSelectedMemberDiscount(discount)
        setSelectedTierDiscount(null)
      }
    },
    [selectedMember]
  )

  const clearMemberData = useCallback(() => {
    setSelectedMember(null)
    setSelectedMemberDiscount(null)
    setSelectedTierDiscount(null)
  }, [])

  const getAvailableMemberDiscounts = useCallback((): Discount[] => {
    if (!selectedMember) return []
    return (selectedMember.discounts || []).filter((discount) => isDiscountValid(discount, false))
  }, [selectedMember])

  const getAvailableTierDiscounts = useCallback((): Discount[] => {
    if (!selectedMember?.tier) return []
    return (selectedMember.tier.discounts || []).filter((discount) =>
      isDiscountValid(discount, false)
    )
  }, [selectedMember])

  return {
    selectedMember,
    selectedMemberDiscount,
    selectedTierDiscount,
    handleMemberSelect,
    handleMemberDiscountSelect,
    clearMemberData,
    getAvailableMemberDiscounts,
    getAvailableTierDiscounts
  }
}
