import { useState, useEffect } from 'react'
import { X, Ticket, Check, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Member, MemberSectionProps, Discount, MemberDiscount } from '@/types/cashier'
import { MemberSearch } from './member-search'

export function MemberSection({
  onMemberSelect,
  onMemberDiscountSelect,
  selectedDiscount,
  subtotal = 0,
  member
}: MemberSectionProps) {
  const [selectedMember, setSelectedMember] = useState<
    (Member & { discountRelationsMember?: MemberDiscount[] }) | null
  >(null)

  useEffect(() => {
    setSelectedMember(member)
  }, [member])

  // Handle member selection and their available discounts
  const handleMemberSelect = (
    member: (Member & { discountRelationsMember?: MemberDiscount[] }) | null
  ) => {
    setSelectedMember(member)

    // Pass to parent component
    if (onMemberSelect) {
      onMemberSelect(member)
    }

    // Reset member discount when changing members
    if (onMemberDiscountSelect) {
      onMemberDiscountSelect(null)
    }

    // Auto-select member discount if only one is available and meets minimum purchase
    if (member?.discountRelationsMember?.length === 1) {
      const memberDiscount = member.discountRelationsMember[0].discount
      if (subtotal >= memberDiscount.minPurchase && onMemberDiscountSelect) {
        onMemberDiscountSelect(memberDiscount)
      }
    }
  }

  // Clear selected member
  const clearMember = () => {
    setSelectedMember(null)
    if (onMemberSelect) {
      onMemberSelect(null)
    }
    if (onMemberDiscountSelect) {
      onMemberDiscountSelect(null)
    }
  }

  // Format discount for display
  const formatDiscount = (discount: Discount) => {
    if (discount.valueType === 'percentage') {
      return `${discount.value}%`
    }
    return `Rp ${discount.value.toLocaleString()}`
  }

  // Check if discount is applicable based on minimum purchase
  const isDiscountApplicable = (discount: Discount) => {
    return subtotal >= discount.minPurchase
  }

  // Get available member discounts
  const getAvailableMemberDiscounts = () => {
    if (!selectedMember?.discountRelationsMember) return []
    return selectedMember.discountRelationsMember
      .filter((relation) => relation.discount.isActive)
      .map((relation) => relation.discount)
  }

  const availableDiscounts = getAvailableMemberDiscounts()
  const hasAvailableDiscounts = availableDiscounts.length > 0

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium flex items-center">
          <UserPlus className="h-4 w-4 mr-2 text-muted-foreground" />
          Member
        </h3>

        {selectedMember && (
          <Button variant="ghost" size="sm" onClick={clearMember} className="h-6 px-2">
            <X className="h-3 w-3 mr-1" /> Clear
          </Button>
        )}
      </div>

      {/* Always show the search component */}
      <MemberSearch onMemberSelect={handleMemberSelect} />

      {/* Only show member details when a member is selected */}
      {selectedMember && (
        <div className="rounded-md border bg-card p-3 shadow-sm">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border">
                <AvatarFallback className="bg-primary/10 text-primary">
                  {selectedMember.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0 sm:hidden">
                <div className="flex items-center justify-between">
                  <p className="font-medium truncate">{selectedMember.name}</p>
                  <Badge
                    variant={selectedMember.tier?.name ? 'default' : 'outline'}
                    className="ml-2"
                  >
                    {selectedMember.tier?.name || 'Regular'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="hidden sm:flex items-center justify-between">
                <p className="font-medium truncate">{selectedMember.name}</p>
                <Badge variant={selectedMember.tier?.name ? 'default' : 'outline'} className="ml-2">
                  {selectedMember.tier?.name || 'Regular'}
                </Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-1 gap-1 sm:gap-0">
                <div className="text-xs text-muted-foreground">
                  <p>{selectedMember.phone}</p>
                  {selectedMember.cardId && (
                    <p className="mt-1">Card ID: {selectedMember.cardId}</p>
                  )}
                </div>
                <div className="flex items-center text-xs">
                  <span className="font-medium text-amber-500">{selectedMember.totalPoints}</span>
                  <span className="text-muted-foreground ml-1">points</span>
                </div>
              </div>

              {/* Member discount dropdown */}
              {hasAvailableDiscounts && (
                <div className="mt-2 pt-2 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Ticket className="h-3 w-3 mr-1" />
                    Member Discount:
                  </span>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={
                          selectedDiscount
                            ? 'text-green-600 border-green-200 hover:bg-green-50 h-7 text-xs w-full sm:w-auto'
                            : 'h-7 text-xs w-full sm:w-auto'
                        }
                      >
                        {selectedDiscount
                          ? `${selectedDiscount.name} (${formatDiscount(selectedDiscount)})`
                          : 'Select discount'}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[280px] sm:w-auto">
                      {availableDiscounts.map((discount) => {
                        const applicable = isDiscountApplicable(discount)
                        return (
                          <DropdownMenuItem
                            key={discount.id}
                            onClick={() => {
                              if (applicable && onMemberDiscountSelect) {
                                onMemberDiscountSelect(discount)
                              } else if (!applicable) {
                                toast.error(
                                  `Minimum purchase of Rp ${discount.minPurchase.toLocaleString()} required`
                                )
                              }
                            }}
                            disabled={!applicable}
                            className={selectedDiscount?.id === discount.id ? 'bg-accent' : ''}
                          >
                            <div className="flex flex-col w-full">
                              <div className="flex items-center justify-between">
                                <span>{discount.name}</span>
                                <span className="ml-2 text-xs">
                                  {selectedDiscount?.id === discount.id && (
                                    <Check className="h-3 w-3 inline mr-1" />
                                  )}
                                  {formatDiscount(discount)}
                                </span>
                              </div>
                              {discount.minPurchase > 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Min. purchase: Rp {discount.minPurchase.toLocaleString()}
                                </p>
                              )}
                            </div>
                          </DropdownMenuItem>
                        )
                      })}

                      {selectedDiscount && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onMemberDiscountSelect && onMemberDiscountSelect(null)}
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50 font-medium"
                          >
                            <X className="h-3.5 w-3.5 mr-1.5" />
                            Remove Discount
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
