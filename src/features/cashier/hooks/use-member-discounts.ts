import { useState, useCallback } from 'react'
import { Member, Discount } from '@/types/cashier'
import { isDiscountValid } from '../utils/cashier-utils'

export interface UseMemberDiscountsReturn {
  selectedMember: Member | null
  selectedMemberDiscount: Discount | null
  selectedTierDiscount: Discount | null
  handleMemberSelect: (member: Member | null) => void
  handleMemberDiscountSelect: (discount: Discount | null) => void
  clearMemberData: () => void
  getAvailableMemberDiscounts: () => Discount[]
  getAvailableTierDiscounts: () => Discount[]
}

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

    if (member) {
      // Check if member has personal discounts
      const memberDiscounts = member.discounts || []

      // Check if tier has discounts
      const tierDiscounts = member.tier?.discounts || []

      // Auto-select member personal discount if only one is available
      if (memberDiscounts.length === 1) {
        setSelectedMemberDiscount(memberDiscounts[0])
      }
      // Otherwise, auto-select tier discount if only one is available
      else if (tierDiscounts.length === 1) {
        setSelectedTierDiscount(tierDiscounts[0])
      }
    }
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
