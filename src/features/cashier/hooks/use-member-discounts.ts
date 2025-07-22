import { useState, useCallback } from 'react'
import { Member, Discount, UseMemberDiscountsReturn } from '@/types/cashier'
import { isDiscountValid } from '../utils/cashier-utils'

export function useMemberDiscounts(): UseMemberDiscountsReturn {
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [selectedMemberDiscount, setSelectedMemberDiscount] = useState<Discount | null>(null)
  const [selectedTierDiscount, setSelectedTierDiscount] = useState<Discount | null>(null)

  // Handle member selection and their available discounts
  const handleMemberSelect = useCallback((member: Member | null) => {
    setSelectedMember(member)

    // Reset discounts when changing members
    setSelectedMemberDiscount(null)
    setSelectedTierDiscount(null)
  }, [])

  // Handle member discount selection
  const handleMemberDiscountSelect = useCallback(
    (discount: Discount | null) => {
      if (!selectedMember) return

      // Check if this is a tier discount
      const isTierDiscount = selectedMember.tier?.discounts?.some((d) => d.id === discount?.id)

      if (isTierDiscount) {
        setSelectedTierDiscount(discount)
        setSelectedMemberDiscount(null) // Clear member personal discount
      } else {
        setSelectedMemberDiscount(discount)
        setSelectedTierDiscount(null) // Clear tier discount
      }
    },
    [selectedMember]
  )

  // Clear all member data
  const clearMemberData = useCallback(() => {
    setSelectedMember(null)
    setSelectedMemberDiscount(null)
    setSelectedTierDiscount(null)
  }, [])

  // Get available member discounts (filter expired/usage limit only)
  const getAvailableMemberDiscounts = useCallback((): Discount[] => {
    if (!selectedMember) return []
    return (selectedMember.discounts || []).filter((discount) => isDiscountValid(discount, false))
  }, [selectedMember])

  // Get available tier discounts (filter expired/usage limit only)
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
